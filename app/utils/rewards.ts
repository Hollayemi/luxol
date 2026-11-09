import type {
  RewardDiscountType,
  RewardPointActivity,
  RewardValidity,
} from "@/redux/types/rewards";
import { formatNaira } from "./product";

/** 2450 -> "2,450" */
export function formatPoints(points: number) {
  return points.toLocaleString("en-US");
}

/** 1 -> "1 Point", 2450 -> "2,450 Points" */
export function formatPointsTotal(points: number) {
  return `${formatPoints(points)} ${points === 1 ? "Point" : "Points"}`;
}

/** "On orders above ₦20,000", or "On any orders" when there's no minimum. */
export function couponCondition(minOrderAmount: number | null) {
  return minOrderAmount ? `On orders above ${formatNaira(minOrderAmount)}` : "On any orders";
}

/** The big part of a coupon: { value: "₦1,000" } or { value: "5%" }. */
export function couponValue(discountType: RewardDiscountType, discountValue: number) {
  return discountType === "percent" ? `${discountValue}%` : formatNaira(discountValue);
}

/** { amount: 20, unit: "minute" } -> "After 20 Minutes", { amount: 1, unit: "month" } -> "After 1 Month" */
export function formatValidity({ amount, unit }: RewardValidity) {
  const name = unit.charAt(0).toUpperCase() + unit.slice(1);
  return `After ${amount} ${name}${amount === 1 ? "" : "s"}`;
}

/** "Sep 30, 2026" */
export function formatExpiry(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
}

/** +250 -> "+250 points", -2000 -> "-2,000 points", 1 -> "+1 point" */
export function formatActivityPoints(points: number) {
  const sign = points < 0 ? "-" : "+";
  const abs = Math.abs(points);
  return `${sign}${formatPoints(abs)} ${abs === 1 ? "point" : "points"}`;
}

export function formatActivityDate(activity: Pick<RewardPointActivity, "createdAt">) {
  return formatExpiry(activity.createdAt);
}

/** Card backgrounds, cycled in order so neighbouring coupons look different. */
export const COUPON_GRADIENTS = [
  "from-[#4f6fcf] to-[#88b2e2]",
  "from-[#a06fd8] to-[#d98bb2]",
  "from-[#d96b85] to-[#eec4bd]",
] as const;

export function couponGradient(index: number) {
  return COUPON_GRADIENTS[index % COUPON_GRADIENTS.length];
}
