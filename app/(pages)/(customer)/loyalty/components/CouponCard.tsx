"use client";

import { useEffect, useRef, useState } from "react";
import { notify } from "@/lib/notify";
import type { RewardCoupon } from "@/redux/types/rewards";
import { couponCondition, couponGradient, couponValue, formatExpiry } from "@/app/utils/rewards";

export type CouponCardProps = {
  coupon: RewardCoupon;
  /** Position in the list, which picks the card colour. */
  index: number;
};

/** A coloured coupon with a Copy button for its code. */
export default function CouponCard({ coupon, index }: CouponCardProps) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(coupon.code);
      setCopied(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access can be blocked: show the code so it can be typed instead
      notify.info("Your coupon code", { message: coupon.code, id: `coupon-${coupon.id}` });
    }
  }

  return (
    <li
      className={`relative overflow-hidden rounded-3xl bg-gradient-to-br p-6 text-white ${couponGradient(index)}`}
    >
      <button
        type="button"
        onClick={handleCopy}
        aria-label={`Copy coupon code ${coupon.code}`}
        className="absolute right-4 top-4 h-11 min-w-24 rounded-lg bg-white px-4 text-sm font-medium text-neutral-900 transition hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      >
        {copied ? "Copied" : "Copy"}
      </button>

      <p className="pr-28 pt-9 text-base">{couponCondition(coupon.minOrderAmount)}</p>
      <p className="mt-1 text-4xl font-bold leading-tight">
        {couponValue(coupon.discountType, coupon.discountValue)}{" "}
        <span className="text-2xl font-semibold">off</span>
      </p>
      <p className="mt-5 text-sm">Expires: {formatExpiry(coupon.expiresAt)}</p>
    </li>
  );
}
