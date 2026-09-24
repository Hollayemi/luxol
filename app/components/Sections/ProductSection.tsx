"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Product } from "../../utils/product";
import ProductCard from "../ui/ProductCard";
import { fadeUp, stagger, viewportOnce } from "../ui/motion";

type ProductSectionProps = {
  id: string;
  title: string;
  viewAllHref: string;
  viewAllLabel?: string;
  products: Product[];
};

const cardVariant = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};

export default function ProductSection({
  id,
  title,
  viewAllHref,
  viewAllLabel = "View all →",
  products,
}: ProductSectionProps) {
  const reduce = useReducedMotion();
  const v = reduce ? { hidden: { opacity: 1 }, show: { opacity: 1 } } : cardVariant;

  return (
    <section
      aria-labelledby={`${id}-heading`}
      className="mx-auto w-full max-w-[1240px] px-4 pb-12 sm:px-6 sm:pb-14"
    >
      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        className="flex items-baseline justify-between gap-4"
      >
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
      </motion.div>

      <motion.div
        variants={stagger(0.06)}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.15 }}
        className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6 lg:gap-5"
      >
        {products.map((product) => (
          <motion.div key={product.id} variants={v as any}>
            <ProductCard product={product} />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}