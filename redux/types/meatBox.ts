/**
 * Meat Box (customer side): bulk meat ordered as whole / half / quarter animals
 * or by the kilo.
 *
 * Why it has an extra step compared with a normal order: animal portions are
 * prepared and weighed AFTER the customer orders, so their price isn't known
 * up front. The flow is:
 *
 *   1. Customer picks meats and sets how they want it delivered.
 *   2. Order is submitted -> status "pending_weighing" (no price yet).
 *   3. Staff weigh the meat and confirm the price on the admin side
 *      -> status "price_confirmed", `confirmedTotal` is now set.
 *   4. Customer sees the price and places the order (pays)
 *      -> "processing" -> "out_for_delivery" -> "completed".
 */

/* ------------------------------------------------------------------ */
/* Catalogue                                                           */
/* ------------------------------------------------------------------ */

export type MeatBoxRange = { min: number; max: number };

/**
 * "animal": sold as a whole / half / quarter animal. Priced after weighing.
 * "kg": sold by the kilo at a fixed price, so the quantity is a number of kg.
 */
export type MeatBoxUnit = "animal" | "kg";

export type MeatBoxOption = {
  id: string;
  /** "Quarter Cow", "Cow Beef by Kg" ... */
  label: string;
  image: string | null;
  unit: MeatBoxUnit;
  /** Naira per kg. Set for `unit: "kg"`, null while the price is unconfirmed. */
  pricePerKg: number | null;
  /** Estimated weight of ONE unit, e.g. a quarter cow is 45 - 55 kg. */
  estimatedWeightKg: MeatBoxRange | null;
  /** Estimated price of ONE unit, shown as a range on the review step. */
  estimatedPrice: MeatBoxRange | null;
  /** Most the customer can order of this at once. null = backend default. */
  maxQuantity: number | null;
};

export type MeatBoxCategory = {
  id: string;
  /** "Cow Beef", "Goat" ... the page adds " Options". */
  label: string;
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
  /** Number of animals/portions, or kilos when the option is `unit: "kg"`. */
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

/* ------------------------------------------------------------------ */
/* Orders                                                              */
/* ------------------------------------------------------------------ */

export type MeatBoxOrderStatus =
  | "pending_weighing"
  | "price_confirmed"
  | "processing"
  | "out_for_delivery"
  | "completed"
  | "cancelled";

export type MeatBoxOrderItem = {
  optionId: string;
  label: string;
  unit: MeatBoxUnit;
  quantity: number;
  pricePerKg: number | null;
  /** Weighed by staff. null until then. */
  finalWeightKg: number | null;
  /** Confirmed price for this line. null until staff confirm it. */
  lineTotal: number | null;
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

  /** What the customer saw when ordering. */
  estimatedTotal: MeatBoxRange | null;
  estimatedWeightKg: MeatBoxRange | null;

  /** Set by staff once the meat is weighed. null = still pending. */
  confirmedTotal: number | null;
  finalWeightKg: number | null;
  priceConfirmedAt: string | null;
  /** Set once the customer has paid. */
  paidAt: string | null;

  /** ISO, null once delivered / cancelled. */
  nextDeliveryAt: string | null;
  deliveredAt: string | null;
  createdAt: string;
};

export type MeatBoxOrdersList = {
  items: MeatBoxOrder[];
};

/** Response to POST /meat-box/orders/:id/place */
export type PlaceMeatBoxOrderResponse = {
  orderId: string;
  /** Send the customer here to pay, then the backend returns them to the site. */
  payment: {
    authorizationUrl: string;
    reference: string;
  };
};

export type CancelMeatBoxOrderRequest = {
  id: string;
  reason?: string;
};
