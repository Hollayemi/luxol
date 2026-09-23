"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { formatNaira, type Product } from "../../utils/product";

export default function ProductCard({ product }: { product: Product }) {
  const [added, setAdded] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  function handleAdd() {
    // Your cart can listen for this: window.addEventListener("cart:add", ...)
    window.dispatchEvent(new CustomEvent("cart:add", { detail: product }));

    setAdded(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setAdded(false), 1500);
  }

  const href = `/product/${product.slug}`;

  return (
    <article className="group min-w-0">
      <div className="relative aspect-[11/10] overflow-hidden rounded-xl  border-neutral-200 bg-white">
        {/* Image link is hidden from keyboard/AT; the product name below is the real link */}
        <Link
          href={href}
          tabIndex={-1}
          aria-hidden="true"
          className="absolute inset-0"
        >
          <Image
            src={product.image}
            alt=""
            fill
            sizes="(min-width: 1024px) 190px, (min-width: 640px) 30vw, 46vw"
            className="object-contain p-2 transition-transform duration-300 group-hover:scale-105"
          />
        </Link>

        {product.discountPercent ? (
          <span className="pointer-events-none absolute left-2 top-2 flex size-9 flex-col items-center justify-center rounded-full bg-luxol-green text-[9px] font-bold leading-none text-white">
            <span>{product.discountPercent}%</span>
            <span>OFF</span>
          </span>
        ) : null}

        <button
          type="button"
          onClick={handleAdd}
          aria-label={`Add ${product.name} to cart`}
          className="absolute bottom-2 right-0 inline-flex h-7 -translate-x-2 items-center gap-1 whitespace-nowrap rounded-md border border-neutral-300 bg-white px-3 text-[11px] font-medium text-luxol-green shadow-sm transition hover:border-luxol-green hover:bg-luxol-green hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-luxol-green"
        >
          {added ? (
            "Added"
          ) : (
            <>
              Add to Cart <span aria-hidden="true">+</span>
            </>
          )}
        </button>
      </div>

      <div className="mt-2.5">
        <h3 className="truncate text-sm font-medium text-neutral-800">
          <Link
            href={href}
            title={product.name}
            className="hover:text-luxol-green focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-luxol-green"
          >
            {product.name}
          </Link>
        </h3>

        <p className="mt-0.5 text-xs text-neutral-500">Qty: {product.qty}</p>

        <p className="mt-1.5 flex flex-wrap items-baseline gap-x-2">
          <span className="text-base font-bold text-neutral-900">
            {formatNaira(product.price)}
          </span>
          {product.oldPrice ? (
            <del className="text-xs text-neutral-400">
              {formatNaira(product.oldPrice)}
            </del>
          ) : null}
        </p>
      </div>
    </article>
  );
}
