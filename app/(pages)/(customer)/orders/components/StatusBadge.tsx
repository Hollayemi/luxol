import {
  CheckCircleIcon,
  ProgressDotsIcon,
  XCircleIcon,
} from "@/app/components/ui/icons";
import { STATUS_LABEL, type OrderStatus } from "@/app/data/orders-data";

const STYLES: Record<OrderStatus, string> = {
  "in-progress": "text-luxol-orange",
  completed: "text-luxol-green",
  cancelled: "text-red-500",
  returned: "text-red-500",
};

function StatusIcon({ status, className }: { status: OrderStatus; className?: string }) {
  if (status === "in-progress") return <ProgressDotsIcon className={className} />;
  if (status === "completed") return <CheckCircleIcon className={className} />;
  return <XCircleIcon className={className} />;
}

export default function StatusBadge({
  status,
  className = "",
}: {
  status: OrderStatus;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-semibold ${STYLES[status]} ${className}`}
    >
      <StatusIcon status={status} className="size-3.5 shrink-0" />
      {STATUS_LABEL[status]}
    </span>
  );
}
