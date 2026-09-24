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
