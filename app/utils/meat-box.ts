import type {
  MeatBoxOption,
  MeatBoxOrder,
  MeatBoxOrderStatus,
  MeatBoxRange,
} from "@/redux/types";
import { formatNaira } from "./product";

/* ------------------------------------------------------------------ */
/* Building a box                                                      */
/* ------------------------------------------------------------------ */

/** What the customer has picked so far: an option and how many (or how many kg). */
export type MeatBoxSelection = { optionId: string; quantity: number };

export type SelectedItem = { option: MeatBoxOption; quantity: number };

export const MIN_QUANTITY = 1;
const DEFAULT_MAX_ANIMALS = 10;
const DEFAULT_MAX_KG = 200;

export function maxQuantityFor(option: MeatBoxOption): number {
  return option.maxQuantity ?? (option.unit === "kg" ? DEFAULT_MAX_KG : DEFAULT_MAX_ANIMALS);
}

/**
 * Match picks to the current catalogue. A pick whose option staff have since
 * removed is dropped, and a quantity is kept within the option's limits.
 */
export function resolveSelection(
  selection: MeatBoxSelection[],
  options: MeatBoxOption[],
): SelectedItem[] {
  const byId = new Map(options.map((o) => [o.id, o]));
  return selection.flatMap((s) => {
    const option = byId.get(s.optionId);
    if (!option) return [];
    const quantity = Math.min(Math.max(s.quantity, MIN_QUANTITY), maxQuantityFor(option));
    return [{ option, quantity }];
  });
}

/** "5 kg" for per-kilo meat, "×2" for animals and portions. */
export function formatQuantity(unit: MeatBoxOption["unit"], quantity: number): string {
  return unit === "kg" ? `${quantity}kg` : `×${quantity}`;
}

/* ------------------------------------------------------------------ */
/* Estimates                                                           */
/* ------------------------------------------------------------------ */

export function formatKg(kg: number): string {
  return `${Number.isInteger(kg) ? kg : kg.toFixed(1)}kg`;
}

export function formatKgRange(range: MeatBoxRange): string {
  return range.min === range.max
    ? formatKg(range.min)
    : `${Number.isInteger(range.min) ? range.min : range.min.toFixed(1)} - ${formatKg(range.max)}`;
}

export function formatNairaRange(range: MeatBoxRange): string {
  return range.min === range.max
    ? formatNaira(range.min)
    : `${formatNaira(range.min)} - ${formatNaira(range.max)}`;
}

export type BoxEstimate = {
  /** null when nothing in the box has a weight estimate. */
  weightKg: MeatBoxRange | null;
  /** null when any item has no price estimate: the range would be misleading. */
  price: MeatBoxRange | null;
};

/**
 * Estimated weight and price of the whole box.
 * Per-kilo meat is exact; animals use the option's own estimate per unit.
 */
export function estimateBox(items: SelectedItem[]): BoxEstimate {
  let weightMin = 0;
  let weightMax = 0;
  let hasWeight = false;
  let priceMin = 0;
  let priceMax = 0;
  let priceKnown = items.length > 0;

  for (const { option, quantity } of items) {
    if (option.unit === "kg") {
      weightMin += quantity;
      weightMax += quantity;
      hasWeight = true;
      if (option.pricePerKg != null) {
        priceMin += option.pricePerKg * quantity;
        priceMax += option.pricePerKg * quantity;
      } else {
        priceKnown = false;
      }
      continue;
    }

    if (option.estimatedWeightKg) {
      weightMin += option.estimatedWeightKg.min * quantity;
      weightMax += option.estimatedWeightKg.max * quantity;
      hasWeight = true;
    }
    if (option.estimatedPrice) {
      priceMin += option.estimatedPrice.min * quantity;
      priceMax += option.estimatedPrice.max * quantity;
    } else {
      priceKnown = false;
    }
  }

  return {
    weightKg: hasWeight ? { min: weightMin, max: weightMax } : null,
    price: priceKnown ? { min: priceMin, max: priceMax } : null,
  };
}

/** The line price shown next to an item while the box is being built. */
export function unitPriceLabel(option: MeatBoxOption): string {
  return option.pricePerKg != null ? formatNaira(option.pricePerKg) : "Unconfirmed";
}

/* ------------------------------------------------------------------ */
/* Orders                                                              */
/* ------------------------------------------------------------------ */

export const MEAT_BOX_STATUS_LABEL: Record<MeatBoxOrderStatus, string> = {
  pending_weighing: "Pending weighing",
  price_confirmed: "Price confirmed",
  processing: "Processing",
  out_for_delivery: "Out for delivery",
  completed: "Completed",
  cancelled: "Cancelled",
};

/** Orders that are still in progress, i.e. the "ongoing" Meat Box. */
export const ACTIVE_STATUSES: MeatBoxOrderStatus[] = [
  "pending_weighing",
  "price_confirmed",
  "processing",
  "out_for_delivery",
];

export function isActive(order: Pick<MeatBoxOrder, "status">): boolean {
  return ACTIVE_STATUSES.includes(order.status);
}

/** Statuses where the customer can still back out without contacting support. */
export function canCancel(order: Pick<MeatBoxOrder, "status">): boolean {
  return order.status === "pending_weighing" || order.status === "price_confirmed";
}

export function orderCode(order: Pick<MeatBoxOrder, "code">): string {
  return `#${order.code}`;
}

/** "Quarter Cow ×1" for animals, "Cow Beef by Kg (5kg)" for per-kilo meat. */
export function orderLineLabel(item: MeatBoxOrder["items"][number]): string {
  return item.unit === "kg" ? `${item.label} (${item.quantity}kg)` : `${item.label} ×${item.quantity}`;
}

/** "4 proteins · 8.5 kg" under an order in the history list. */
export function orderSubtitle(order: MeatBoxOrder): string {
  const proteins = `${order.items.length} ${order.items.length === 1 ? "protein" : "proteins"}`;
  const weight =
    order.finalWeightKg != null
      ? ` · ${formatKg(order.finalWeightKg)}`
      : order.estimatedWeightKg
        ? ` · ~${formatKgRange(order.estimatedWeightKg)}`
        : "";
  return `${proteins}${weight}`;
}

const dateFmt = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" });
const shortDateFmt = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });
const longDateFmt = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  month: "short",
  day: "numeric",
  year: "numeric",
});
const timeFmt = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", hour12: true });

/** "Sep 08, 2026" style, forced to en-US like the rest of the site. */
export function formatDate(iso: string): string {
  return dateFmt.format(new Date(iso)).replace(/ (\d),/, " 0$1,");
}

/** "Sep 28" */
export function formatShortDate(iso: string): string {
  return shortDateFmt.format(new Date(iso));
}

/** "Monday, Sep 14, 2026 - 10:35 AM" */
export function formatDeliveredAt(iso: string): string {
  const d = new Date(iso);
  return `${longDateFmt.format(d)} - ${timeFmt.format(d)}`;
}

/** "Sep 28 · 10:00 AM - 12:00 PM" */
export function formatNextDelivery(order: Pick<MeatBoxOrder, "nextDeliveryAt" | "deliveryWindow">): string {
  if (!order.nextDeliveryAt) return order.deliveryWindow;
  return `${formatShortDate(order.nextDeliveryAt)} · ${order.deliveryWindow}`;
}
