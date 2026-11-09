"use client";

import { useState } from "react";
import { notify } from "@/lib/notify";
import { getErrorMessage } from "@/redux/config/errors";
import { useListRewardStoreQuery, useRedeemRewardMutation } from "@/redux/slices/rewardsApi";
import type { RewardStoreItem } from "@/redux/types/rewards";
import { formatPoints, formatValidity } from "@/app/utils/rewards";

function PercentBadge() {
  return (
    <span className="flex size-[84px] shrink-0 items-center justify-center rounded-2xl bg-[#f4e6d2]">
      <span className="flex size-10 items-center justify-center rounded-full bg-luxol-orange text-white">
        <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
          <path d="M18 6L6 18" />
          <circle cx="7.5" cy="7.5" r="1.5" />
          <circle cx="16.5" cy="16.5" r="1.5" />
        </svg>
      </span>
    </span>
  );
}

export type RewardStoreProps = {
  /** The customer's current balance, to know which rewards they can afford. */
  points: number | undefined;
};

/** "Your Reward Stores": the rewards points can buy, each with a Redeem button. */
export default function RewardStore({ points }: RewardStoreProps) {
  const { data, isLoading, isError, error, refetch } = useListRewardStoreQuery();
  const [redeem] = useRedeemRewardMutation();
  const [redeemingId, setRedeemingId] = useState<string | null>(null);

  async function handleRedeem(reward: RewardStoreItem) {
    if (redeemingId) return;
    setRedeemingId(reward.id);
    try {
      const res = await redeem(reward.id).unwrap();
      notify.success("Reward redeemed", {
        message: `Your coupon code is ${res.data.coupon.code}. You'll find it under Your Available Reward Discounts.`,
      });
    } catch (err) {
      // e.g. not enough points any more, or the reward just ended
      notify.error("Couldn't redeem this reward", { message: getErrorMessage(err) });
    } finally {
      setRedeemingId(null);
    }
  }

  if (isLoading) {
    return (
      <div aria-hidden="true" className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-[124px] animate-pulse rounded-2xl bg-neutral-100" />
        ))}
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div role="alert" className="rounded-2xl border border-neutral-200 p-6 text-sm text-neutral-600">
        {getErrorMessage(error)}{" "}
        <button type="button" onClick={refetch} className="font-semibold text-luxol-green underline">
          Try again
        </button>
      </div>
    );
  }

  const rewards = data.data.items;

  if (rewards.length === 0) {
    return (
      <p className="rounded-2xl border border-neutral-200 p-6 text-sm text-neutral-500">
        There are no rewards to redeem right now. Check back soon.
      </p>
    );
  }

  return (
    <ul className="space-y-4">
      {rewards.map((reward) => {
        const missing = points === undefined ? 0 : reward.pointsCost - points;
        const canAfford = points !== undefined && missing <= 0;
        const busy = redeemingId === reward.id;

        return (
          <li
            key={reward.id}
            className="flex items-center gap-5 rounded-2xl border border-neutral-200 p-4 sm:p-5"
          >
            <PercentBadge />

            <div className="min-w-0 flex-1">
              {reward.isNew && <p className="text-[11px] font-medium text-luxol-orange">New</p>}
              <h3 className="text-lg font-medium text-neutral-900">{reward.title}</h3>
              <p className="mt-1 text-xs text-neutral-500">
                Expires: {formatValidity(reward.validity)}
                <span aria-hidden="true" className="mx-2">·</span>
                <span className="font-semibold text-luxol-green">{formatPoints(reward.pointsCost)} pts</span>
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleRedeem(reward)}
              disabled={!canAfford || redeemingId !== null}
              title={!canAfford && points !== undefined ? `You need ${formatPoints(missing)} more points` : undefined}
              className="h-12 min-w-28 shrink-0 rounded-lg bg-luxol-orange px-5 text-sm font-medium text-black transition hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-luxol-orange disabled:cursor-not-allowed disabled:opacity-50"
            >
              {busy ? "Redeeming..." : "Redeem"}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
