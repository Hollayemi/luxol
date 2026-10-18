/**
 * Meat Box (customer side): bulk meat sold as fixed-weight boxes, e.g. a whole,
 * half or quarter animal.
 *
 * Pricing is known up front. Every category has a price per kg and every box
 * (option) inside it has a weight, so staff never have to weigh and confirm a
 * price after the order:
 *
 *   box price = category price per kg x box weight
 *   e.g. Goat at ₦8,000/kg, "Full Goat" = 120kg  ->  ₦960,000
 *
 * The flow is a normal checkout:
 *
 *   1. Customer picks boxes and sets how they want it delivered.
 *   2. They pay straight away: POST /meat-box/orders creates the order
 *      ("pending_payment") and returns the payment link.
 *   3. Once payment goes through -> "processing" -> "out_for_delivery"
 *      -> "completed".
 */

/* ------------------------------------------------------------------ */
/* Catalogue                                                           */
/* ------------------------------------------------------------------ */

export type MeatBoxOption = {
  id: string;
  /** "Full Goat", "Half Cow", "Quarter Cow" ... */
  label: string;
  image: string | null;
  /** Weight of ONE box, in kg. */
  weightKg: number;
  /** Price of ONE box in naira: its category's price per kg x `weightKg`. */
  price: number;
  /** Most the customer can order of this at once. null = backend default. */
  maxQuantity: number | null;
};

export type MeatBoxCategory = {
  id: string;
  /** "Cow Beef", "Goat" ... the page adds " Options". */
  label: string;
  /** Naira per kg for every box in this category. */
  pricePerKg: number;
  options: MeatBoxOption[];
};

export type MeatBoxDeliveryFrequency = {
  id: string;
  /** "One-Time", "Every 2 weeks" ... */
  label: string;
  /** True when the box repeats. */
  recurring: boolean;
};

export type MeatBoxOptions = {
  categories: MeatBoxCategory[];
  deliveryFrequencies: MeatBoxDeliveryFrequency[];
  /** "Monday" ... */
  deliveryDays: string[];
  /** "10:00 AM - 11:00 AM" ... */
  deliveryWindows: string[];
};

/* ------------------------------------------------------------------ */
/* Creating an order                                                   */
/* ------------------------------------------------------------------ */

export type MeatBoxOrderItemInput = {
  optionId: string;
  /** How many of this box. */
  quantity: number;
};

export type CreateMeatBoxOrderRequest = {
  items: MeatBoxOrderItemInput[];
  deliveryFrequency: string;
  deliveryDay: string;
  deliveryWindow: string;
  /** One of the signed-in customer's saved addresses (GET /users/me/addresses). */
  addressId: string;
  /** Free text for the butchers. */
  butcheryGuidelines?: string;
};

/** Where to send the customer to pay; the backend returns them to the site afterwards. */
export type MeatBoxPayment = {
  authorizationUrl: string;
  reference: string;
};

/** Response to POST /meat-box/orders: the new (unpaid) order and how to pay for it. */
export type CreateMeatBoxOrderResponse = {
  order: MeatBoxOrder;
  payment: MeatBoxPayment;
};

/* ------------------------------------------------------------------ */
/* Orders                                                              */
/* ------------------------------------------------------------------ */

export type MeatBoxOrderStatus =
  | "pending_payment"
  | "processing"
  | "out_for_delivery"
  | "completed"
  | "cancelled";

export type MeatBoxOrderItem = {
  optionId: string;
  label: string;
  quantity: number;
  /** Weight of ONE box, as it was when the order was placed. */
  weightKg: number;
  /** Naira per kg, as it was when the order was placed. */
  pricePerKg: number;
  /** Price of ONE box (`pricePerKg` x `weightKg`). */
  unitPrice: number;
  /** `unitPrice` x `quantity`. */
  lineTotal: number;
};

export type MeatBoxOrder = {
  id: string;
  /** Shown as "#LX-10371". */
  code: string;
  status: MeatBoxOrderStatus;
  items: MeatBoxOrderItem[];

  deliveryFrequency: MeatBoxDeliveryFrequency;
  deliveryDay: string;
  deliveryWindow: string;
  address: string;
  fullName: string;
  phone: string;
  butcheryGuidelines: string | null;

  /** Combined weight of every box on the order, in kg. */
  totalWeightKg: number;
  /** What the customer pays, in naira. */
  total: number;
  /** Set once the customer has paid; null while the order is "pending_payment". */
  paidAt: string | null;

  /** ISO, null once delivered / cancelled. */
  nextDeliveryAt: string | null;
  deliveredAt: string | null;
  createdAt: string;
};

export type MeatBoxOrdersList = {
  items: MeatBoxOrder[];
};

/**
 * Response to POST /meat-box/orders/:id/pay: a fresh payment link for an order
 * that was created but not paid (the customer closed the payment page).
 */
export type PayMeatBoxOrderResponse = {
  orderId: string;
  payment: MeatBoxPayment;
};

export type CancelMeatBoxOrderRequest = {
  id: string;
  reason?: string;
};
