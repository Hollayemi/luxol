"use client";

import { useState } from "react";
import AdminIcon from "@/app/components/admin/layout/AdminIcon";
import { OrderTimeline } from "@/app/components/admin/orders/OrderTimeline";
import { formatOrderDateTime } from "@/app/components/admin/orders/formatters";
import { useDialog } from "@/app/components/dialog/DialogProvider";
import { formatNaira } from "@/app/utils/product";
import { notify } from "@/lib/notify";
import { getErrorMessage } from "@/redux/config/errors";
import { useGetAdminMeatBoxOrderQuery } from "@/redux/slices/adminMeatBoxApi";
import type { AdminMeatBoxOrderDetail, AdminMeatBoxOrderSummary } from "@/redux/types";
import { CancelMeatBoxOrderForm } from "./CancelMeatBoxOrderForm";
import {
  formatDeliveryFrequency,
  formatItemQuantity,
  formatMeatBoxCode,
  formatWeight,
  getItemHint,
  getItemWeight,
} from "./formatters";
import { MeatBoxPaymentPill, MeatBoxStatusPill } from "./MeatBoxStatusPill";
import { UpdateMeatBoxStatusForm } from "./UpdateMeatBoxStatusForm";

type OpenDialog = ReturnType<typeof useDialog>["openDialog"];
type OrderRef = Pick<AdminMeatBoxOrderSummary, "id" | "code">;

function openOrderDrawer(openDialog: OpenDialog, order: OrderRef) {
  openDialog(({ close }) => <MeatBoxOrderDrawer orderId={order.id} close={close} />, {
    title: `Meat Box order ${formatMeatBoxCode(order.code)}`,
    side: "right",
    width: "lg",
  });
}

/**
 * Opens the Meat Box Order Details drawer from anywhere (table rows today,
 * the customers page later):
 *   const openMeatBoxOrder = useOpenMeatBoxOrder();
 *   openMeatBoxOrder(order);
 */
export function useOpenMeatBoxOrder() {
  const { openDialog } = useDialog();
  return (order: OrderRef) => openOrderDrawer(openDialog, order);
}

type FooterMode = "actions" | "update" | "cancel";

export type MeatBoxOrderDrawerProps = {
  /** The order's id (not the "#LX-" code). */
  orderId: string;
  close: () => void;
};

