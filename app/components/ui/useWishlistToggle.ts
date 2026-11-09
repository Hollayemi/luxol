"use client";

import { useSession } from "next-auth/react";
import useOpenAuth from "@/app/components/auth/useOpenAuth";
import {
  useAddToWishlistMutation,
  useGetWishlistIdsQuery,
  useRemoveFromWishlistMutation,
} from "@/redux/slices/wishlistApi";

export type WishlistToggleResult = "saved" | "removed" | "signin" | "error";

/**
 * Save / unsave one product, backed by the wishlist API. Works anywhere there
 * is a "Save For Later" or heart button:
 *
 *   const wishlist = useWishlistToggle(product.id);
 *   <button onClick={wishlist.toggle} aria-pressed={wishlist.saved}>...</button>
 *
 * Signed-out visitors get the sign in dialog instead (a wishlist belongs to an
 * account). `toggle` says what happened so the caller can show its own message.
 */
export function useWishlistToggle(productId: string) {
  const { status } = useSession();
  const openAuth = useOpenAuth();
  const signedIn = status === "authenticated";

  const ids = useGetWishlistIdsQuery(undefined, { skip: !signedIn });
  const [add, { isLoading: adding }] = useAddToWishlistMutation();
  const [remove, { isLoading: removing }] = useRemoveFromWishlistMutation();

  const saved = signedIn && !!ids.data?.data.productIds.includes(productId);

  async function toggle(): Promise<WishlistToggleResult> {
    if (!signedIn) {
      // Wait for the session to load before asking someone to sign in
      if (status === "loading") return "error";
      openAuth("login");
      return "signin";
    }

    try {
      if (saved) {
        await remove(productId).unwrap();
        return "removed";
      }
      await add({ productId }).unwrap();
      return "saved";
    } catch {
      return "error";
    }
  }

  return { saved, toggle, pending: adding || removing };
}
