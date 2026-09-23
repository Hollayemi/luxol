import ProductSection from "./ProductSection";
import { dealProducts } from "@/app/data/home-data";

export default function DealOfTheDay() {
  return (
    <ProductSection
      id="deal-of-the-day"
      title="Deal of the day"
      viewAllHref="/offers"
      viewAllLabel="View all deals →"
      products={dealProducts}
    />
  );
}
