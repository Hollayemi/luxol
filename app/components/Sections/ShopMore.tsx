import { shopMoreProducts } from "@/app/data/home-data";
import ProductSection from "./ProductSection";

export default function ShopMore() {
  return (
    <div className="bg-[#f6f6f3] pt-12 sm:pt-14">
      <ProductSection
        id="shop-more"
        title="Shop More"
        viewAllHref="/shop"
        viewAllLabel="View all products →"
        products={shopMoreProducts}
      />
    </div>
  );
}
