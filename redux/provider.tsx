"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, type ReactNode } from "react";
import { Provider } from "react-redux";
import { useAppDispatch, useAppStore } from "./hooks";
import baseApi from "./slices/baseApi";
import { hydrateCart, type PersistedCart } from "./slices/cartSlice";
import { sessionChanged } from "./slices/sessionSlice";
import { makeStore, type AppStore } from "./store";
import type { CartItem } from "./types";

const CART_STORAGE_KEY = "luxol:cart:v2";


const str = (v: unknown) => (typeof v === "string" ? v : "");

function isItem(v: unknown): v is CartItem {
  if (!v || typeof v !== "object") return false;
  const i = v as Record<string, unknown>;
  return (
    typeof i.key === "string" &&
    typeof i.id === "string" &&
    typeof i.slug === "string" &&
    typeof i.name === "string" &&
    typeof i.image === "string" &&
    typeof i.price === "number" &&
    Number.isInteger(i.quantity) &&
    (i.quantity as number) > 0
  );
}

function parseCart(raw: string | null): PersistedCart | null {
  if (!raw) return null;
  try {
    const data = JSON.parse(raw) as Record<string, unknown>;
    const promo = data.promo as Record<string, unknown> | null | undefined;

    return {
      items: Array.isArray(data.items) ? data.items.filter(isItem) : [],
      address: str(data.address),
      phone: str(data.phone),
      deliveryMethod: str(data.deliveryMethod),
      promo:
        promo &&
        typeof promo.code === "string" &&
        typeof promo.percentOff === "number"
          ? { code: promo.code, percentOff: promo.percentOff }
          : null,
    };
  } catch {
    return null;
  }
}

function readStorage() {
  try {
    return window.localStorage.getItem(CART_STORAGE_KEY);
  } catch {
    return null;
  }
}

function CartPersistence() {
  const store = useAppStore();

  useEffect(() => {
    store.dispatch(hydrateCart(parseCart(readStorage())));

    let last = "";
    const unsubscribe = store.subscribe(() => {
      const { cart } = store.getState();
      if (!cart.hydrated) return;

      const persisted: PersistedCart = {
        items: cart.items,
        address: cart.address,
        phone: cart.phone,
        deliveryMethod: cart.deliveryMethod,
        promo: cart.promo,
      };
      const json = JSON.stringify(persisted);
      if (json === last) return;
      last = json;

      try {
        window.localStorage.setItem(CART_STORAGE_KEY, json);
      } catch {
        // Storage can be blocked (private mode); the cart still works in memory.
      }
    });

    function onStorage(e: StorageEvent) {
      if (e.key === CART_STORAGE_KEY) {
        store.dispatch(hydrateCart(parseCart(e.newValue)));
      }
    }
    window.addEventListener("storage", onStorage);

    return () => {
      unsubscribe();
      window.removeEventListener("storage", onStorage);
    };
  }, [store]);

  return null;
}


function SessionSync() {
  const { data, status } = useSession();
  const dispatch = useAppDispatch();
  const accessToken = data?.accessToken ?? null;

  useEffect(() => {
    dispatch(sessionChanged({ status, accessToken }));

    // Signed out: drop anything cached from the previous user
    if (status === "unauthenticated") dispatch(baseApi.util.resetApiState());
  }, [dispatch, status, accessToken]);

  return null;
}


/** Must sit inside next-auth's <SessionProvider>. */
export default function ReduxProvider({ children }: { children: ReactNode }) {
  const [store] = useState<AppStore>(makeStore);

  return (
    <Provider store={store}>
      <CartPersistence />
      <SessionSync />
      {children}
    </Provider>
  );
}
