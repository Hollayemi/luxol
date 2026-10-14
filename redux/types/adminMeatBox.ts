/**
 * Admin Meat Box: the staff-side Meat Box orders page (stats strip, table,
 * and the Order Details drawer with the weight + price form).
 *
 * Why this isn't just the Orders page: animal portions (quarter / half /
 * whole) are weighed AFTER the customer orders, so staff have to enter the
 * final weight and price of every line before the customer can pay.
 *
 *   PENDING_WEIGHING -> staff enter final weight + price per line
 *   PRICE_CONFIRMED  -> price is set, waiting for the customer to pay
 *   PROCESSING       -> paid; meat is being cut and packaged
 *   OUT_FOR_DELIVERY -> with the rider
 *   COMPLETED        -> delivered
 *   CANCELLED        -> cancelled by staff or customer
 *
 * Staff move an order along with the same "Update Order Status" /
 * "Cancel Order" actions as the Orders page. Only the timeline is different
 * (it has the weighing / price steps).
 *
 * Named AdminMeatBox* on purpose: meatBox.ts already owns MeatBoxOrder,
 * MeatBoxOrderItem, MeatBoxOrderStatus and MeatBoxUnit for the customer pages
 * (those use lowercase values; these follow the Prisma enums).
 * Adjust field names here to match the NestJS DTOs; every admin meat box
 * component reads through these types.
 */

import type {
  AdminOrderCustomer,
  AdminOrderCustomerBrief,
  AdminOrderPeriod,
  AdminOrderStat,
  AdminOrderTimelineEvent,
} from "./adminOrders";
import type { MeatBoxRange } from "./meatBox";

/* ------------------------------------------------------------------ */
/* Enums (mirror the Prisma schema)                                    */
/* ------------------------------------------------------------------ */

/** MeatBoxOrderStatus in the schema. */
export type AdminMeatBoxStatus =
  | "PENDING_WEIGHING"
  | "PRICE_CONFIRMED"
  | "PROCESSING"
  | "OUT_FOR_DELIVERY"
  | "COMPLETED"
  | "CANCELLED";

/**
 * Statuses staff can move an order to with "Update Order Status".
 * The first two are set by the system (when staff confirm the price, and
 * when the customer pays) and cancelling has its own action.
 */
export type AdminMeatBoxUpdatableStatus = Extract<
  AdminMeatBoxStatus,
  "PROCESSING" | "OUT_FOR_DELIVERY" | "COMPLETED"
>;

/** MeatBoxUnit in the schema. ANIMAL is priced after weighing, KG is per kilo. */
export type AdminMeatBoxUnit = "ANIMAL" | "KG";

/** Derived from `paidAt` (and any refund) by the backend. */
export type AdminMeatBoxPaymentStatus = "UNPAID" | "PAID" | "REFUNDED";

/* ------------------------------------------------------------------ */
/* Items                                                               */
/* ------------------------------------------------------------------ */

/** A line of the order (MeatBoxOrderItem, plus a few fields from its option). */
export type AdminMeatBoxOrderItem = {
  id: string;
  optionId: string;
  /** Snapshot taken at order time: "Quarter Cow", "Goat Meat by Kg". */
  label: string;
  /** The option's image. */
  image: string | null;
  unit: AdminMeatBoxUnit;
  /** Number of animals / portions, or kilos when `unit` is "KG". */
  quantity: number;
  /** Naira per kg snapshot. Null for ANIMAL. */
  pricePerKg: number | null;
  /** Estimated weight of ONE unit (the option's estimatedMinKg / MaxKg). */
  estimatedWeightKg: MeatBoxRange | null;
  /** Filled in by staff at weighing. Null until then. */
  finalWeightKg: number | null;
  /** Final price of the line, set by staff. Null until then. */
  lineTotal: number | null;
};

/* ------------------------------------------------------------------ */
/* List                                                                */
/* ------------------------------------------------------------------ */

/** A row in the Meat Box orders table. */
export type AdminMeatBoxOrderSummary = {
  id: string;
  /** "LX-10371", no leading "#" (that's added when it's displayed). */
  code: string;
  status: AdminMeatBoxStatus;
  paymentStatus: AdminMeatBoxPaymentStatus;
  customer: AdminOrderCustomerBrief;
  /** ISO. When the customer placed the order (createdAt). */
  placedAt: string;
  /** Number of lines on the order, the "No of Items" column. */
  itemsCount: number;
  /** "ONE_TIME", "EVERY_2_WEEKS" ... */
  deliveryFrequency: string;
  /** Set by staff once the meat is weighed. Null until then. */
  confirmedTotal: number | null;
  /** What the customer saw when ordering; shown while `confirmedTotal` is null. */
  estimatedTotal: MeatBoxRange | null;
  /** Sum of the weighed lines. Null until staff confirm. */
  finalWeightKg: number | null;
  /** ISO. The upcoming delivery, null once delivered / cancelled. */
  nextDeliveryAt: string | null;
  /** ISO. Null until delivered. */
  deliveredAt: string | null;
};

