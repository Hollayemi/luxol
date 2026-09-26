"use client";

import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  CANCELLED_ORDERS,
  ORDERS,
  type Order,
  type OrdersTab,
} from "@/app/data/orders-data";
import EmptyOrderState from "./components/EmptyOrderState";
import OrderDetail from "./components/OrderDetail";
import OrderList from "./components/OrderList";

/** Mark the tracker's rating step as done, timestamped "just now". */
function applyRating(order: Order, stars: number, comment: string): Order {
  const receivedStep = order.track.find((s) => s.id === "received");

  return {
    ...order,
    rating: {
      stars: Math.min(5, Math.max(1, stars)) as 1 | 2 | 3 | 4 | 5,
      comment: comment || undefined,
      submittedAt: new Date().toISOString(),
    },
    track: order.track.map((step) =>
      step.id === "rate"
        ? {
            ...step,
            state: "done",
            time: "Just now",
            month: step.month ?? receivedStep?.month,
            day: step.day ?? receivedStep?.day,
          }
        : step,
    ),
  };
}

export default function OrdersClient({
  initialTab,
  initialOrderId,
}: {
  initialTab: OrdersTab;
  initialOrderId?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [tab, setTab] = useState<OrdersTab>(initialTab);
  const [selectedId, setSelectedId] = useState<string | undefined>(initialOrderId);
  const [orders, setOrders] = useState<Order[]>(ORDERS);

  const ordersForTab = useMemo(
    () => (tab === "orders" ? orders : CANCELLED_ORDERS),
    [tab, orders],
  );

  const selectedOrder = useMemo(
    () => ordersForTab.find((o) => o.id === selectedId),
    [ordersForTab, selectedId],
  );

  function syncUrl(nextTab: OrdersTab, nextOrderId?: string) {
    const params = new URLSearchParams();
    if (nextTab === "cancelled") params.set("tab", "cancelled");
    if (nextOrderId) params.set("order", nextOrderId);
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  function handleTabChange(nextTab: OrdersTab) {
    setTab(nextTab);
    setSelectedId(undefined);
    syncUrl(nextTab, undefined);
  }

  function handleSelect(id: string) {
    setSelectedId(id);
    syncUrl(tab, id);
  }

  function handleBack() {
    setSelectedId(undefined);
    syncUrl(tab, undefined);
  }

  function handleSubmitRating(orderId: string, stars: number, comment: string) {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? applyRating(o, stars, comment) : o)),
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[350px_minmax(0,1fr)] lg:gap-10">
      <div className={selectedOrder ? "hidden lg:block" : "block"}>
        <OrderList
          activeTab={tab}
          onTabChange={handleTabChange}
          orders={ordersForTab}
          selectedId={selectedId}
          onSelect={handleSelect}
        />
      </div>

      <div className={selectedOrder ? "block" : "hidden lg:block"}>
        {selectedOrder ? (
          <>
            <button
              type="button"
              onClick={handleBack}
              className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-neutral-500 hover:text-luxol-green lg:hidden"
            >
              ← Back to orders
            </button>
            <OrderDetail order={selectedOrder} onSubmitRating={handleSubmitRating} />
          </>
        ) : (
          <EmptyOrderState />
        )}
      </div>
    </div>
  );
}
