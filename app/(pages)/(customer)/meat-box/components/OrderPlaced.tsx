import Link from "next/link";
import type { ReactNode } from "react";
import { CheckCircleIcon } from "@/app/components/ui/icons";
import { orderCode } from "@/app/utils/meat-box";
import { formatNaira } from "@/app/utils/product";
import type { MeatBoxOrder } from "@/redux/types";

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-6 py-2.5 text-sm">
      <dt className="text-neutral-500">{label}</dt>
      <dd className="text-right font-medium text-neutral-900">{value}</dd>
    </div>
  );
}

export default function OrderPlaced({ order }: { order: MeatBoxOrder }) {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center py-6 text-center">
      <span className="flex size-16 items-center justify-center rounded-2xl bg-luxol-green text-white">
        <CheckCircleIcon className="size-9" />
      </span>
      <h2 className="mt-5 text-3xl font-bold text-neutral-900">Order Placed</h2>
      <p className="mt-2 text-sm text-neutral-500">Your order has been placed successfully</p>
      <p className="mt-1 text-xs text-neutral-400">{orderCode(order)}</p>

      <h3 className="mt-10 text-base font-semibold text-neutral-900">Order Summary</h3>
      <dl className="mt-4 w-full rounded-3xl bg-neutral-50 px-6 py-3">
        <Row label="Amount of items" value={order.items.length} />
        <Row label="Schedule Frequency" value={order.deliveryFrequency.label} />
        <Row
          label="Total Amount"
          value={
            order.confirmedTotal == null ? (
              <span className="text-luxol-orange">Pending Weighing</span>
            ) : (
              formatNaira(order.confirmedTotal)
            )
          }
        />
        <Row label="Delivery Window" value={order.deliveryWindow} />
      </dl>

      <p className="mt-5 max-w-md text-xs leading-relaxed text-neutral-500">
        We&apos;ll prepare and weigh your meat, then confirm the final price within 1 to 24 hours.
        Once it&apos;s confirmed, open your Meat Box to place the order and pay.
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="inline-flex h-11 items-center rounded-lg bg-luxol-green px-6 text-sm font-semibold text-white transition hover:brightness-110"
        >
          Go to Home
        </Link>
        <Link
          href={`/meat-box/manage?order=${order.id}`}
          className="inline-flex h-11 items-center rounded-lg border border-neutral-300 px-6 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-50"
        >
          View Meat Box
        </Link>
      </div>
    </div>
  );
}
