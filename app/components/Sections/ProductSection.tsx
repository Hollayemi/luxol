import Link from "next/link";
import { Product } from "./product";
import ProductCard from "./ProductCard";

type ProductSectionProps = {
  id: string;
  title: string;
  viewAllHref: string;
  viewAllLabel?: string;
  products: Product[];
};

export default function ProductSection({
  id,
  title,
  viewAllHref,
  viewAllLabel = "View all →",
  products,
}: ProductSectionProps) {
  return (
    <section
      aria-labelledby={`${id}-heading`}
      className="mx-auto w-full max-w-[1240px] px-4 pb-12 sm:px-6 sm:pb-14"
    >
      <div className="flex items-baseline justify-between gap-4">
        <h2
          id={`${id}-heading`}
          className="text-xl font-bold text-neutral-900 sm:text-2xl"
        >
          {title}
        </h2>
        <Link
          href={viewAllHref}
          className="text-xs font-medium text-luxol-green hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-luxol-green sm:text-sm"
        >
          {viewAllLabel}
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6 lg:gap-5">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
