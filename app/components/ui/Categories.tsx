import Image from "next/image";
import Link from "next/link";


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
  // { label: "Essentials", slug: "essentials" },
]


export default function Categories({ fromShop, category }: { fromShop?: boolean, category?: string }) {
  return (
    <section
    aria-labelledby="categories-heading"
    className={`mx-auto w-full max-w-[1240px] px-4 ${fromShop ? "py-1" : "py-12 sm:px-6 sm:py-16"}`}
    >
     {!fromShop && <div className="text-center">
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
      </div>}

      <ul className="mt-10 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-4 lg:grid-cols-8">
        {categories.map((cat, i) => {
          const active = category === cat.slug
          return (<li key={cat.slug}>
            <Link
              href={`/shop?category=${cat.slug}`}
              aria-current={active ? "true" : undefined}
              className="group flex flex-col items-center gap-3 rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-luxol-green"
            >
              <span
                className={`relative flex size-[92px] items-center justify-center overflow-hidden rounded-full transition ring-2 sm:size-[100px] ${
                        active
                          ? "ring-luxol-green"
                          : "ring-transparent group-hover:ring-luxol-orange/60"
                      }`}
                style={{
                  backgroundColor:
                    cat.slug === "all"
                      ? "#fbf3dc"
                      : (TILE_BG[cat.slug] ?? "#f1f5ee"),
                }}
              >
                {cat.slug === "all" ? (
                  <span aria-hidden="true" className="grid grid-cols-2 gap-1.5">
                    <span className="size-5 rounded-md bg-[#f1d47f]" />
                    <span className="size-5 rounded-md bg-[#c9563f]" />
                    <span className="size-5 rounded-md bg-[#7fb28c]" />
                    <span className="size-5 rounded-md bg-[#f0a04b]" />
                  </span>
                ) :
                  <Image
                    src={`/images/cate${i}.png`}
                    alt=""
                    fill
                    sizes="112px"
                    className="object-contain p-3"
                  />
                }
              </span>

              <span className="max-w-[120px] text-center text-sm font-medium leading-snug text-neutral-800 transition-colors group-hover:text-luxol-green">
                {cat.label}
              </span>
            </Link>
          </li>
        )})}
      </ul>
    </section>
  );
}
