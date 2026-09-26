"use client";

import {
  formatOrderDate,
  formatOrderId,
  getItemsCount,
  type Order,
  type OrdersTab,
} from "@/app/data/orders-data";
import StatusBadge from "./StatusBadge";

const TABS: { value: OrdersTab; label: string }[] = [
  { value: "orders", label: "Orders" },
  { value: "cancelled", label: "Cancelled / Returned" },
];

export default function OrderList({
  activeTab,
  onTabChange,
  orders,
  selectedId,
  onSelect,
}: {
  activeTab: OrdersTab;
  onTabChange: (tab: OrdersTab) => void;
  orders: Order[];
  selectedId?: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div>
      {/* Tabs */}
      <div role="tablist" aria-label="Order status" className="flex border-b border-neutral-200">
        {TABS.map((tab) => {
          const active = tab.value === activeTab;
          return (
            <button
              key={tab.value}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onTabChange(tab.value)}
              className={`relative -mb-px whitespace-nowrap px-1 pb-3 text-sm font-semibold transition-colors first:mr-8 focus-visible:outline-none ${
                active ? "text-luxol-orange" : "text-neutral-400 hover:text-neutral-600"
              }`}
            >
              {tab.label}
              {active && (
                <span
                  aria-hidden="true"
                  className="absolute -bottom-px left-0 h-0.5 w-full rounded-full bg-luxol-green"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* List */}
      {orders.length === 0 ? (
        <p className="py-10 text-center text-sm text-neutral-400">
          No orders here yet.
        </p>
      ) : (
        <ul className="mt-1 flex flex-col">
          {orders.map((order) => {
            const selected = order.id === selectedId;
            return (
              <li key={order.id}>
                <button
                  type="button"
                  onClick={() => onSelect(order.id)}
                  aria-current={selected ? "true" : undefined}
                  className={`flex w-full items-start justify-between gap-3 rounded-xl px-3 py-4 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-luxol-green ${
                    selected ? "bg-[#faf1e6]" : "hover:bg-neutral-50"
                  }`}
                >
                  <span>
                    <span
                      className={`block text-sm font-semibold ${
                        selected ? "text-luxol-orange" : "text-neutral-900"
                      }`}
                    >
                      Order {formatOrderId(order)}
                    </span>
                    <span
                      className={`mt-1 block text-xs ${
                        selected ? "text-luxol-orange/70" : "text-neutral-400"
                      }`}
                    >
                      {formatOrderDate(order.placedAt)} · {getItemsCount(order)} items
                    </span>
                  </span>

                  <StatusBadge status={order.status} className="mt-0.5 shrink-0" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