export function MeatBoxOrderDrawer({ orderId, close }: MeatBoxOrderDrawerProps) {
  const { data, isLoading, isError, error, refetch } = useGetAdminMeatBoxOrderQuery(orderId);
  const [mode, setMode] = useState<FooterMode>("actions");
  const order = data?.data;

  async function handleCopy() {
    if (!order) return;
    try {
      await navigator.clipboard.writeText(formatMeatBoxCode(order.code));
      notify.success("Order number copied", { id: "meat-box-copy" });
    } catch {
      notify.error("Couldn't copy", { message: "Copy the order number by hand instead." });
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-start justify-between gap-4 bg-neutral-50 px-6 py-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-neutral-900">
              {order ? formatMeatBoxCode(order.code) : isLoading ? "Loading..." : "Order"}
            </h2>
            {order && (
              <button
                type="button"
                onClick={handleCopy}
                aria-label="Copy order number"
                className="rounded p-0.5 text-neutral-400 transition hover:text-neutral-700"
              >
                <CopyIcon />
              </button>
            )}
          </div>
          <p className="text-xs text-neutral-500">Order Details</p>
        </div>
        <button
          type="button"
          onClick={close}
          aria-label="Close"
          className="flex size-7 items-center justify-center rounded-md border border-neutral-200 bg-white text-neutral-600 transition hover:bg-neutral-50"
        >
          <AdminIcon name="close" className="size-4" />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
        {isLoading ? (
          <DrawerSkeleton />
        ) : isError || !order ? (
          <div className="flex flex-col items-center gap-3 py-12 text-center">
            <p className="text-sm text-neutral-600">{getErrorMessage(error)}</p>
            <button
              type="button"
              onClick={refetch}
              className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-50"
            >
              Try again
            </button>
          </div>
        ) : (
          <OrderBody order={order} />
        )}
      </div>

      {order && (
        <div className="border-t border-neutral-100 px-6 py-4">
          {mode === "update" && order.allowedNextStatuses.length > 0 ? (
            <UpdateMeatBoxStatusForm order={order} onBack={() => setMode("actions")} />
          ) : mode === "cancel" && order.canCancel ? (
            <CancelMeatBoxOrderForm order={order} onBack={() => setMode("actions")} />
          ) : (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMode("update")}
                disabled={order.allowedNextStatuses.length === 0}
                className="h-11 flex-1 rounded-xl border border-neutral-300 bg-white text-sm font-medium text-neutral-900 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Update Order Status
              </button>
              <button
                type="button"
                onClick={() => setMode("cancel")}
                disabled={!order.canCancel}
                className="h-11 flex-1 rounded-xl bg-[#c0392b] text-sm font-medium text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel Order
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Body                                                                */
/* ------------------------------------------------------------------ */

function OrderBody({ order }: { order: AdminMeatBoxOrderDetail }) {
  return (
    <>
      <div className="grid grid-cols-3 gap-4 text-sm">
        <div>
          <p className="text-neutral-400">Created at</p>
          <p className="mt-2 font-semibold text-neutral-900">{formatOrderDateTime(order.placedAt)}</p>
        </div>
        <div>
          <p className="text-neutral-400">Payment</p>
          <p className="mt-2">
            <MeatBoxPaymentPill status={order.paymentStatus} />
          </p>
        </div>
        <div>
          <p className="text-neutral-400">Status</p>
          <p className="mt-2">
            <MeatBoxStatusPill status={order.status} size="compact" />
          </p>
        </div>
      </div>

      {order.cancellation && (
        <div className="mt-5 rounded-xl bg-[#fbe9e9] px-4 py-3 text-sm text-red-700">
          <p className="font-medium">Cancelled {formatOrderDateTime(order.cancellation.cancelledAt)}</p>
          <p className="mt-0.5 text-red-600">{order.cancellation.reason}</p>
        </div>
      )}

      {order.status === "PENDING_PAYMENT" && (
        <div className="mt-5 rounded-xl bg-[#fdf0da] px-4 py-3 text-sm text-amber-800">
          <p className="font-medium">Waiting for payment</p>
          <p className="mt-0.5 text-amber-700">
            The customer hasn&apos;t paid for this box yet. It moves to Processing once their payment is received.
          </p>
        </div>
      )}

      <Section title="Customer">
        <dl className="mt-4 space-y-3 text-sm">
          <InfoRow label="Full name:" value={order.customer.fullName} />
          <InfoRow label="Email:" value={order.customer.email} />
          <InfoRow label="Phone Number:" value={order.customer.phone} />
          <InfoRow label="Shipping Address:" value={order.deliveryAddress} />
        </dl>
      </Section>

      <Section title="Timeline">
        <OrderTimeline events={order.timeline} />
      </Section>

      <Section title="Items" badge={order.itemsCount}>
        <table className="mt-4 w-full text-left text-sm">
          <thead>
            <tr className="text-xs font-medium text-neutral-600">
              <th className="pb-3 font-medium">Product Details</th>
              <th className="pb-3 pr-4 font-medium">Qty</th>
              <th className="pb-3 pr-4 font-medium">Weight</th>
              <th className="pb-3 text-right font-medium">Price</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id} className="border-t border-neutral-100">
                <td className="py-3 pr-2">
                  <div className="flex items-center gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-neutral-100">
                      {item.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.image} alt="" className="size-full object-cover" />
                      ) : (
                        <AdminIcon name="package" className="size-4 text-neutral-400" />
                      )}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-neutral-900">{item.label}</p>
                      <p className="truncate text-xs text-neutral-400">{getItemHint(item)}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3 pr-4 font-medium text-neutral-900">{formatItemQuantity(item.quantity)}</td>
                <td className="py-3 pr-4 font-medium text-neutral-900">{formatWeight(getItemWeight(item))}</td>
                <td className="py-3 text-right font-medium text-neutral-900">{formatNaira(item.lineTotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      <Section title="Order Summary">
        <dl className="mt-4 space-y-3 text-sm">
          <SummaryRow label="Schedule Frequency" value={formatDeliveryFrequency(order.deliveryFrequency)} />
          <SummaryRow label="Delivery Day" value={order.deliveryDay} />
          <SummaryRow label="Delivery Window" value={order.deliveryWindow} />
          <div className="flex items-start justify-between gap-6">
            <dt className="shrink-0 text-neutral-500">Custom Butchery Guideline</dt>
            <dd className="max-w-[16rem] text-right font-medium text-neutral-900">
              {order.butcheryGuidelines?.trim() || <span className="font-normal text-neutral-400">None</span>}
            </dd>
          </div>
        </dl>
      </Section>

      <Section title="Payment Summary">
        <dl className="mt-4 space-y-3 text-sm">
          <SummaryRow label="Total Weight" value={formatWeight(order.totalWeightKg)} />
          <SummaryRow label="Items Total" value={formatNaira(order.itemsTotal)} />
          <SummaryRow label="Discount" value={formatNaira(order.discount)} />
          <SummaryRow label="Delivery Fee" value={formatNaira(order.deliveryFee)} />
          <SummaryRow label="Total" value={formatNaira(order.total)} strong />
        </dl>
      </Section>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Small pieces                                                        */
/* ------------------------------------------------------------------ */

function Section({
  title,
  badge,
  children,
}: {
  title: string;
  /** Small grey count next to the title, e.g. Items 5 */
  badge?: number;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-6 border-t border-neutral-100 pt-6">
      <h3 className="flex items-center gap-2 text-sm font-semibold text-neutral-900">
        {title}
        {badge !== undefined && (
          <span className="rounded-md bg-neutral-100 px-1.5 py-0.5 text-xs font-medium text-neutral-600">
            {badge}
          </span>
        )}
      </h3>
      {children}
    </section>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[9.5rem_1fr] gap-4">
      <dt className="text-neutral-400">{label}</dt>
      <dd className="font-semibold text-neutral-900">{value}</dd>
    </div>
  );
}

function SummaryRow({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-neutral-500">{label}</dt>
      <dd className={strong ? "font-semibold text-neutral-900" : "font-medium text-neutral-900"}>{value}</dd>
    </div>
  );
}

function CopyIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M5 15V6a2 2 0 0 1 2-2h9" strokeLinecap="round" />
    </svg>
  );
}

function DrawerSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-10 animate-pulse rounded-lg bg-neutral-100" />
        ))}
      </div>
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} className="h-4 animate-pulse rounded bg-neutral-100" />
      ))}
    </div>
  );
}
