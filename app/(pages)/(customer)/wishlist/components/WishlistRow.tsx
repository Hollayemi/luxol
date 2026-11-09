"use client";

import Image from "next/image";
import Link from "next/link";
import { formatNaira, getDisplayPrice, toCartAddDetail } from "@/app/utils/product";
import { useIsInCart } from "@/redux/hooks";
import type { WishlistItem } from "@/redux/types/wishlist";

/** The column layout shared by the orange header bar and every row. */
export const WISHLIST_COLUMNS = "md:grid-cols-[minmax(0,2.4fr)_minmax(0,1fr)_minmax(0,1fr)_auto]";

export type WishlistRowProps = {
  item: WishlistItem;
  /** Called with the product id when the × is pressed. */
  onRemove: (productId: string) => void;
};

export default function WishlistRow({ item, onRemove }: WishlistRowProps) {
  const { product } = item;
  const { price, wasPrice } = getDisplayPrice(product);
  const inCart = useIsInCart(product.id);

  const unavailable = product.status !== "ACTIVE";
  const outOfStock = product.stock <= 0;
  const canBuy = !unavailable && !outOfStock;
  // A product with variants needs a choice (size, pack...), made on its own page
  const needsOptions = product.variants.length > 0;
  const href = `/product/${product.slug}`;

  function handleAdd() {
    if (!canBuy) return;
    // Same event every other "Add to Cart" button uses (see CartEvents in AppProviders)
    window.dispatchEvent(new CustomEvent("cart:add", { detail: toCartAddDetail(product) }));
  }

  const actionClass =
    "inline-flex h-12 min-w-36 items-center justify-center rounded-lg bg-luxol-green px-6 text-sm font-medium text-white transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-luxol-green disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <li className={`grid items-center gap-x-4 gap-y-4 border-b border-neutral-200 px-2 py-6 md:px-4 ${WISHLIST_COLUMNS}`}>
      <div className="flex min-w-0 items-center gap-4">
        <button
          type="button"
          onClick={() => onRemove(product.id)}
          aria-label={`Remove ${product.name} from wishlist`}
          className="flex size-8 shrink-0 items-center justify-center rounded-full text-neutral-800 transition hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-luxol-green"
        >
          <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>

        <Link href={href} className="relative block size-20 shrink-0 overflow-hidden rounded-lg bg-neutral-50 sm:size-24">
          {product.images[0] ? (
            <Image
              src={product.images[0]}
              alt=""
              fill
              sizes="96px"
              className="object-contain p-1"
            />
          ) : null}
        </Link>

        <Link
          href={href}
          className="min-w-0 text-base font-medium text-neutral-800 hover:text-luxol-green focus-visible:outline-2 focus-visible:outline-luxol-green sm:text-lg"
        >
          {product.name}
        </Link>
      </div>

      <p className="flex items-baseline gap-2 text-lg font-medium text-neutral-900 md:block">
        <span className="text-sm font-normal text-neutral-500 md:hidden">Price:</span>
        {formatNaira(price)}
        {wasPrice !== undefined && (
          <span className="ml-2 text-sm font-normal text-neutral-400 line-through">
            {formatNaira(wasPrice)}
          </span>
        )}
      </p>

      <p className={`text-lg font-medium ${canBuy ? "text-luxol-green" : "text-luxol-orange"}`}>
        {unavailable ? "Unavailable" : outOfStock ? "Out of Stock" : "In Stock"}
      </p>

      {needsOptions && canBuy ? (
        <Link href={href} className={actionClass}>
          Select options
        </Link>
      ) : (
        <button
          type="button"
          onClick={handleAdd}
          disabled={!canBuy || inCart}
          className={actionClass}
        >
          {inCart ? "Added to Cart" : "Add to Cart"}
        </button>
      )}
    </li>
  );
}
