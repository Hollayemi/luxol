/** One number in the stat strip at the top of a page ("486 / Total Products / +12.4% this month"). */
export function StatCard({
  value,
  label,
  change,
  loading,
}: {
  value: string;
  label: string;
  /** e.g. "+12.4% this month" or "+23 this month" — omit if there's nothing to compare to */
  change?: string;
  loading?: boolean;
}) {
  if (loading) {
    return (
      <div className="flex-1 space-y-2 px-6 py-1 first:pl-0 last:pr-0">
        <div className="h-7 w-16 animate-pulse rounded bg-neutral-100" />
        <div className="h-4 w-24 animate-pulse rounded bg-neutral-100" />
      </div>
    );
  }

  return (
    <div className="flex-1 px-6 text-center first:pl-0 last:pr-0 sm:text-left">
      <p className="text-2xl font-bold text-neutral-900 sm:text-[28px]">{value}</p>
      <p className="mt-1 text-sm text-neutral-500">{label}</p>
      {change && (
        <p className="mt-1.5 flex items-center justify-center gap-1 text-xs font-medium text-emerald-600 sm:justify-start">
          <span aria-hidden="true">↑</span>
          {change}
        </p>
      )}
    </div>
  );
}

/** The white card that holds a row of StatCards, divided by vertical rules. */
export function StatCardRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col divide-y divide-neutral-100 rounded-2xl border border-neutral-100 bg-white sm:flex-row sm:divide-x sm:divide-y-0">
      {children}
    </div>
  );
}
