export type CartItem = {
  /** id, or id::variant when the product has variants */
  key: string;
  id: string;
  slug: string;
  name: string;
  /** Price of ONE unit (display only; the server prices the order) */
  price: number;
  image: string;
  quantity: number;
  variant?: string;
};

export type PromoInfo = {
  code: string;
  percentOff: number;
};

export type CartState = {
  items: CartItem[];
  address: string;
  phone: string;
  deliveryMethod: string;
  promo: PromoInfo | null;
  /** true once the saved cart has been loaded from localStorage */
  hydrated: boolean;
};

export type ValidatePromoRequest = {
  code: string;
  itemsTotal: number;
};

export type PlaceOrderItem = {
  productId: string;
  quantity: number;
  variant?: string;
};

export type PlaceOrderRequest = {
  items: PlaceOrderItem[];
  address: string;
  phone: string;
  deliveryMethod: string;
  promoCode?: string;
};

export type OrderResponse = {
  id: number | string;
  /** Shown to the customer, e.g. "LX-10482" */
  orderNumber: string;
};

/* ------------------------------------------------------------------ */
/* Server-side cart (sync across devices, and for a signed-in user's    */
/* abandoned-cart recovery). Line items reuse PlaceOrderItem's shape —  */
/* the server always re-derives name/price/image from its own catalog. */
/* ------------------------------------------------------------------ */

export type ServerCart = {
  items: PlaceOrderItem[];
  address: string;
  phone: string;
  deliveryMethod: string;
  promo: PromoInfo | null;
  updatedAt: string;
};

/** PUT /cart — replaces the account's saved cart with the client's. */
export type SyncCartRequest = {
  items: PlaceOrderItem[];
  address?: string;
  phone?: string;
  deliveryMethod?: string;
  promoCode?: string;
};

/** POST /cart/merge — called right after login to fold a guest cart in. */
export type MergeCartRequest = {
  items: PlaceOrderItem[];
};

/* ------------------------------------------------------------------ */
/* Pre-checkout validation — client prices/stock can be stale by the    */
/* time the person actually checks out.                                */
/* ------------------------------------------------------------------ */

export type ValidateCartRequest = {
  items: PlaceOrderItem[];
};

export type CartIssueCode =
  | "out_of_stock"
  | "price_changed"
  | "quantity_reduced"
  | "removed";

export type CartItemIssue = {
  productId: string;
  variant?: string;
  code: CartIssueCode;
  /** Present for "price_changed": the item's current unit price. */
  newPrice?: number;
  /** Present for "quantity_reduced": the max quantity still available. */
  maxQuantity?: number;
  message: string;
};

export type ValidateCartResponse = {
  valid: boolean;
  issues: CartItemIssue[];
};
