import type { PromotionStatus } from "@/redux/types";

const STYLES: Record<PromotionStatus, { label: string; className: string }> = {
  active: { label: "Active", className: "bg-[#e7f4e4] text-luxol-green" },
  scheduled: { label: "Scheduled", className: "bg-[#fdf0da] text-amber-700" },
  inactive: { label: "Inactive", className: "bg-neutral-100 text-neutral-600" },
  expired: { label: "Expired", className: "bg-neutral-200 text-neutral-600" },
  paused: { label: "Paused", className: "bg-[#fdf0da] text-amber-700" },
};

export function PromotionStatusPill({ status }: { status: PromotionStatus }) {
  const s = STYLES[status];
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${s.className}`}>
      {s.label}
    </span>
  );
}