export type ListAdminMeatBoxOrdersParams = {
  /** Matches the order code ("LX-10371") and the customer's name. */
  search?: string;
  status?: AdminMeatBoxStatus;
  paymentStatus?: AdminMeatBoxPaymentStatus;
  /** Same periods as the Orders page. */
  period?: AdminOrderPeriod;
  page?: number;
  perPage?: number;
};

/* ------------------------------------------------------------------ */
/* Stats                                                               */
/* ------------------------------------------------------------------ */

export type GetAdminMeatBoxStatsParams = {
  period?: AdminOrderPeriod;
};

/** The stat strip. Same shape as the Orders page: a value plus its change. */
export type AdminMeatBoxStats = {
  totalOrders: AdminOrderStat;
  /** Waiting for staff to weigh and price them: the ones that need action. */
  pendingWeighing: AdminOrderStat;
  priceConfirmed: AdminOrderStat;
  processing: AdminOrderStat;
  outForDelivery: AdminOrderStat;
  completed: AdminOrderStat;
};

/* ------------------------------------------------------------------ */
/* Detail                                                              */
/* ------------------------------------------------------------------ */

export type AdminMeatBoxOrderDetail = Omit<AdminMeatBoxOrderSummary, "customer"> & {
  customer: AdminOrderCustomer;
  /** Address snapshot taken when the order was placed. */
  deliveryAddress: string;
  /** "Monday" */
  deliveryDay: string;
  /** "10:00 AM - 11:00 AM" */
  deliveryWindow: string;
  /** Free text for the butchers. */
  butcheryGuidelines: string | null;
  items: AdminMeatBoxOrderItem[];
  /** What the customer saw when ordering. */
  estimatedWeightKg: MeatBoxRange | null;

  /**
   * Oldest first (the drawer shows newest on top). Different from a shop
   * order's timeline, for example:
   *   "Order has been made"            -> createdAt
   *   "Final Weight & Price Confirmed" -> priceConfirmedAt
   *   "Meat Box Prepared"              -> cut, weighed and packaged
   *   "Out for delivery"
   *   "Delivered" / "Order cancelled"
   */
  timeline: AdminOrderTimelineEvent[];

  priceConfirmedAt: string | null;
  paidAt: string | null;

  /** Payment Summary block. The totals are null until the price is confirmed. */
  itemsTotal: number | null;
  discount: number;
  deliveryFee: number;
  total: number | null;

  /** Drives the "Update Order Status" button. Empty = disabled. */
  allowedNextStatuses: AdminMeatBoxUpdatableStatus[];
  /**
   * True while the price can still be set or corrected: weighing is pending,
   * or the price is confirmed but the customer hasn't paid. Drives the
   * "Weight & Price" button.
   */
  canUpdatePrice: boolean;
  /** False once it's completed or already cancelled. Drives "Cancel Order". */
  canCancel: boolean;
  cancellation?: {
    reason: string;
    cancelledAt: string;
  } | null;
};

/* ------------------------------------------------------------------ */
/* Actions                                                             */
/* ------------------------------------------------------------------ */

/** One line of the "Update Meat Box Price" form. */
export type AdminMeatBoxPriceLineInput = {
  /** MeatBoxOrderItem.id */
  itemId: string;
  finalWeightKg: number;
  /** Final price of the whole line in NGN (not per kg). */
  lineTotal: number;
};

/**
 * Every line must be sent. The backend saves each line, sets the order's
 * `finalWeightKg` and `confirmedTotal` to the sums, stamps `priceConfirmedAt`
 * and moves a PENDING_WEIGHING order to PRICE_CONFIRMED. Rejected once the
 * order is paid.
 */
export type UpdateAdminMeatBoxPriceRequest = {
  id: string;
  items: AdminMeatBoxPriceLineInput[];
};

export type UpdateAdminMeatBoxStatusRequest = {
  id: string;
  status: AdminMeatBoxUpdatableStatus;
  /** Internal note, saved on the timeline event. */
  note?: string;
};

export type CancelAdminMeatBoxOrderRequest = {
  id: string;
  reason: string;
};
