import type { Metadata } from "next";
import Link from "next/link";
import WishlistClient from "./WishlistClient";

export const metadata: Metadata = {
  title: "Wishlist | Luxol Supermarket",
};

const container = "mx-auto w-full max-w-[1240px] px-4 sm:px-6";

export default function WishlistPage() {
  return (
    <div>
      {/* Page banner */}
      <section className="bg-[#f2f2f0] py-10 text-center sm:py-12">
        <div className={container}>
          <h1 className="text-3xl font-bold text-neutral-900 sm:text-4xl">Wishlist</h1>
          <nav aria-label="Breadcrumb" className="mt-3 text-sm">
            <ol className="flex items-center justify-center gap-2 text-neutral-900">
              <li>
                <Link href="/" className="hover:text-luxol-green">
                  Home
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="text-luxol-green">
                My Wishlist
              </li>
            </ol>
          </nav>
        </div>
      </section>

      <div className={`${container} py-10 sm:py-14`}>
        <WishlistClient />
      </div>
    </div>
  );
}
