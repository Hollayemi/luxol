import type { AdminMeatBoxPaymentStatus, AdminMeatBoxStatus } from "@/redux/types";
import { MEAT_BOX_PAYMENT_LABELS, MEAT_BOX_STATUS_LABELS } from "./formatters";

const STATUS_STYLES: Record<AdminMeatBoxStatus, { pill: string; dot: string }> = {
  PENDING_WEIGHING: { pill: "bg-neutral-100 text-neutral-600", dot: "bg-neutral-400" },
  PRICE_CONFIRMED: { pill: "bg-[#efe9fb] text-violet-700", dot: "bg-violet-500" },
  PROCESSING: { pill: "bg-[#fdf0da] text-amber-700", dot: "bg-amber-500" },
  OUT_FOR_DELIVERY: { pill: "bg-[#e6effb] text-blue-700", dot: "bg-blue-500" },
  COMPLETED: { pill: "bg-[#e7f4e4] text-luxol-green", dot: "bg-luxol-green" },
  CANCELLED: { pill: "bg-[#fbe9e9] text-red-600", dot: "bg-red-500" },
};

export type MeatBoxStatusPillProps = {
  status: AdminMeatBoxStatus;
  /** "table" is the big coloured cell, "compact" is the small dotted pill in the drawer. */
  size?: "table" | "compact";
};

export function MeatBoxStatusPill({ status, size = "table" }: MeatBoxStatusPillProps) {
  const style = STATUS_STYLES[status];

  if (size === "compact") {
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium ${style.pill}`}
      >
        <span aria-hidden="true" className={`size-1.5 rounded-full ${style.dot}`} />
        {MEAT_BOX_STATUS_LABELS[status]}
      </span>
    );
  }

  return (
    <span className={`inline-flex rounded-lg px-4 py-2 text-sm font-medium ${style.pill}`}>
      {MEAT_BOX_STATUS_LABELS[status]}
    </span>
  );
}

const PAYMENT_STYLES: Record<AdminMeatBoxPaymentStatus, string> = {
  UNPAID: "bg-[#fdf0da] text-amber-700",
  PAID: "bg-[#e7f4e4] text-luxol-green",
  REFUNDED: "bg-neutral-100 text-neutral-600",
};

export type MeatBoxPaymentPillProps = { status: AdminMeatBoxPaymentStatus };

/** The green "Paid" pill under Payment in the drawer. */
export function MeatBoxPaymentPill({ status }: MeatBoxPaymentPillProps) {
  return (
    <span
      className={`inline-flex rounded-md px-2.5 py-1 text-xs font-medium ${PAYMENT_STYLES[status]}`}
    >
      {MEAT_BOX_PAYMENT_LABELS[status]}
    </span>
  );
}
