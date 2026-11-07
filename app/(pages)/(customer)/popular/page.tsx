import type { Metadata } from "next";
import { Suspense } from "react";
import ShopClient from "../shop/ShopClient";

export const metadata: Metadata = {
  title: "Popular Products | Luxol Supermarket",
};

export default function ShopPage() {
  return (
    <Suspense fallback={null}>
      <ShopClient config={{
        title: "Popular Products",
        tag: "popular",
        page: "popular",
        showCategory: false,
        showSort: false,
        showView: false,
        showPagination: false
      }} />
    </Suspense>
  );
}