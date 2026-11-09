import type { StorefrontProduct } from "./catalog";

/**
 * Wishlist (customer side): products a signed-in customer saved for later.
 * Shown on /wishlist, and the "Save For Later" button on a product page.
 *
 * A wishlist always belongs to a signed-in account, so every call needs the
 * customer's token. Products come in the same StorefrontProduct shape the
 * shop uses, so prices, promotions, stock and variants always match what the
 * shop shows.
 */

/** A saved product. */
export type WishlistItem = {
  id: string;
  /** ISO, when the customer saved it. Newest first. */
  addedAt: string;
  product: StorefrontProduct;
};

/** GET /wishlist */
export type WishlistList = {
  items: WishlistItem[];
  total: number;
};

/**
 * GET /wishlist/ids
 * Just the saved product ids, cheap enough to ask for on every page so any
 * product can show a filled "Saved" state.
 */
export type WishlistIds = {
  productIds: string[];
};

/** POST /wishlist */
export type AddToWishlistRequest = {
  productId: string;
};

/** DELETE /wishlist/:productId takes the product id (not the item id). */
export type RemoveFromWishlistRequest = string;
