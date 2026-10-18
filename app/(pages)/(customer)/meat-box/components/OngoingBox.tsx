"use client";

import { useState } from "react";
import { ConfirmDialog } from "@/app/components/admin/ConfirmDialog";
import { useDialog } from "@/app/components/dialog/DialogProvider";
import {
  canCancel,
  canPay,
  formatKg,
  formatNextDelivery,
  MEAT_BOX_STATUS_LABEL,
  orderLineLabel,
} from "@/app/utils/meat-box";
import { formatNaira } from "@/app/utils/product";
import { notify } from "@/lib/notify";
import { getErrorMessage } from "@/redux/config/errors";
import {
  useCancelMeatBoxOrderMutation,
  usePayMeatBoxOrderMutation,
} from "@/redux/slices/meatBoxApi";
import type { MeatBoxOrder } from "@/redux/types";

function Message({ order }: { order: MeatBoxOrder }) {
  const text: Partial<Record<MeatBoxOrder["status"], string>> = {
    pending_payment: "Your order is waiting for payment. Pay now to lock in your delivery.",
    processing: "Payment received. Your box is being prepared.",
    out_for_delivery: "Your Meat Box is on its way.",
  };
  const message = text[order.status];
  return message ? <p className="mt-4 text-xs leading-relaxed text-white/80">{message}</p> : null;
}

export default function OngoingBox({ order }: { order: MeatBoxOrder }) {
  const { openDialog } = useDialog();
  const [pay, { isLoading: paying }] = usePayMeatBoxOrderMutation();
  const [cancel] = useCancelMeatBoxOrderMutation();
  const [redirecting, setRedirecting] = useState(false);

  /** The customer closed the payment page earlier: get a fresh link and send them back to it. */
  async function payNow() {
    try {
      const res = await pay(order.id).unwrap();
      setRedirecting(true);
      window.location.assign(res.data.payment.authorizationUrl);
    } catch (err) {
      notify.error("We couldn't start your payment", { message: getErrorMessage(err) });
    }
  }

  function confirmCancel() {
    openDialog(
      ({ close }) => (
        <ConfirmDialog
          title="Cancel this Meat Box?"
          description="This order, and any repeat deliveries scheduled with it, will be cancelled."
          confirmLabel="Cancel Meat Box"
          close={close}
          onConfirm={async () => {
            try {
              await cancel({ id: order.id }).unwrap();
              notify.success("Meat Box cancelled");
            } catch (err) {
              notify.error("We couldn't cancel it", { message: getErrorMessage(err) });
              throw err;
            }
          }}
        />
      ),
      { side: "center", width: "sm", title: "Cancel this Meat Box?" },
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-3xl bg-luxol-green p-6 text-white">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-xl font-semibold">Ongoing Meat Box</h3>
          {order.deliveryFrequency.recurring && (
            <span className="rounded-md bg-luxol-orange px-2.5 py-1 text-[11px] font-semibold text-black">
              Recurring
            </span>
          )}
        </div>

        <p className="mt-3 text-3xl font-bold">{formatNaira(order.total)}</p>
        <p className="mt-1 text-xs text-white/70">{formatKg(order.totalWeightKg)} in total</p>
        <p className="mt-2 text-[11px] font-semibold uppercase tracking-wide text-luxol-orange">
          {MEAT_BOX_STATUS_LABEL[order.status]}
        </p>

        <hr className="my-5 border-white/15" />

        <p className="text-[11px] text-white/60">Next delivery</p>
        <p className="mt-1 text-base font-semibold">
          {order.nextDeliveryAt
            ? formatNextDelivery(order)
            : `${order.deliveryDay}s · ${order.deliveryWindow}`}
        </p>

        <Message order={order} />

        {canPay(order) && (
          <button
            type="button"
            onClick={() => void payNow()}
            disabled={paying || redirecting}
            className="mt-5 inline-flex h-12 w-full items-center justify-center rounded-xl bg-luxol-orange px-6 text-sm font-semibold text-black transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {redirecting
              ? "Taking you to payment…"
              : paying
                ? "Processing…"
                : `Pay Now · ${formatNaira(order.total)}`}
          </button>
        )}
      </div>

      <div className="rounded-3xl bg-neutral-50 p-6">
        <h3 className="text-base font-semibold text-neutral-900">Current Box</h3>
        <ul className="mt-4 flex flex-col gap-4">
          {order.items.map((item) => (
            <li key={item.optionId}>
              <p className="text-xs text-neutral-500">
                {orderLineLabel(item)}
                <span className="ml-1.5 text-neutral-400">
                  {formatKg(item.weightKg * item.quantity)}
                </span>
              </p>
              <p className="text-sm font-semibold text-neutral-900">{formatNaira(item.lineTotal)}</p>
            </li>
          ))}
        </ul>

        {canCancel(order) && (
          <button
            type="button"
            onClick={confirmCancel}
            className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-lg border border-neutral-300 bg-white text-sm font-semibold text-neutral-900 transition hover:bg-neutral-100"
          >
            Cancel Meat Box
          </button>
        )}
      </div>
    </div>
  );
}
