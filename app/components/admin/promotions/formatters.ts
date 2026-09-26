import { formatNaira } from "@/app/utils/product";
import type { AppliesTo, DiscountType, Promotion } from "@/redux/types";

/** 15 + "percentage" -> "15%"; 5000 + "fixed_amount" -> "₦5,000 OFF"; "free_delivery" -> "Free" */
export function formatDiscount(promotion: Pick<Promotion, "discountType" | "discountValue">) {
  switch (promotion.discountType) {
    case "percentage":
      return `${promotion.discountValue}%`;
    case "fixed_amount":
      return `${formatNaira(promotion.discountValue)} OFF`;
    case "free_delivery":
      return "Free";
  }
}

const DISCOUNT_TYPE_LABELS: Record<DiscountType, string> = {
  percentage: "Percentage Discount",
  fixed_amount: "Fixed Amount Off",
  free_delivery: "Free Delivery",
};

export function formatDiscountType(type: DiscountType) {
  return DISCOUNT_TYPE_LABELS[type];
}

const APPLIES_TO_LABELS: Record<AppliesTo, string> = {
  all_orders: "All orders",
  category: "Selected category",
  specific_products: "Selected products",
};

export function formatAppliesTo(promotion: Pick<Promotion, "appliesTo" | "affectedCount" | "category">) {
  if (promotion.appliesTo === "all_orders") return "All orders";
  if (promotion.appliesTo === "category" && promotion.category) return promotion.category.name;
  return `${promotion.affectedCount} products`;
}

export function formatAppliesToSummary(appliesTo: AppliesTo) {
  return APPLIES_TO_LABELS[appliesTo];
}

export function formatDateTime(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "-";
  const datePart = date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  const timePart = date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  return `${datePart} · ${timePart}`;
}

/** ISO -> "2026-09-19T10:00" for a <input type="datetime-local"> */
export function toDateTimeLocal(iso?: string | null) {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
