import { formatNaira } from "@/app/utils/product";
import type {
  AdminMeatBoxOrderItem,
  AdminMeatBoxOrderSummary,
  AdminMeatBoxPaymentStatus,
  AdminMeatBoxStatus,
  AdminMeatBoxUnit,
  MeatBoxRange,
} from "@/redux/types";

/* ------------------------------------------------------------------ */
/* Labels                                                              */
/* ------------------------------------------------------------------ */

export const MEAT_BOX_STATUS_LABELS: Record<AdminMeatBoxStatus, string> = {
  PENDING_WEIGHING: "Pending Weighing",
  PRICE_CONFIRMED: "Price Confirmed",
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

/** 45 -> "45kg", 45.125 -> "45.125kg" (weighed to the gram, so don't round to 1 dp). */
export function formatWeight(kg: number) {
  return `${Number(kg.toFixed(3))}kg`;
}

export function formatWeightRange(range: MeatBoxRange) {
  return range.min === range.max
    ? formatWeight(range.min)
    : `${Number(range.min.toFixed(3))} - ${formatWeight(range.max)}`;
}

export function formatPriceRange(range: MeatBoxRange) {
  return range.min === range.max
    ? formatNaira(range.min)
    : `${formatNaira(range.min)} - ${formatNaira(range.max)}`;
}

/** "5kg" for per-kilo meat, "×2" for animals and portions. */
export function formatItemQuantity(unit: AdminMeatBoxUnit, quantity: number) {
  return unit === "KG" ? `${quantity}kg` : `×${quantity}`;
}

/** Estimated weight of the WHOLE line (the option's estimate is for one unit). */
export function getItemEstimatedWeight(item: AdminMeatBoxOrderItem): MeatBoxRange | null {
  if (item.unit === "KG") return { min: item.quantity, max: item.quantity };
  if (!item.estimatedWeightKg) return null;
  return {
    min: item.estimatedWeightKg.min * item.quantity,
    max: item.estimatedWeightKg.max * item.quantity,
  };
}

/** The muted line under an item's name: what staff should expect on the scale. */
export function getItemHint(item: AdminMeatBoxOrderItem) {
  if (item.unit === "KG") {
    const ordered = `Ordered ${formatWeight(item.quantity)}`;
    return item.pricePerKg != null ? `${ordered} · ${formatNaira(item.pricePerKg)}/kg` : ordered;
  }
  const estimate = getItemEstimatedWeight(item);
  return estimate ? `Est. ${formatWeightRange(estimate)}` : "Weight not estimated";
}

/**
 * The Amount column: the confirmed price, or the estimate the customer saw
 * (flagged as an estimate) while the order is still waiting to be weighed.
 */
export function getAmountLabel(order: Pick<AdminMeatBoxOrderSummary, "confirmedTotal" | "estimatedTotal">) {
  if (order.confirmedTotal != null) return { text: formatNaira(order.confirmedTotal), estimated: false };
  if (order.estimatedTotal) return { text: `Est. ${formatPriceRange(order.estimatedTotal)}`, estimated: true };
  return { text: "-", estimated: true };
}

/* ------------------------------------------------------------------ */
/* Price form numbers                                                  */
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
