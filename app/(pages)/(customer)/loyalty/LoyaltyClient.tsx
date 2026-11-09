"use client";

import type { ComponentProps } from "react";
import { useSession } from "next-auth/react";
import SignInPrompt from "@/app/components/ui/SignInPrompt";
import { formatPoints, formatPointsTotal } from "@/app/utils/rewards";
import { getErrorMessage } from "@/redux/config/errors";
import {
  useGetRewardBalanceQuery,
  useListRewardCouponsQuery,
  useListRewardStoreQuery,
} from "@/redux/slices/rewardsApi";
import CouponCard from "./components/CouponCard";
import PointsActivities from "./components/PointsActivities";
import RewardStore from "./components/RewardStore";

const sectionTitle = "text-xl font-semibold text-neutral-900";

function Balance() {
  const balance = useGetRewardBalanceQuery();
  // Same query RewardStore makes, so this is free: used to say whether they can redeem yet
  const store = useListRewardStoreQuery();

  const points = balance.data?.data.points;
  const cheapest = store.data?.data.items.length
    ? Math.min(...store.data.data.items.map((r: { pointsCost: number }) => r.pointsCost))
    : undefined;

  let message = "";
  if (points !== undefined && cheapest !== undefined) {
    message =
      points >= cheapest
        ? "You have enough points to redeem a discount coupon."
        : `You need ${formatPoints(cheapest - points)} more points to redeem a discount coupon.`;
  }

  return (
    <div className="text-center">
      <p className="text-sm font-medium uppercase tracking-wide text-luxol-green">Your point balance</p>

      {balance.isLoading ? (
        <div aria-hidden="true" className="mx-auto mt-4 h-16 w-64 animate-pulse rounded-xl bg-neutral-100" />
      ) : balance.isError || points === undefined ? (
        <div role="alert" className="mt-4 text-sm text-neutral-600">
          {getErrorMessage(balance.error)}{" "}
          <button type="button" onClick={balance.refetch} className="font-semibold text-luxol-green underline">
            Try again
          </button>
        </div>
      ) : (
        <>
          <p className="mt-3 text-5xl font-bold text-neutral-900 sm:text-6xl">{formatPointsTotal(points)}</p>
          {message && <p className="mt-3 text-sm text-neutral-500">{message}</p>}
        </>
      )}
    </div>
  );
}

function Coupons() {
  const { data, isLoading, isError, error, refetch } = useListRewardCouponsQuery();
  const coupons = data?.data.items ?? [];

  return (
    <section aria-labelledby="coupons-heading">
      <h2 id="coupons-heading" className={sectionTitle}>
        Your Available Reward Discounts
      </h2>

      <div className="mt-5">
        {isLoading ? (
          <div aria-hidden="true" className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-[204px] animate-pulse rounded-3xl bg-neutral-100" />
            ))}
          </div>
        ) : isError ? (
          <div role="alert" className="text-sm text-neutral-600">
            {getErrorMessage(error)}{" "}
            <button type="button" onClick={refetch} className="font-semibold text-luxol-green underline">
              Try again
            </button>
          </div>
        ) : coupons.length === 0 ? (
          <p className="rounded-2xl border border-neutral-200 p-6 text-sm text-neutral-500">
            You don&apos;t have any coupons yet. Redeem a reward below and it will appear here.
          </p>
        ) : (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {coupons.map((coupon: ComponentProps<typeof CouponCard>["coupon"], i: number) => (
              <CouponCard key={coupon.id} coupon={coupon} index={i} />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

export default function LoyaltyClient() {
  const { status } = useSession();
  const signedIn = status === "authenticated";

  if (status === "loading") {
    return (
      <div aria-hidden="true" className="space-y-10">
        <div className="mx-auto h-24 w-72 animate-pulse rounded-xl bg-neutral-100" />
        <div className="h-52 animate-pulse rounded-3xl bg-neutral-100" />
      </div>
    );
  }

  if (!signedIn) {
    return (
      <SignInPrompt
        title="Sign in to see your rewards"
        description="Your points, coupons and rewards are kept with your account."
      />
    );
  }

  return <LoyaltyContent />;
}

/** Only rendered for a signed-in customer, so every query below can just run. */
function LoyaltyContent() {
  const balance = useGetRewardBalanceQuery();

  return (
    <div className="space-y-14 sm:space-y-16">
      <Balance />

      <Coupons />

      <section aria-labelledby="reward-store-heading">
        <h2 id="reward-store-heading" className={sectionTitle}>
          Your Reward Stores
        </h2>

        <div className="mt-5 grid items-start gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
          <RewardStore points={balance.data?.data.points} />
          <PointsActivities />
        </div>
      </section>
    </div>
  );
}
