import { freshProducts } from "@/app/data/home-data";
import ProductSection from "./ProductSection";

export default function FreshProducts() {
  return (
    <ProductSection
      id="fresh-products"
      title="Fresh Products"
      viewAllHref="/shop?category=vegetables-produce"
      viewAllLabel="View all products →"
      products={freshProducts}
    />
  );
}
