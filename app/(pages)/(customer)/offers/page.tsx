import type { Metadata } from "next";
import { Suspense } from "react";
import ShopClient from "../shop/ShopClient";

export const metadata: Metadata = {
  title: "Deals | Luxol Supermarket",
};

export default function ShopPage() {
  return (
    <Suspense fallback={null}>
      <ShopClient config={{
        title: "Deals of the Day",
        tag: "deal-of-the-day",
        page: "offers",
        showCategory: false,
        showSort: false,
        showView: false,
        showPagination: false
      }} />
    </Suspense>
  );
}