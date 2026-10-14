"use client";

import { CustomerAvatar } from "@/app/components/admin/orders/CustomerAvatar";
import { formatOrderDateTime } from "@/app/components/admin/orders/formatters";
import type { AdminMeatBoxOrderSummary } from "@/redux/types";
import { formatDeliveryFrequency, formatMeatBoxCode, getAmountLabel } from "./formatters";
import { useOpenMeatBoxOrder } from "./MeatBoxOrderDrawer";
import { MeatBoxPaymentPill, MeatBoxStatusPill } from "./MeatBoxStatusPill";

const COLUMNS = [
  "Order",
  "Customer Name",
  "Date & Time",
  "Amount",
  "No of Items",
  "Delivery",
  "Payment",
  "Status",
];

/** Delivered orders show when they arrived; open ones show the upcoming delivery. */
function deliveryDate(order: AdminMeatBoxOrderSummary) {
  return formatOrderDateTime(order.deliveredAt ?? order.nextDeliveryAt);
}

type OrderRowProps = {
  order: AdminMeatBoxOrderSummary;
  onOpen: (order: AdminMeatBoxOrderSummary) => void;
};

function OrderRow({ order, onOpen }: OrderRowProps) {
  const open = () => onOpen(order);
  const amount = getAmountLabel(order);

  return (
    <tr
      onClick={open}
      className="cursor-pointer border-b border-neutral-100 last:border-0 hover:bg-neutral-50/60"
    >
      <td className="py-4 pr-4 text-sm font-medium text-neutral-900">
        {/* A real button so keyboard users can open the row too */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            open();
          }}
          className="rounded font-medium focus-visible:outline-2 focus-visible:outline-luxol-green"
        >
          {formatMeatBoxCode(order.code)}
        </button>
      </td>
      <td className="py-4 pr-4">
        <div className="flex items-center gap-3">
          <CustomerAvatar name={order.customer.fullName} src={order.customer.avatar} />
          <span className="text-sm font-medium text-neutral-900 underline underline-offset-4">
            {order.customer.fullName}
          </span>
        </div>
      </td>
      <td className="py-4 pr-4 text-sm text-neutral-900">{formatOrderDateTime(order.placedAt)}</td>
      <td className={`py-4 pr-4 text-sm ${amount.estimated ? "text-neutral-500" : "text-neutral-900"}`}>
        {amount.text}
      </td>
      <td className="py-4 pr-4 text-sm text-neutral-900">{order.itemsCount}</td>
      <td className="py-4 pr-4 text-sm text-neutral-900">
        <p>{deliveryDate(order)}</p>
        <p className="mt-0.5 text-xs text-neutral-400">{formatDeliveryFrequency(order.deliveryFrequency)}</p>
      </td>
      <td className="py-4 pr-4">
        <MeatBoxPaymentPill status={order.paymentStatus} />
      </td>
      <td className="py-4">
        <MeatBoxStatusPill status={order.status} />
      </td>
    </tr>
  );
}

export type MeatBoxOrderTableProps = {
  orders: AdminMeatBoxOrderSummary[];
  /** Override what a row click does. Defaults to opening the Order Details drawer. */
  onOpenOrder?: (order: AdminMeatBoxOrderSummary) => void;
};

export function MeatBoxOrderTable({ orders, onOpenOrder }: MeatBoxOrderTableProps) {
  const openMeatBoxOrder = useOpenMeatBoxOrder();
  const handleOpen = onOpenOrder ?? openMeatBoxOrder;

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1080px] text-left">
        <thead>
          <tr className="text-xs uppercase tracking-wide text-neutral-500">
            {COLUMNS.map((col) => (
              <th key={col} className="pb-4 pr-4 font-medium">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <OrderRow key={order.id} order={order} onOpen={handleOpen} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function MeatBoxOrderTableSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-12 animate-pulse rounded-lg bg-neutral-100" />
      ))}
    </div>
  );
}
