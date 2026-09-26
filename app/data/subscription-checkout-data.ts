import type { ComponentType, SVGProps } from "react";
import { ChickenIcon, CowIcon, GoatIcon, MixedMeatIcon } from "@/app/components/ui/icons";

/* ------------------------------------------------------------------ */
/* Protein supply — selectable, each with a % share of the weekly mix  */
/* ------------------------------------------------------------------ */

export type ProteinOption = {
  id: string;
  name: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  tint: string;
};

export const PROTEIN_OPTIONS: ProteinOption[] = [
  { id: "chicken", name: "Chicken", icon: ChickenIcon, tint: "bg-amber-50 text-amber-700" },
  { id: "cow-beef", name: "Cow Beef", icon: CowIcon, tint: "bg-red-50 text-red-700" },
  { id: "goat-meat", name: "Goat Meat", icon: GoatIcon, tint: "bg-orange-50 text-orange-700" },
  {
    id: "assorted-meats",
    name: "Assorted Meats",
    icon: MixedMeatIcon,
    tint: "bg-rose-50 text-rose-700",
  },
];

/** id -> percentage share; keys present = selected, values always sum to 100. */
export type Allocation = Record<string, number>;

const MIN_SHARE = 5;
export const ALLOCATION_STEP = 5;

/** Select/unselect a protein, rebalancing everyone selected to equal shares. */
export function toggleProtein(current: Allocation, id: string): Allocation {
  const ids = id in current
    ? Object.keys(current).filter((k) => k !== id)
    : [...Object.keys(current), id];

  if (ids.length === 0) return {};

  const base = Math.floor(100 / ids.length);
  let remainder = 100 - base * ids.length;
  const next: Allocation = {};
  for (const k of ids) {
    next[k] = base + (remainder > 0 ? 1 : 0);
    if (remainder > 0) remainder -= 1;
  }
  return next;
}

/**
 * Nudge one protein's share by `delta` points, taking (or returning) the
 * difference from the other selected proteins proportionally to their
 * current share. Always keeps every selected item at >= MIN_SHARE and the
 * total at exactly 100.
 */
export function adjustAllocation(
  current: Allocation,
  id: string,
  delta: number,
): Allocation {
  const others = Object.keys(current).filter((k) => k !== id);
  if (others.length === 0 || !(id in current)) return current;

  const maxForId = 100 - MIN_SHARE * others.length;
  const targetValue = Math.min(maxForId, Math.max(MIN_SHARE, current[id] + delta));
  const need = targetValue - current[id];
  if (need === 0) return current;

  const next: Allocation = { ...current };
  const sorted = [...others].sort((a, b) => current[b] - current[a]);

  if (need > 0) {
    // Taking `need` total from the others, biggest shares giving up more.
    let remaining = need;
    const totalOthers = others.reduce((s, k) => s + current[k], 0) || 1;
    sorted.forEach((k, i) => {
      const isLast = i === sorted.length - 1;
      let cut = isLast ? remaining : Math.round((current[k] / totalOthers) * need);
      cut = Math.max(0, Math.min(cut, current[k] - MIN_SHARE, remaining));
      next[k] = current[k] - cut;
      remaining -= cut;
    });
    next[id] = current[id] + (need - remaining);
  } else {
    // Giving `-need` back to the others, biggest shares getting more.
    const give = -need;
    const totalOthers = others.reduce((s, k) => s + current[k], 0) || 1;
    let distributed = 0;
    sorted.forEach((k, i) => {
      const isLast = i === sorted.length - 1;
      const add = isLast ? give - distributed : Math.round((current[k] / totalOthers) * give);
      next[k] = current[k] + add;
      distributed += add;
    });
    next[id] = current[id] - distributed;
  }

  return next;
}

export function canDecrease(current: Allocation, id: string): boolean {
  return (current[id] ?? 0) > MIN_SHARE;
}

export function canIncrease(current: Allocation, id: string): boolean {
  const others = Object.keys(current).filter((k) => k !== id);
  if (others.length === 0) return false;
  return others.some((k) => current[k] > MIN_SHARE);
}

/* ------------------------------------------------------------------ */
/* Delivery scheduling                                                 */
/* ------------------------------------------------------------------ */

export type DeliveryFrequency = { id: string; label: string; deliveriesPerMonth: number };

export const DELIVERY_FREQUENCIES: DeliveryFrequency[] = [
  { id: "weekly", label: "Weekly", deliveriesPerMonth: 4 },
  { id: "biweekly", label: "Every 2 weeks", deliveriesPerMonth: 2 },
  { id: "monthly", label: "Monthly", deliveriesPerMonth: 1 },
];

export const DELIVERY_DAYS = [
  "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday",
] as const;

export const DELIVERY_WINDOWS = [
  "8:00 AM – 10:00 AM",
  "10:00 AM – 12:00 PM",
  "12:00 PM – 2:00 PM",
  "2:00 PM – 4:00 PM",
  "4:00 PM – 6:00 PM",
] as const;
