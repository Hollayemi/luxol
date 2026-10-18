import { formatNaira } from "@/app/utils/product";
import type {
  AdminMeatBoxOrderItem,
  AdminMeatBoxPaymentStatus,
  AdminMeatBoxStatus,
} from "@/redux/types";

/* ------------------------------------------------------------------ */
/* Labels                                                              */
/* ------------------------------------------------------------------ */

export const MEAT_BOX_STATUS_LABELS: Record<AdminMeatBoxStatus, string> = {
  PENDING_PAYMENT: "Pending Payment",
  PROCESSING: "Processing",
  OUT_FOR_DELIVERY: "Out for Delivery",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export const MEAT_BOX_PAYMENT_LABELS: Record<AdminMeatBoxPaymentStatus, string> = {
  UNPAID: "Unpaid",
  PAID: "Paid",
  REFUNDED: "Refunded",
};

export const MEAT_BOX_STATUS_FILTER_OPTIONS: { value: AdminMeatBoxStatus; label: string }[] = (
  Object.keys(MEAT_BOX_STATUS_LABELS) as AdminMeatBoxStatus[]
).map((value) => ({ value, label: MEAT_BOX_STATUS_LABELS[value] }));

/** "#LX-10371" (the code is stored without the "#"). */
export function formatMeatBoxCode(code: string) {
  return `#${code}`;
}

/** "EVERY_2_WEEKS" -> "Every 2 Weeks", "ONE_TIME" -> "One Time" */
export function formatDeliveryFrequency(value: string) {
  return value
    .toLowerCase()
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/* ------------------------------------------------------------------ */
/* Weights, quantities and prices                                      */
/* ------------------------------------------------------------------ */

/** 120 -> "120kg", 45.125 -> "45.125kg" (up to the gram, so don't round to 1 dp). */
export function formatWeight(kg: number) {
  return `${Number(kg.toFixed(3))}kg`;
}

/** 8000 -> "₦8,000/kg" */
export function formatPerKg(pricePerKg: number) {
  return `${formatNaira(pricePerKg)}/kg`;
}

/** "×2": how many of a box. */
export function formatItemQuantity(quantity: number) {
  return `×${quantity}`;
}

/**
 * The price of one meat box: its category's price per kg x its weight.
 * The backend computes the real figure; this is the same sum, used for the
 * live preview while staff type a weight or a price per kg.
 */
export function computeBoxPrice(pricePerKg: number, weightKg: number) {
  return roundMoney(pricePerKg * weightKg);
}

/** Weight of a whole order line: one box's weight x how many were ordered. */
export function getItemWeight(item: Pick<AdminMeatBoxOrderItem, "weightKg" | "quantity">) {
  return Number((item.weightKg * item.quantity).toFixed(3));
}

/** The muted line under an item's name: "120kg each · ₦8,000/kg". */
export function getItemHint(item: Pick<AdminMeatBoxOrderItem, "weightKg" | "pricePerKg">) {
  return `${formatWeight(item.weightKg)} each · ${formatPerKg(item.pricePerKg)}`;
}

/* ------------------------------------------------------------------ */
/* Form numbers                                                        */
/* ------------------------------------------------------------------ */

/** Keeps digits and a single dot, so "₦1,250.5kg" can be pasted and still works. */
export function sanitizeDecimal(raw: string) {
  const cleaned = raw.replace(/[^0-9.]/g, "");
  const firstDot = cleaned.indexOf(".");
  if (firstDot === -1) return cleaned;
  return cleaned.slice(0, firstDot + 1) + cleaned.slice(firstDot + 1).replace(/\./g, "");
}

/** "" -> NaN so an empty field never counts as a number. */
export function parseDecimal(value: string) {
  return value.trim() === "" ? Number.NaN : Number(value);
}

export function decimalPlaces(value: string) {
  const dot = value.indexOf(".");
  return dot === -1 ? 0 : value.length - dot - 1;
}

/** Floating point safe: 0.1 * 3 -> 0.3, not 0.30000000000000004. */
export function roundMoney(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}
