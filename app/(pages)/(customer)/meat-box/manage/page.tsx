import type { Metadata } from "next";
import Link from "next/link";
import ManageClient from "./ManageClient";

export const metadata: Metadata = {
  title: "Manage Meat Box | Luxol Supermarket",
};

const container = "mx-auto w-full max-w-[1240px] px-4 sm:px-6";

type SearchParams = Promise<{ order?: string | string[] }>;

export default async function ManageMeatBoxPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  // The payment provider returns the customer here with ?order=<id>
  const orderId = Array.isArray(sp.order) ? sp.order[0] : sp.order;

  return (
    <div>
      <section className="bg-[#f2f2f0] py-10 text-center sm:py-12">
        <div className={container}>
          <h1 className="text-3xl font-bold text-neutral-900 sm:text-4xl">Meat Box</h1>
          <nav aria-label="Breadcrumb" className="mt-3 text-sm">
            <ol className="flex items-center justify-center gap-x-2 text-neutral-600">
              <li>
                <Link href="/" className="hover:text-luxol-green">
                  Home
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="font-medium text-luxol-green">
                Manage Meat Box / Order History
              </li>
            </ol>
          </nav>
        </div>
      </section>

      <div className={`${container} py-10 sm:py-14`}>
        <ManageClient highlightOrderId={orderId} />
      </div>
    </div>
  );
}
