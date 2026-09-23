"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { formatNaira, type Product } from "./product";

export default function ProductRow({ product }: { product: Product }) {
  const [added, setAdded] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  function handleAdd() {
    // Same event as ProductCard, so one cart listener handles both views.
    window.dispatchEvent(new CustomEvent("cart:add", { detail: product }));

    setAdded(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setAdded(false), 1500);
  }

  const href = `/product/${product.slug}`;

  return (
    <article className="flex flex-wrap items-center gap-x-5 gap-y-4 border-b border-neutral-200 py-6 sm:flex-nowrap sm:gap-x-8">
      {/* Image link is hidden from keyboard/AT; the product name is the real link */}
      <Link
        href={href}
        tabIndex={-1}
        aria-hidden="true"
        className="relative block size-24 shrink-0 sm:size-[140px]"
      >
        <Image
          src={product.image}
          alt=""
          fill
          sizes="140px"
          className="object-contain"
        />
      </Link>

      <div className="min-w-0 flex-1">
        <h3 className="text-base font-medium text-neutral-700 sm:text-lg">
          <Link
            href={href}
            className="hover:text-luxol-green focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-luxol-green"
          >
            {product.name}
          </Link>
        </h3>

        <p className="mt-0.5 text-xs text-neutral-500">Qty: {product.qty}</p>

        <p className="mt-2 flex flex-wrap items-baseline gap-x-3">
          <span className="text-2xl font-bold text-neutral-800 sm:text-[28px]">
            {formatNaira(product.price)}
          </span>
          {product.oldPrice ? (
            <del className="text-sm text-neutral-400">
              {formatNaira(product.oldPrice)}
            </del>
          ) : null}
        </p>
      </div>

      <div className="flex w-full gap-2 sm:w-[150px] sm:flex-col">
        <div
          onClick={handleAdd}
          className="inline-flex h-11! min-h-11 flex-1 items-center justify-center rounded-lg bg-luxol-green px-4 text-sm font-medium text-white transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-luxol-green"
        >
          {added ? (
            "Added"
          ) : (
            <>
              Add to Cart<span className="sr-only"> {product.name}</span>
            </>
          )}
        </div>

        <Link
          href={href}
          className="inline-flex h-11 min-h-11 flex-1 items-center justify-center rounded-lg border border-luxol-green px-4 text-sm font-medium text-luxol-green transition hover:bg-luxol-green hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-luxol-green"
        >
          View Details<span className="sr-only"> for {product.name}</span>
        </Link>
      </div>
    </article>
  );
}