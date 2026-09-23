export type Product = {
  id: string;
  slug: string;
  name: string;
  qty: number;
  price: number;
  /** Original price, shown struck through when the product is discounted. */
  oldPrice?: number;
  /** Shown in the green badge on the product image, e.g. 15 -> "15% OFF". */
  discountPercent?: number;
  /** Path under /public, e.g. /products/okro-500g.webp */
  image: string;
};

/** 1840 -> "₦1,840", 1462.5 -> "₦1,462.50" */
export function formatNaira(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
