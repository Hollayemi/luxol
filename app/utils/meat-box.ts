import type { MeatBoxOption, MeatBoxOrder, MeatBoxOrderStatus } from "@/redux/types";

/* ------------------------------------------------------------------ */
/* Building a box                                                      */
/* ------------------------------------------------------------------ */

/** What the customer has picked so far: an option and how many of it. */
export type MeatBoxSelection = { optionId: string; quantity: number };

export type SelectedItem = { option: MeatBoxOption; quantity: number };

export const MIN_QUANTITY = 1;
const DEFAULT_MAX_QUANTITY = 10;

export function maxQuantityFor(option: MeatBoxOption): number {
  return option.maxQuantity ?? DEFAULT_MAX_QUANTITY;
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

/** "×2": how many of a box. */
export function formatQuantity(quantity: number): string {
  return `×${quantity}`;
}

/* ------------------------------------------------------------------ */
/* Weight and price                                                    */
/* ------------------------------------------------------------------ */

/** 120 -> "120kg", 45.125 -> "45.125kg". */
export function formatKg(kg: number): string {
  return `${Number(kg?.toFixed(3))}kg`;
}

/** Floating point safe: 0.1 * 3 -> 0.3, not 0.30000000000000004. */
function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/** What one line costs: the box's price x how many. */
export function lineTotal({ option, quantity }: SelectedItem): number {
  return roundMoney(option.price * quantity);
}

/** What the whole box costs. Exact: the price is fixed from weight x price per kg. */
export function boxTotal(items: SelectedItem[]): number {
  return roundMoney(items.reduce((sum, item) => sum + lineTotal(item), 0));
}

/** Combined weight of everything picked, in kg. */
export function boxWeightKg(items: SelectedItem[]): number {
  return Number(items.reduce((sum, { option, quantity }) => sum + option.weightKg * quantity, 0).toFixed(3));
}

/* ------------------------------------------------------------------ */
/* Orders                                                              */
/* ------------------------------------------------------------------ */

export const MEAT_BOX_STATUS_LABEL: Record<MeatBoxOrderStatus, string> = {
  pending_payment: "Awaiting payment",
  processing: "Processing",
  out_for_delivery: "Out for delivery",
  completed: "Completed",
  cancelled: "Cancelled",
};

/** Orders that are still in progress, i.e. the "ongoing" Meat Box. */
export const ACTIVE_STATUSES: MeatBoxOrderStatus[] = [
  "pending_payment",
  "processing",
  "out_for_delivery",
];

export function isActive(order: Pick<MeatBoxOrder, "status">): boolean {
  return ACTIVE_STATUSES.includes(order.status);
}

/** Created but not paid yet: the customer can still pay for it. */
export function canPay(order: Pick<MeatBoxOrder, "status">): boolean {
  return order.status === "pending_payment";
}

/** Only an unpaid order can be cancelled without contacting support. */
export function canCancel(order: Pick<MeatBoxOrder, "status">): boolean {
  return order.status === "pending_payment";
}

export function orderCode(order: Pick<MeatBoxOrder, "code">): string {
  return `#${order.code}`;
}

/** "Quarter Cow ×1" */
export function orderLineLabel(item: MeatBoxOrder["items"][number]): string {
  return `${item.label} ${formatQuantity(item.quantity)}`;
}

/** "4 proteins · 8.5kg" under an order in the history list. */
export function orderSubtitle(order: MeatBoxOrder): string {
  const proteins = `${order.items.length} ${order.items.length === 1 ? "protein" : "proteins"}`;
  return `${proteins} · ${formatKg(order.totalWeightKg)}`;
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
