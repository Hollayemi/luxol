/**
 * Public storefront catalog: categories and products as the customer-facing
 * pages (home, shop, search, product detail) consume them. This is the
 * public read side of the same catalog the admin Inventory pages manage
 * (see inventory.ts) — adjust field names here to match the NestJS DTOs
 * once the backend exists.
 */

/** A tile in "Shop by Categories" / the shop page category filter. */
export type StorefrontCategory = {
  id: string;
  /** URL-safe identifier used in ?category=<slug> */
  slug: string;
  name: string;
  image?: string | null;
  /** Position in the storefront category list */
  displayOrder: number;
  productCount: number;
};

/**
 * A product as shown on the storefront: home sections, shop grid/list,
 * search results, related products and the product detail page.
 */
export type StorefrontProduct = {
  id: string;
  slug: string;
  name: string;
  /** Available quantity/units, shown as "Qty: n" on the card */
  qty: number;
  unitPrice: number;
  /** Original price, shown struck through when the product is discounted */
  oldPrice?: number;
  /** e.g. 15 -> "15% OFF" badge */
  discountPercent?: number;
  /** Primary image path/URL */
  images: string[];
  /** Extra images for the product detail gallery */
  gallery?: string[];
  categorySlug: string;
  /** e.g. "fresh" | "packaged" | "packs" | "cartons" — drives the search page's Type filter */
  productType?: string;
  inStock: boolean;
  delivery: boolean;
  pickup: boolean;
  /** Labels used to place a product in a home section, e.g. "deal-of-the-day", "fresh-products", "shop-more" */
  tags?: string[];
  description?: string;
  about?: string;
  ingredients?: string[];
  /** e.g. "Small" | "Medium" | "Large" */
  variants?: string[];
};

/** Query params for the shop and search pages: filters, sort and pagination. */
export type ListStorefrontProductsParams = {
  /** Matches product name/SKU */
  search?: string;
  /** Category slug(s); omit or "all" for every category */
  category?: string | string[];
  /** Only products carrying this tag, for home-page sections */
  tag?: string;
  minPrice?: number;
  maxPrice?: number;
  /** Product type filter on the search page, e.g. "fresh" | "frozen" | "processed" */
  types?: string[];
  /** "in-stock" | "delivery" | "pickup" */
  availability?: string[];
  /** lowercase variant names, e.g. "small" */
  sizes?: string[];
  sort?: "featured" | "price-asc" | "price-desc" | "name-asc";
  page?: number;
  perPage?: number;
};

export type ListRelatedProductsParams = {
  slug: string;
  limit?: number;
};
