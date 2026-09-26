"use client";

import { useSession } from "next-auth/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Provider } from "react-redux";
import { useAppDispatch, useAppStore } from "./hooks";
import baseApi from "./slices/baseApi";
import { cartApi } from "./slices/cartApi";
import { hydrateCart, type PersistedCart } from "./slices/cartSlice";
import { sessionChanged } from "./slices/sessionSlice";
import { makeStore, type AppStore } from "./store";
import type { CartItem, PlaceOrderItem } from "./types";

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
  const store = useAppStore();
  const accessToken = data?.accessToken ?? null;
  const wasAuthenticated = useRef(false);

  useEffect(() => {
    dispatch(sessionChanged({ status, accessToken }));

    if (status === "unauthenticated") {
      // Signed out: drop anything cached from the previous user
      dispatch(baseApi.util.resetApiState());
      wasAuthenticated.current = false;
      return;
    }

    // Just signed in (credentials, Google or a fresh registration all land
    // here): fold whatever was in the guest cart into the account's saved
    // cart. Best-effort — the local cart already has everything it needs
    // to keep working even if this call fails.
    if (status === "authenticated" && !wasAuthenticated.current) {
      wasAuthenticated.current = true;

      const { cart } = store.getState();
      if (cart.items.length > 0) {
        const items: PlaceOrderItem[] = cart.items.map((i) => ({
          productId: i.id,
          quantity: i.quantity,
          variant: i.variant,
        }));

        dispatch(cartApi.endpoints.mergeCart.initiate({ items })).catch(() => {});
      }
    }
  }, [dispatch, status, accessToken, store]);

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