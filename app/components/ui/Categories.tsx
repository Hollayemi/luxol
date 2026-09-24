"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

const TILE_BG: Record<string, string> = {
  "meat-protein": "#fbe9e9",
  "fish-seafood": "#e6f1e8",
  "grains-staples": "#f6e9ee",
  "vegetables-produce": "#e6f3e4",
  bakery: "#fbf1dc",
  groceries: "#fbf3df",
  drinks: "#efe9f6",
  essentials: "#e6f3e4",
};

const categories = [
  { label: "All Categories", slug: "all" },
  { label: "Meat and Protein", slug: "meat-protein" },
  { label: "Fish & Sea Food", slug: "fish-seafood" },
  { label: "Grains and Staples", slug: "grains-staples" },
  { label: "Vegetables and Produce", slug: "vegetables-produce" },
  { label: "Bakery", slug: "bakery" },
  { label: "Groceries", slug: "groceries" },
  { label: "Drinks", slug: "drinks" },
];

// Container orchestration: staggers children on mount
const listVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
};

// Each tile fades up + scales in subtly
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function Categories({
  fromShop,
  category,
}: {
  fromShop?: boolean;
  category?: string;
}) {
  const prefersReducedMotion = useReducedMotion();

  // Respect users who prefer less motion
  const variants = prefersReducedMotion
    ? { hidden: { opacity: 1 }, show: { opacity: 1 } }
    : itemVariants;

  return (
    <section
      aria-labelledby="categories-heading"
      className={`mx-auto w-full max-w-[1240px] px-4 ${
        fromShop ? "py-1" : "py-12 sm:px-6 sm:py-16"
      }`}
    >
      {!fromShop && (
        <div className="text-center">
          <h2
            id="categories-heading"
            className="text-xl font-semibold text-luxol-green sm:text-2xl"
          >
            Shop by Categories
          </h2>
          <span
            aria-hidden="true"
            className="mx-auto mt-2 block h-0.5 w-14 rounded-full bg-luxol-orange"
          />
        </div>
      )}

      {/*
        Mobile (< sm): horizontal scroll / snap slide
        sm+: original grid layout
      */}
      <motion.ul
        variants={listVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        className="
          mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4
          [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden
          sm:grid sm:grid-cols-4 sm:gap-x-4 sm:gap-y-8 sm:overflow-visible sm:pb-0
          lg:grid-cols-8
        "
      >
        {categories.map((cat, i) => {
          const active = category === cat.slug;
          return (
            <motion.li
              key={cat.slug}
              variants={variants as any}
              className="shrink-0 snap-start sm:shrink"
            >
              <motion.div
                whileHover={prefersReducedMotion ? undefined : { y: -4 }}
                whileTap={prefersReducedMotion ? undefined : { scale: 0.97 }}
                transition={{ type: "spring", stiffness: 320, damping: 24 }}
              >
                <Link
                  href={`/shop?category=${cat.slug}`}
                  aria-current={active ? "true" : undefined}
                  className="group flex flex-col items-center gap-3 rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-luxol-green"
                >
                  <span
                    className={`relative flex size-[92px] items-center justify-center overflow-hidden rounded-full ring-2 transition sm:size-[100px] ${
                      active
                        ? "ring-luxol-green"
                        : "ring-transparent group-hover:ring-luxol-orange/60"
                    }`}
                    style={{
                      backgroundColor:
                        cat.slug === "all"
                          ? "#fbf3dc"
                          : TILE_BG[cat.slug] ?? "#f1f5ee",
                    }}
                  >
                    {cat.slug === "all" ? (
                      <span
                        aria-hidden="true"
                        className="grid grid-cols-2 gap-1.5"
                      >
                        <span className="size-5 rounded-md bg-[#f1d47f]" />
                        <span className="size-5 rounded-md bg-[#c9563f]" />
                        <span className="size-5 rounded-md bg-[#7fb28c]" />
                        <span className="size-5 rounded-md bg-[#f0a04b]" />
                      </span>
                    ) : (
                      <Image
                        src={`/images/cate${i}.png`}
                        alt=""
                        fill
                        sizes="112px"
                        className="object-contain p-3"
                      />
                    )}
                  </span>

                  <span className="max-w-[120px] text-center text-sm font-medium leading-snug text-neutral-800 transition-colors group-hover:text-luxol-green">
                    {cat.label}
                  </span>
                </Link>
              </motion.div>
            </motion.li>
          );
        })}
      </motion.ul>
    </section>
  );
}