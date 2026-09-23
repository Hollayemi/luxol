import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Product } from "../components/Sections/product";
import { shopMoreProducts } from "../data/home-data";
import { siteConfig } from "../config/site";
import { ChevronDownIcon } from "../components/ui/icons";
import ProductCard from "../components/Sections/ProductCard";
import ProductRow from "../components/Sections/ProductRow";
import { Categories } from "../components/Sections";

export const metadata: Metadata = {
  title: "Shop | Luxol Supermarket",
};

/* ------------------------------------------------------------------ */
/* Placeholder data layer                                              */
/* Replace CATALOG + getProducts() with your API / database call.      */
/* ------------------------------------------------------------------ */

type CatalogItem = Product & { category: string };

const PAGE_SIZE = 24;

const SHOP_MORE_CATEGORY: Record<string, string> = {
  "meat-pie": "bakery",
  "shushu-parfait-and-mousse": "groceries",
  "viju-v-smartic-wheat-1l": "drinks",
  "backwood-s-russian-cream": "groceries",
  "sweet-bite": "bakery",
  "special-doughnut": "bakery",
  "frosty-bite-ice-cream-fantasy": "groceries",
  "heineken-can-beer-33cl": "drinks",
  "fayrouz-pineapple-can": "drinks",
  "peak-powder-tin-2500g": "groceries",
  "mec-chills-parfait-400ml": "groceries",
  "fanta-orange-can-drink": "drinks",
};

const withCategory = (p: Product): CatalogItem => ({
  ...p,
  category: SHOP_MORE_CATEGORY[p.slug] ?? "groceries",
});

/** Image path is /products/<slug>.webp */
function item(
  slug: string,
  name: string,
  price: number,
  category: string,
): CatalogItem {
  return {
    id: slug,
    slug,
    name,
    qty: 20,
    price,
    image: `/products/${slug}.webp`,
    category,
  };
}

// Same order as the design: rows 1 and 3 reuse the home page products.
const CATALOG: CatalogItem[] = [
  ...shopMoreProducts.slice(0, 6).map(withCategory),
  item("5alive-delight-berry-blast", "5Alive Delight Berry Blast", 1400, "drinks"),
  item("ewedu-big-bundle", "Ewedu - Big Bundle", 3000, "vegetables-produce"),
  item("plantain-unripe-x12", "Plantain - Unripe x12", 5500, "vegetables-produce"),
  item("plantain-ripe-x12", "Plantain - Ripe x12", 6800, "vegetables-produce"),
  item("scent-leaf-efirin", "Scent Leaf (Efirin)", 300, "vegetables-produce"),
  item("blue-band-spread", "Blue Band Spread for Bread", 3000, "groceries"),
  ...shopMoreProducts.slice(6).map(withCategory),
  item("elle-vire-butter-salted", "Elle & Vire Butter Salted", 8630, "groceries"),
  item("fanice-ice-cream-vanilla", "Fanice Ice Cream Vanilla", 14190, "groceries"),
  item("olmeca-tequila-silver", "Olmeca Tequila Silver", 27800, "drinks"),
  item("nestle-milo-energy-food-drink", "Nestle Milo Energy Food Drink", 6740, "groceries"),
  item("black-forest-cake", "Black Forest Cake", 1530, "bakery"),
  item("mcvities-butter-shortbread", "Mcvities Butter Shortbread", 9350, "groceries"),
];

const SORTS = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "name-asc", label: "Name: A to Z" },
] as const;

type SortValue = (typeof SORTS)[number]["value"];

async function getProducts(opts: {
  category: string;
  q: string;
  sort: SortValue;
  page: number;
}) {
  const q = opts.q.toLowerCase();

  const list = CATALOG.filter(
    (p) =>
      (opts.category === "all" || p.category === opts.category) &&
      (!q || p.name.toLowerCase().includes(q)),
  );

  if (opts.sort === "price-asc") list.sort((a, b) => a.price - b.price);
  if (opts.sort === "price-desc") list.sort((a, b) => b.price - a.price);
  if (opts.sort === "name-asc") list.sort((a, b) => a.name.localeCompare(b.name));

  const total = list.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(opts.page, totalPages);

  return {
    items: list.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    total,
    totalPages,
    page,
  };
}

/* ------------------------------------------------------------------ */
/* URL state helpers                                                   */
/* ------------------------------------------------------------------ */

type ViewMode = "grid" | "list";

