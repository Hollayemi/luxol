"use client";

import ProductSection from "./ProductSection";
import { useListStorefrontProductsQuery } from "@/redux/slices/catalogApi";

export default function FreshProducts() {
  const { data, isLoading } = useListStorefrontProductsQuery({
    tag: "popular",
    perPage: 6,
  });

  return (
    <ProductSection
      id="fresh-products"
      title="Popular Products"
      viewAllHref="/popular"
      viewAllLabel="View all products →"
      products={data?.data.items ?? []}
      isLoading={isLoading}
    />
  );
}