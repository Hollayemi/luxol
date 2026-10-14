"use client";

import { useState } from "react";
import { notify } from "@/lib/notify";
import { getErrorMessage } from "@/redux/config/errors";
import { useCancelAdminMeatBoxOrderMutation } from "@/redux/slices/adminMeatBoxApi";
import type { AdminMeatBoxOrderDetail } from "@/redux/types";
import { formatMeatBoxCode } from "./formatters";

const MIN_REASON_LENGTH = 3;

export type CancelMeatBoxOrderFormProps = {
  order: AdminMeatBoxOrderDetail;
  /** Back to the action buttons (also called after a successful cancel). */
  onBack: () => void;
};

/** Replaces the drawer's footer buttons while staff confirm a cancellation. */
export function CancelMeatBoxOrderForm({ order, onBack }: CancelMeatBoxOrderFormProps) {
  const [cancelOrder, { isLoading }] = useCancelAdminMeatBoxOrderMutation();
  const [reason, setReason] = useState("");
  const trimmed = reason.trim();

  async function handleSubmit() {
    try {
      await cancelOrder({ id: order.id, reason: trimmed }).unwrap();
      notify.success("Order cancelled", {
        message: `${formatMeatBoxCode(order.code)} has been cancelled.`,
      });
      onBack();
    } catch (err) {
      notify.error("Couldn't cancel order", { message: getErrorMessage(err) });
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="meat-box-cancel-reason" className="text-sm font-medium text-neutral-900">
          Why is this order being cancelled?
        </label>
        <p className="mt-1 text-xs text-neutral-500">
          This is saved on the order timeline. Cancelling can&apos;t be undone.
        </p>
        <textarea
          id="meat-box-cancel-reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          disabled={isLoading}
          rows={3}
          maxLength={300}
          placeholder="e.g. Animal unavailable this week"
          className="mt-2 w-full resize-none rounded-xl border border-neutral-200 px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-red-500/30"
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          disabled={isLoading}
          className="h-11 flex-1 rounded-xl border border-neutral-300 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50 disabled:opacity-60"
        >
          Keep Order
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isLoading || trimmed.length < MIN_REASON_LENGTH}
          className="h-11 flex-1 rounded-xl bg-[#c0392b] text-sm font-medium text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? "Cancelling..." : "Cancel Order"}
        </button>
      </div>
    </div>
  );
}
