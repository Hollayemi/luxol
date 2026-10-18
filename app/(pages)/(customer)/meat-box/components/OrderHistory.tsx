"use client";

import { useState, type ReactNode } from "react";
import {
  CheckCircleIcon,
  ChevronDownIcon,
  ProgressDotsIcon,
  XCircleIcon,
} from "@/app/components/ui/icons";
import {
  MEAT_BOX_STATUS_LABEL,
  formatDate,
  formatDeliveredAt,
  orderCode,
  orderLineLabel,
  orderSubtitle,
} from "@/app/utils/meat-box";
import { formatNaira } from "@/app/utils/product";
import type { MeatBoxOrder, MeatBoxOrderStatus } from "@/redux/types";

function StatusLabel({ status }: { status: MeatBoxOrderStatus }) {
  const done = status === "completed";
  const cancelled = status === "cancelled";
  const Icon = done ? CheckCircleIcon : cancelled ? XCircleIcon : ProgressDotsIcon;
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 text-xs font-semibold ${
        done ? "text-luxol-green" : "text-luxol-orange"
      }`}
    >
      <Icon className="size-3.5" />
      {MEAT_BOX_STATUS_LABEL[status]}
    </span>
  );
}

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-5">
      <h4 className="text-sm font-semibold text-neutral-900">{title}</h4>
      <dl className="mt-2.5 flex flex-col gap-2 rounded-xl border border-neutral-200 p-3.5 text-xs">
        {children}
      </dl>
    </section>
  );
}

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-6">
      <dt className="shrink-0 text-neutral-500">{label}</dt>
      <dd className="text-right font-medium text-neutral-900">{value}</dd>
    </div>
  );
}

function OrderRow({
  order,
  open,
  onToggle,
}: {
  order: MeatBoxOrder;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <li className="border-b border-neutral-200 last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className={`flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition ${
          open ? "rounded-2xl bg-[#f8f1e6]" : "hover:bg-neutral-50"
        }`}
      >
        <span className="min-w-0">
          <span
            className={`block text-sm font-semibold ${open ? "text-luxol-orange" : "text-neutral-900"}`}
          >
            Order {orderCode(order)}
          </span>
          <span className={`mt-1 block text-xs ${open ? "text-luxol-orange/80" : "text-neutral-500"}`}>
            {formatDate(order.createdAt)} · {orderSubtitle(order)}
          </span>
        </span>
        <span className="flex items-center gap-3">
          <StatusLabel status={order.status} />
          <ChevronDownIcon
            className={`size-4 text-neutral-500 transition-transform ${open ? "rotate-180" : ""}`}
          />
        </span>
      </button>

      {open && (
        <div className="px-5 pb-6">
          <Block title="Selected Meats">
            {order.items.map((item) => (
              <Row
                key={item.optionId}
                label={orderLineLabel(item)}
                value={formatNaira(item.lineTotal)}
              />
            ))}
          </Block>

          <Block title="Delivery Address">
            <Row label="Address" value={order.address} />
            <Row label="Full Name" value={order.fullName} />
            <Row label="Phone Number" value={`+234 ${order.phone}`} />
          </Block>

          <Block title="Summary">
            <Row
              label={order.paidAt ? "Total Amount Paid" : "Total Amount"}
              value={formatNaira(order.total)}
            />
            <Row label="Schedule Frequency" value={order.deliveryFrequency.label} />
            {order.deliveredAt && (
              <Row label="Delivered Date" value={formatDeliveredAt(order.deliveredAt)} />
            )}
            <Row
              label="Custom Butchery Guideline"
              value={
                <span className="line-clamp-2 max-w-xs whitespace-pre-line">
                  {order.butcheryGuidelines?.trim() || "None"}
                </span>
              }
            />
          </Block>
        </div>
      )}
    </li>
  );
}

export default function OrderHistory({
  orders,
  initialOpenId,
}: {
  orders: MeatBoxOrder[];
  /** Expanded first. Falls back to the newest order. */
  initialOpenId?: string;
}) {
  const [openId, setOpenId] = useState<string | null>(
    orders.find((o) => o.id === initialOpenId)?.id ?? orders[0]?.id ?? null,
  );

  if (orders.length === 0) {
    return (
      <p className="rounded-2xl bg-neutral-50 p-6 text-sm text-neutral-500">
        Your Meat Box orders will show up here.
      </p>
    );
  }

  return (
    <ul>
      {orders.map((order) => (
        <OrderRow
          key={order.id}
          order={order}
          open={openId === order.id}
          onToggle={() => setOpenId((cur) => (cur === order.id ? null : order.id))}
        />
      ))}
    </ul>
  );
}
