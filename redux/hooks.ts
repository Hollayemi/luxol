import { useMemo } from "react";
import { useDispatch, useSelector, useStore } from "react-redux";
import {
  addItem,
  clearCart,
  removeItem,
  selectCart,
  selectCartCount,
  selectItemsTotal,
  setAddress,
  setDeliveryMethod,
  setPhone,
  setPromo,
  setQuantity,
} from "./slices/cartSlice";
import type { AppDispatch, AppStore, RootState } from "./store";
import type { CartItem, PromoInfo } from "./types";

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
export const useAppStore = useStore.withTypes<AppStore>();

/** Number of different items in the cart (for the header badge). */
export function useCartCount() {
  return useAppSelector(selectCartCount);
}

/** The cart state, derived totals and ready-to-call actions. */
export function useCart() {
  const cart = useAppSelector(selectCart);
  const itemsTotal = useAppSelector(selectItemsTotal);
  const dispatch = useAppDispatch();

  const actions = useMemo(
    () => ({
      addItem: (item: Omit<CartItem, "key" | "quantity">, quantity = 1) =>
        dispatch(addItem({ item, quantity })),
      removeItem: (key: string) => dispatch(removeItem(key)),
      setQuantity: (key: string, quantity: number) =>
        dispatch(setQuantity({ key, quantity })),
      clear: () => dispatch(clearCart()),
      setAddress: (address: string) => dispatch(setAddress(address)),
      setPhone: (phone: string) => dispatch(setPhone(phone)),
      setDeliveryMethod: (id: string) => dispatch(setDeliveryMethod(id)),
      setPromo: (promo: PromoInfo | null) => dispatch(setPromo(promo)),
    }),
    [dispatch],
  );

  return { ...cart, count: cart.items.length, itemsTotal, ...actions };
}
