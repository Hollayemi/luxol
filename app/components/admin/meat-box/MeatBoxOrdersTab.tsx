"use client";

import { useEffect, useState } from "react";
import { AdminToolbar } from "@/app/components/admin/AdminToolbar";
import { Pagination } from "@/app/components/admin/Pagination";
import { StatCard, StatCardRow } from "@/app/components/admin/StatCard";
import AdminIcon from "@/app/components/admin/layout/AdminIcon";
import { PeriodSelect } from "@/app/components/admin/orders/OrderSelects";
import { csvCell, formatCount, formatOrderDateTime, getStatChange } from "@/app/components/admin/orders/formatters";
import { notify } from "@/lib/notify";
import { getErrorMessage } from "@/redux/config/errors";
import { useGetAdminMeatBoxStatsQuery, useListAdminMeatBoxOrdersQuery } from "@/redux/slices/adminMeatBoxApi";
import type { AdminMeatBoxStatus, AdminOrderPeriod, AdminOrderStat } from "@/redux/types";
import {
  formatDeliveryFrequency,
  formatMeatBoxCode,
  MEAT_BOX_PAYMENT_LABELS,
  MEAT_BOX_STATUS_LABELS,
} from "./formatters";
import { MeatBoxOrderTable, MeatBoxOrderTableSkeleton } from "./MeatBoxOrderTable";
import { MeatBoxStatusFilterSelect } from "./MeatBoxStatusFilterSelect";

const DEFAULT_PER_PAGE = 8;
/** Orders come in all day: refresh the table and numbers while the tab is in view. */
const POLL_MS = 60_000;
const POLL_OPTIONS = { pollingInterval: POLL_MS, skipPollingIfUnfocused: true } as const;

function useDebouncedValue<T>(value: T, delayMs: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);
  return debounced;
}

/** The "Orders" tab: stat strip, searchable table, and the order drawer on row click. */
export function MeatBoxOrdersTab() {
  const [period, setPeriod] = useState<AdminOrderPeriod>("this_month");
  const [status, setStatus] = useState<AdminMeatBoxStatus | "">("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(DEFAULT_PER_PAGE);
  const debouncedSearch = useDebouncedValue(search.trim(), 350);

  const stats = useGetAdminMeatBoxStatsQuery({ period }, POLL_OPTIONS);
  const orders = useListAdminMeatBoxOrdersQuery(
    {
      period,
      status: status || undefined,
      search: debouncedSearch || undefined,
      page,
      perPage,
    },
    POLL_OPTIONS,
  );

  const s = stats.data?.data;
  // currentData is undefined while the args just changed, so the skeleton
  // shows then, but not on a background poll (isFetching alone would flash).
  const statsLoading = stats.currentData === undefined && stats.isFetching;
  const list = orders.currentData?.data;
  const listLoading = orders.currentData === undefined && orders.isFetching;
  const hasFilters = !!debouncedSearch || !!status;

  function statCard(label: string, stat: AdminOrderStat | undefined) {
    const change = stat ? getStatChange(stat, period) : undefined;
    return (
      <StatCard
        loading={statsLoading}
        value={stat ? formatCount(stat.value) : "-"}
        label={label}
        change={change?.text}
        trend={change?.trend}
      />
    );
  }

  function resetPage<T>(setter: (value: T) => void) {
    return (value: T) => {
      setter(value);
      setPage(1);
    };
  }

  function handleExport() {
    if (!list || list.items.length === 0) return;

    const header = [
      "Order",
      "Customer",
      "Date & Time",
      "Amount (NGN)",
      "Weight (kg)",
      "No of Items",
      "Frequency",
      "Delivery Date",
      "Status",
      "Payment",
    ];
    const rows = list.items.map((o) => [
      formatMeatBoxCode(o.code),
      o.customer.fullName,
      formatOrderDateTime(o.placedAt),
      o.total,
      o.totalWeightKg,
      o.itemsCount,
      formatDeliveryFrequency(o.deliveryFrequency),
      o.deliveredAt ? formatOrderDateTime(o.deliveredAt) : "",
      MEAT_BOX_STATUS_LABELS[o.status],
      MEAT_BOX_PAYMENT_LABELS[o.paymentStatus],
    ]);
    const csv = [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `luxol-meat-box-orders-page-${page}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    notify.success("Export started", { message: "This page's orders were downloaded as a CSV." });
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <PeriodSelect value={period} onChange={resetPage(setPeriod)} />
      </div>

      <StatCardRow>
        {statCard("Total Orders", s?.totalOrders)}
        {statCard("Pending Payment", s?.pendingPayment)}
        {statCard("Processing", s?.processing)}
        {statCard("Out for Delivery", s?.outForDelivery)}
        {statCard("Completed", s?.completed)}
      </StatCardRow>

      <div className="rounded-2xl border border-neutral-100 bg-white p-5 sm:p-6">
        <AdminToolbar
          search={search}
          onSearchChange={resetPage(setSearch)}
          placeholder="Search using order id or customer name......"
          extra={<MeatBoxStatusFilterSelect value={status} onChange={resetPage(setStatus)} />}
          onExport={handleExport}
          exportDisabled={!list || list.items.length === 0}
        />
      </div>

      <div className="rounded-2xl border border-neutral-100 bg-white p-5 sm:p-6">
        {listLoading ? (
          <MeatBoxOrderTableSkeleton rows={perPage > 12 ? 12 : perPage} />
        ) : orders.isError ? (
          <ErrorState message={getErrorMessage(orders.error)} onRetry={orders.refetch} />
        ) : !list || list.items.length === 0 ? (
          <EmptyState hasFilters={hasFilters} />
        ) : (
          <>
            <MeatBoxOrderTable orders={list.items} />
            <Pagination
              page={list.page}
              perPage={list.perPage}
              total={list.total}
              onPageChange={setPage}
              onPerPageChange={(n) => {
                setPerPage(n);
                setPage(1);
              }}
            />
          </>
        )}
      </div>
    </div>
  );
}

function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <span className="flex size-14 items-center justify-center rounded-full bg-neutral-100 text-neutral-400">
        <AdminIcon name="meatBox" className="size-7" />
      </span>
      <p className="text-sm font-medium text-neutral-900">
        {hasFilters ? "No Meat Box orders match your search" : "No Meat Box orders yet"}
      </p>
      <p className="max-w-sm text-sm text-neutral-500">
        {hasFilters
          ? "Try a different order number, customer or status."
          : "Meat Box orders placed in this period will show up here."}
      </p>
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <p className="text-sm text-neutral-600">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-50"
      >
        Try again
      </button>
    </div>
  );
}
