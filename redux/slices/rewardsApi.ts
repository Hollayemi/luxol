import type { ApiSuccess } from "../types/api";
import type {
  ListRewardActivitiesParams,
  RedeemRewardRequest,
  RedeemRewardResponse,
  RewardActivityList,
  RewardBalance,
  RewardCouponList,
  RewardStoreList,
} from "../types/rewards";
import baseApi from "./baseApi";

/** Backend paths for loyalty rewards. Change them here to match your controller. */
export const REWARDS_ROUTES = {
  balance: "/rewards/balance",
  coupons: "/rewards/coupons",
  store: "/rewards/store",
  redeem: (rewardId: string) => `/rewards/store/${rewardId}/redeem`,
  activities: "/rewards/activities",
} as const;

/**
 * Loyalty rewards (customer side). Every call needs the signed-in customer's token.
 *
 *  ── GET    /rewards/balance              getRewardBalance        (the "2,450 Points")
 *  ── GET    /rewards/coupons              listRewardCoupons       (usable coupons, soonest to expire first)
 *  ── GET    /rewards/store                listRewardStore         (what points can buy)
 *  ── POST   /rewards/store/:id/redeem     redeemReward            (spends points, creates a coupon)
 *  ── GET    /rewards/activities           listRewardActivities    (points history, newest first)
 *  ── DELETE /rewards/activities           clearRewardActivities   (hides the history for this customer)
 *
 * redeemReward is the only way points are spent, and it only sends the reward
 * id: the backend checks the balance, takes the points and creates the coupon
 * in one step (it should answer 400 with a message when there aren't enough
 * points, or the reward has ended). Clearing the history only hides it from
 * the customer's list, the points ledger itself should stay intact.
 *
 * The tags are added here with enhanceEndpoints, so this file needs no change
 * to baseApi.ts.
 */
const api = baseApi.enhanceEndpoints({
  addTagTypes: ["RewardBalance", "RewardCoupons", "RewardStore", "RewardActivities"],
});

export const rewardsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getRewardBalance: builder.query<ApiSuccess<RewardBalance>, void>({
      query: () => ({ url: REWARDS_ROUTES.balance }),
      providesTags: ["RewardBalance"],
    }),

    listRewardCoupons: builder.query<ApiSuccess<RewardCouponList>, void>({
      query: () => ({ url: REWARDS_ROUTES.coupons }),
      providesTags: ["RewardCoupons"],
    }),

    listRewardStore: builder.query<ApiSuccess<RewardStoreList>, void>({
      query: () => ({ url: REWARDS_ROUTES.store }),
      providesTags: ["RewardStore"],
    }),

    redeemReward: builder.mutation<ApiSuccess<RedeemRewardResponse>, RedeemRewardRequest>({
      query: (rewardId) => ({ url: REWARDS_ROUTES.redeem(rewardId), method: "POST" }),
      // New coupon, lower balance and a new "-2,000 points" line in the history
      invalidatesTags: ["RewardBalance", "RewardCoupons", "RewardActivities"],
    }),

    listRewardActivities: builder.query<
      ApiSuccess<RewardActivityList>,
      ListRewardActivitiesParams | void
    >({
      query: (params) => ({
        url: REWARDS_ROUTES.activities,
        params: params ?? undefined,
      }),
      providesTags: ["RewardActivities"],
    }),

    clearRewardActivities: builder.mutation<ApiSuccess<{ cleared: boolean }>, void>({
      query: () => ({ url: REWARDS_ROUTES.activities, method: "DELETE" }),
      invalidatesTags: ["RewardActivities"],
    }),
  }),
});

export const {
  useGetRewardBalanceQuery,
  useListRewardCouponsQuery,
  useListRewardStoreQuery,
  useRedeemRewardMutation,
  useListRewardActivitiesQuery,
  useClearRewardActivitiesMutation,
} = rewardsApi;
