"use client";

import { useState } from "react";
import { ConfirmDialog } from "@/app/components/admin/ConfirmDialog";
import { useDialog } from "@/app/components/dialog/DialogProvider";
import {
  canCancel,
  formatNairaRange,
  formatNextDelivery,
  MEAT_BOX_STATUS_LABEL,
} from "@/app/utils/meat-box";
import { formatNaira } from "@/app/utils/product";
import { notify } from "@/lib/notify";
import { getErrorMessage } from "@/redux/config/errors";
import {
  useCancelMeatBoxOrderMutation,
  usePlaceMeatBoxOrderMutation,
} from "@/redux/slices/meatBoxApi";
import type { MeatBoxOrder } from "@/redux/types";

function Headline({ order }: { order: MeatBoxOrder }) {
  if (order.confirmedTotal != null) {
    return <p className="mt-3 text-3xl font-bold">{formatNaira(order.confirmedTotal)}</p>;
  }
  return (
    <>
      <p className="mt-3 text-2xl font-bold">Pending weighing</p>
      {order.estimatedTotal && (
        <p className="mt-1 text-xs text-white/70">
          Estimated {formatNairaRange(order.estimatedTotal)}
        </p>
      )}
    </>
  );
}

function Message({ order }: { order: MeatBoxOrder }) {
  const text: Partial<Record<MeatBoxOrder["status"], string>> = {
    pending_weighing:
      "We're preparing and weighing your meat. We'll confirm the price within 1 to 24 hours.",
    price_confirmed: "Your price is confirmed. Place the order to pay and lock in your delivery.",
    processing: "Payment received. Your box is being prepared.",
    out_for_delivery: "Your Meat Box is on its way.",
  };
  const message = text[order.status];
  return message ? <p className="mt-4 text-xs leading-relaxed text-white/80">{message}</p> : null;
}

export default function OngoingBox({ order }: { order: MeatBoxOrder }) {
  const { openDialog } = useDialog();
  const [place, { isLoading: placing }] = usePlaceMeatBoxOrderMutation();
  const [cancel] = useCancelMeatBoxOrderMutation();
  const [redirecting, setRedirecting] = useState(false);

  async function placeOrder() {
    try {
      const res = await place(order.id).unwrap();
      setRedirecting(true);
      window.location.assign(res.data.payment.authorizationUrl);
    } catch (err) {
      notify.error("We couldn't place your order", { message: getErrorMessage(err) });
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

        <Headline order={order} />
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

        {order.status === "price_confirmed" && (
          <button
            type="button"
            onClick={() => void placeOrder()}
            disabled={placing || redirecting}
            className="mt-5 inline-flex h-12 w-full items-center justify-center rounded-xl bg-luxol-orange px-6 text-sm font-semibold text-black transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {redirecting
              ? "Taking you to payment…"
              : placing
                ? "Processing…"
                : `Place Order${order.confirmedTotal != null ? ` · ${formatNaira(order.confirmedTotal)}` : ""}`}
          </button>
        )}
      </div>

      <div className="rounded-3xl bg-neutral-50 p-6">
        <h3 className="text-base font-semibold text-neutral-900">Current Box</h3>
        <ul className="mt-4 flex flex-col gap-4">
          {order.items.map((item) => (
            <li key={item.optionId}>
              <p className="text-xs text-neutral-500">
                {item.unit === "kg" ? `${item.label} (${item.quantity}kg)` : `${item.label} ×${item.quantity}`}
              </p>
              <p className="text-sm font-semibold text-neutral-900">
                {item.lineTotal != null ? formatNaira(item.lineTotal) : "Pending"}
              </p>
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
