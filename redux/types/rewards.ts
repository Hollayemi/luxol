import type { Paginated } from "./inventory";

/**
 * Loyalty rewards (customer side), shown on /loyalty: the point balance, the
 * coupons the customer holds, the rewards they can spend points on, and the
 * points history.
 *
 * Points are earned by the backend (orders, promotions...) and only ever
 * spent through redeemReward, so the browser never sends a point amount.
 * Everything needs the customer's token. Adjust field names to match the
 * NestJS DTOs.
 */

/** "fixed" takes off a naira amount, "percent" takes off a percentage. */
export type RewardDiscountType = "fixed" | "percent";

export type RewardValidityUnit = "minute" | "hour" | "day" | "week" | "month";

/* ------------------------------------------------------------------ */
/* Balance                                                             */
/* ------------------------------------------------------------------ */

/** GET /rewards/balance */
export type RewardBalance = {
  points: number;
};

/* ------------------------------------------------------------------ */
/* Coupons the customer holds ("Your Available Reward Discounts")      */
/* ------------------------------------------------------------------ */

export type RewardCoupon = {
  id: string;
  /** What the customer types (or pastes with the Copy button) at checkout. */
  code: string;
  discountType: RewardDiscountType;
  /** Naira off when "fixed" (1000), percent off when "percent" (5). */
  discountValue: number;
  /** NGN. The smallest order the coupon works on. Null means any order. */
  minOrderAmount: number | null;
  /** ISO. */
  expiresAt: string;
};

/**
 * GET /rewards/coupons
 * Only coupons that can still be used: not expired, not already spent.
 * Soonest to expire first.
 */
export type RewardCouponList = {
  items: RewardCoupon[];
};

/* ------------------------------------------------------------------ */
/* Reward store ("Your Reward Stores")                                 */
/* ------------------------------------------------------------------ */

/** How long a coupon works for once it has been redeemed: "After 20 Minutes". */
export type RewardValidity = {
  amount: number;
  unit: RewardValidityUnit;
};

/** One thing points can buy. Managed by staff, so the list can change at any time. */
export type RewardStoreItem = {
  id: string;
  /** "5% Off your next order." */
  title: string;
  description?: string | null;
  /** Points it costs. */
  pointsCost: number;
  discountType: RewardDiscountType;
  discountValue: number;
  /** NGN. Null means the coupon works on any order. */
  minOrderAmount: number | null;
  validity: RewardValidity;
  /** Shows the orange "New" tag. */
  isNew: boolean;
};

/** GET /rewards/store */
export type RewardStoreList = {
  items: RewardStoreItem[];
};

/** POST /rewards/store/:id/redeem takes the reward id and nothing else. */
export type RedeemRewardRequest = string;

export type RedeemRewardResponse = {
  /** The coupon the customer now holds. */
  coupon: RewardCoupon;
  /** Their new balance after the points were spent. */
  points: number;
};

/* ------------------------------------------------------------------ */
/* Points activities                                                   */
/* ------------------------------------------------------------------ */

export type RewardPointActivity = {
  id: string;
  /** Signed: +250 earned, -2000 spent. */
  points: number;
  /** Ready to show: "Order #LX-10371", "Redeemed ₦1,000 OFF coupon", "Promotional reward". */
  description: string;
  /** ISO. */
  createdAt: string;
};

export type ListRewardActivitiesParams = {
  page?: number;
  perPage?: number;
};

/** GET /rewards/activities, newest first. */
export type RewardActivityList = Paginated<RewardPointActivity>;
