/**
 * Admin Meat Box: the staff-side Meat Box orders page (stats strip, table,
 * and the Order Details drawer).
 *
 * Meat boxes have a fixed price (category price per kg x box weight), so there
 * is no weighing or price confirmation step: the customer pays when they order
 * and staff simply move the paid order along.
 *
 *   PENDING_PAYMENT  -> order created, waiting for the customer to pay
 *   PROCESSING       -> paid; meat is being cut and packaged
 *   OUT_FOR_DELIVERY -> with the rider
 *   COMPLETED        -> delivered
 *   CANCELLED        -> cancelled by staff or customer
 *
 * Staff move an order along with the same "Update Order Status" /
 * "Cancel Order" actions as the Orders page. Only the timeline is different.
 *
 * Named AdminMeatBox* on purpose: meatBox.ts already owns MeatBoxOrder,
 * MeatBoxOrderItem and MeatBoxOrderStatus for the customer pages (those use
 * lowercase values; these follow the Prisma enums).
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

/* ------------------------------------------------------------------ */
/* Enums (mirror the Prisma schema)                                    */
/* ------------------------------------------------------------------ */

/** MeatBoxOrderStatus in the schema. */
export type AdminMeatBoxStatus =
  | "PENDING_PAYMENT"
  | "PROCESSING"
  | "OUT_FOR_DELIVERY"
  | "COMPLETED"
  | "CANCELLED";

/**
 * Statuses staff can move an order to with "Update Order Status".
 * PENDING_PAYMENT is the starting point and PROCESSING is normally set by the
 * system when the customer pays. Cancelling has its own action.
 */
export type AdminMeatBoxUpdatableStatus = Extract<
  AdminMeatBoxStatus,
  "PROCESSING" | "OUT_FOR_DELIVERY" | "COMPLETED"
>;

/** Derived from `paidAt` (and any refund) by the backend. */
export type AdminMeatBoxPaymentStatus = "UNPAID" | "PAID" | "REFUNDED";

/* ------------------------------------------------------------------ */
/* Items                                                               */
/* ------------------------------------------------------------------ */

/** A line of the order (MeatBoxOrderItem, plus a few fields from its option). */
export type AdminMeatBoxOrderItem = {
  id: string;
  optionId: string;
  /** Snapshot taken at order time: "Full Goat", "Quarter Cow". */
  label: string;
  /** The option's image. */
  image: string | null;
  /** How many of this box. */
  quantity: number;
  /** Weight of ONE box in kg (snapshot). The line weighs `weightKg` x `quantity`. */
  weightKg: number;
  /** Naira per kg (snapshot of the category's price when the order was placed). */
  pricePerKg: number;
  /** Price of the whole line in naira: `pricePerKg` x `weightKg` x `quantity`. */
  lineTotal: number;
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
  /** What the customer pays, in naira (items + delivery fee - discount). */
  total: number;
  /** Combined weight of every box on the order, in kg. */
  totalWeightKg: number;
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
  /** Created but not paid yet. */
  pendingPayment: AdminOrderStat;
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

  /**
   * Oldest first (the drawer shows newest on top). Different from a shop
   * order's timeline, for example:
   *   "Order has been made"  -> createdAt
   *   "Payment received"     -> paidAt
   *   "Meat Box Prepared"    -> cut and packaged
   *   "Out for delivery"
   *   "Delivered" / "Order cancelled"
   */
  timeline: AdminOrderTimelineEvent[];

  /** ISO. Null while the order is PENDING_PAYMENT. */
  paidAt: string | null;

  /** Payment Summary block. `total` (inherited) = itemsTotal - discount + deliveryFee. */
  itemsTotal: number;
  discount: number;
  deliveryFee: number;

  /** Drives the "Update Order Status" button. Empty = disabled. */
  allowedNextStatuses: AdminMeatBoxUpdatableStatus[];
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