type State = {
  category: string;
  q: string;
  sort: SortValue;
  view: ViewMode;
  page: number;
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const first = (v: string | string[] | undefined) =>
  Array.isArray(v) ? v[0] : v;

function buildHref(state: State, patch: Partial<State> = {}) {
  const next = { ...state, ...patch };
  const params = new URLSearchParams();

  if (next.category !== "all") params.set("category", next.category);
  if (next.q) params.set("q", next.q);
  if (next.sort !== "featured") params.set("sort", next.sort);
  if (next.view !== "grid") params.set("view", next.view);
  if (next.page > 1) params.set("page", String(next.page));

  const qs = params.toString();
  return qs ? `/shop?${qs}` : "/shop";
}

function pageItems(current: number, total: number): (number | "…")[] {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);

  const items: (number | "…")[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  if (start > 2) items.push("…");
  for (let i = start; i <= end; i++) items.push(i);
  if (end < total - 1) items.push("…");
  items.push(total);

  return items;
}

/* Same pastel circles as the home page categories */
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

const container = "mx-auto w-full max-w-[1240px] px-4 sm:px-6";


export default async function ShopPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;

  const rawCategory = first(sp.category) ?? "all";
  const category = siteConfig.categories.some((c) => c.slug === rawCategory)
    ? rawCategory
    : "all";
  const q = (first(sp.q) ?? "").trim().slice(0, 80);
  const sort: SortValue =
    SORTS.find((s) => s.value === first(sp.sort))?.value ?? "featured";
  const view: ViewMode = first(sp.view) === "list" ? "list" : "grid";
  const requestedPage = Math.max(1, Number.parseInt(first(sp.page) ?? "1", 10) || 1);

  const { items, total, totalPages, page } = await getProducts({
    category,
    q,
    sort,
    page: requestedPage,
  });

  const state: State = { category, q, sort, view, page };
  const categoryLabel =
    category === "all"
      ? null
      : siteConfig.categories.find((c) => c.slug === category)?.label;
  const sortLabel = SORTS.find((s) => s.value === sort)?.label ?? "Featured";

  const tiles = [
    { slug: "all", label: "All Product" },
    ...siteConfig.categories.filter((c) => c.slug !== "all"),
  ];

  return (
    <div>
      {/* Page banner */}
      <section className="bg-[#f2f2f0] py-12 text-center sm:py-16">
        <div className={container}>
          <h1 className="text-3xl font-bold text-neutral-900 sm:text-4xl">
            Shop
          </h1>

          <nav aria-label="Breadcrumb" className="mt-3 text-sm">
            <ol className="flex items-center justify-center gap-2 text-neutral-900">
              <li>
                <Link href="/" className="hover:text-luxol-green">
                  Home
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                {categoryLabel ? (
                  <Link href="/shop" className="hover:text-luxol-green">
                    Shop
                  </Link>
                ) : (
                  <span aria-current="page" className="text-luxol-green">
                    Shop
                  </span>
                )}
              </li>
              {categoryLabel && (
                <>
                  <li aria-hidden="true">/</li>
                  <li aria-current="page" className="text-luxol-green">
                    {categoryLabel}
                  </li>
                </>
              )}
            </ol>
          </nav>
        </div>
      </section>

      <div className={`${container} py-12 sm:py-16`}>
        {/* Category filter */}
        <Categories fromShop category={category} />
        {/* <nav aria-label="Filter by category">
          <ul className="flex flex-wrap justify-center gap-x-6 gap-y-6">
            {tiles.map((tile, i) => {
              const active = tile.slug === category;
              return (
                <li key={tile.slug} className="w-[104px]">
                  <Link
                    href={buildHref(state, { category: tile.slug, page: 1 })}
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
                          tile.slug === "all"
                            ? "#fbf3dc"
                            : (TILE_BG[tile.slug] ?? "#f1f5ee"),
                      }}
                    >
                      {tile.slug === "all" ? (
                        <span aria-hidden="true" className="grid grid-cols-2 gap-1.5">
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
                          sizes="100px"
                          className="object-contain p-3"
                        />
                      )}
                    </span>

                    <span
                      className={`text-center text-sm font-medium leading-snug transition-colors ${
                        active
                          ? "text-luxol-orange"
                          : "text-neutral-800 group-hover:text-luxol-green"
                      }`}
                    >
                      {tile.label}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav> */}

        {/* Toolbar: sort + view */}
        <div className="mt-12 flex items-center justify-between border-y border-neutral-200 py-4 sm:mt-16">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-neutral-900">Sort By</span>

            <details key={sort} className="group relative">
              <summary className="flex cursor-pointer list-none items-center gap-2 text-sm text-neutral-500 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-luxol-green [&::-webkit-details-marker]:hidden">
                {sortLabel}
                <ChevronDownIcon className="size-4 transition-transform group-open:rotate-180" />
              </summary>

              <ul className="absolute left-0 top-full z-20 mt-3 w-52 rounded-lg border border-neutral-200 bg-white py-1 shadow-lg">
                {SORTS.map((s) => (
                  <li key={s.value}>
                    <Link
                      href={buildHref(state, { sort: s.value, page: 1 })}
                      aria-current={s.value === sort ? "true" : undefined}
                      className={`block px-4 py-2 text-sm hover:bg-neutral-50 ${
                        s.value === sort
                          ? "font-medium text-luxol-green"
                          : "text-neutral-700"
                      }`}
                    >
                      {s.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </details>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-neutral-900">View as</span>

            <Link
              href={buildHref(state, { view: "list" })}
              aria-label="Larger cards"
              aria-current={view === "list" ? "true" : undefined}
              className={`rounded p-1 transition-colors ${
                view === "list"
                  ? "text-neutral-900"
                  : "text-neutral-400 hover:text-neutral-700"
              }`}
            >
              <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
                <line x1="4" y1="7" x2="20" y2="7" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="17" x2="20" y2="17" />
              </svg>
            </Link>

            <Link
              href={buildHref(state, { view: "grid" })}
              aria-label="Compact grid"
              aria-current={view === "grid" ? "true" : undefined}
              className={`rounded p-1 transition-colors ${
                view === "grid"
                  ? "text-neutral-900"
                  : "text-neutral-400 hover:text-neutral-700"
              }`}
            >
              <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden="true">
                <rect x="4" y="4" width="6" height="6" rx="1.5" />
                <rect x="14" y="4" width="6" height="6" rx="1.5" />
                <rect x="4" y="14" width="6" height="6" rx="1.5" />
                <rect x="14" y="14" width="6" height="6" rx="1.5" />
              </svg>
            </Link>
          </div>
        </div>

        {q && (
          <p className="mt-6 text-sm text-neutral-600" aria-live="polite">
            {total} {total === 1 ? "result" : "results"} for “{q}”
          </p>
        )}

        {/* Products */}
        {items.length > 0 ? (
          view === "grid" ? (
            <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-6 lg:gap-x-5">
              {items.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="mt-2">
              {items.map((product) => (
                <ProductRow key={product.id} product={product} />
              ))}
            </div>
          )
        ) : (
          <div className="py-20 text-center">
            <p className="text-lg font-semibold text-neutral-900">
              No products found
            </p>
            <p className="mt-2 text-sm text-neutral-500">
              Try a different category or search term.
            </p>
            <Link
              href="/shop"
              className="mt-6 inline-flex h-11 items-center rounded-lg bg-luxol-green px-6 text-sm font-medium text-white transition hover:brightness-110"
            >
              Clear filters
            </Link>
          </div>
        )}

        {/* Pagination */}
        {items.length > 0 && (
          <nav
            aria-label="Pagination"
            className="mt-16 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm sm:gap-x-10"
          >
            {page > 1 ? (
              <Link
                href={buildHref(state, { page: page - 1 })}
                rel="prev"
                className="inline-flex items-center gap-2 text-neutral-900 hover:text-luxol-green"
              >
                <ChevronDownIcon className="size-4 rotate-90" />
                Previous
              </Link>
            ) : (
              <span
                aria-disabled="true"
                className="inline-flex items-center gap-2 text-neutral-400"
              >
                <ChevronDownIcon className="size-4 rotate-90" />
                Previous
              </span>
            )}

            <ul className="flex items-center gap-4">
              {pageItems(page, totalPages).map((entry, i) =>
                entry === "…" ? (
                  <li key={`gap-${i}`} aria-hidden="true" className="text-neutral-500">
                    …
                  </li>
                ) : (
                  <li key={entry}>
                    <Link
                      href={buildHref(state, { page: entry })}
                      aria-label={`Page ${entry}`}
                      aria-current={entry === page ? "page" : undefined}
                      className={
                        entry === page
                          ? "font-medium text-luxol-orange underline underline-offset-8"
                          : "text-neutral-900 hover:text-luxol-green"
                      }
                    >
                      {entry}
                    </Link>
                  </li>
                ),
              )}
            </ul>

            {page < totalPages ? (
              <Link
                href={buildHref(state, { page: page + 1 })}
                rel="next"
                className="inline-flex items-center gap-2 font-medium text-neutral-900 hover:text-luxol-green"
              >
                Next
                <ChevronDownIcon className="size-4 -rotate-90" />
              </Link>
            ) : (
              <span
                aria-disabled="true"
                className="inline-flex items-center gap-2 font-medium text-neutral-400"
              >
                Next
                <ChevronDownIcon className="size-4 -rotate-90" />
              </span>
            )}
          </nav>
        )}
      </div>
    </div>
  );
}