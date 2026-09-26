import type { Metadata } from "next";
import Link from "next/link";
import { getTabForOrder, type OrdersTab } from "@/app/data/orders-data";
import OrdersClient from "./OrdersClient";

export const metadata: Metadata = {
  title: "My Orders | Luxol Supermarket",
};

const container = "mx-auto w-full max-w-[1240px] px-4 sm:px-6";

type SearchParams = Promise<{ order?: string | string[]; tab?: string | string[] }>;

function first(v?: string | string[]) {
  return Array.isArray(v) ? v[0] : v;
}

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const orderId = first(sp.order);

  const tabFromOrder = orderId ? getTabForOrder(orderId) : undefined;
  const tabParam = first(sp.tab);
  const initialTab: OrdersTab =
    tabFromOrder ?? (tabParam === "cancelled" ? "cancelled" : "orders");

  return (
    <div>
      {/* Page banner */}
      <section className="bg-[#f2f2f0] py-10 sm:py-12">
       <div className={container}>
          <h1 className="text-3xl font-bold text-center text-neutral-900 sm:text-4xl">
            My Orders
          </h1>

          <nav aria-label="Breadcrumb" className="mt-3 text-sm">
            <ol className="flex items-center justify-center gap-2 text-neutral-900">
              <li>
                <Link href="/" className="hover:text-luxol-green">
                  Home
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
               
                  <span aria-current="page" className="text-luxol-green">
                    orders
                  </span>
               
              </li>
            </ol>
          </nav>
        </div>
      </section>

      <div className={`${container} py-10 sm:py-14`}>
        <OrdersClient
          initialTab={initialTab}
          initialOrderId={orderId && tabFromOrder ? orderId : undefined}
        />
      </div>
    </div>
  );
}
