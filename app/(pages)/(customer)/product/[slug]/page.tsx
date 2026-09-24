import { DeliveryIcon } from "@/app/components/ui/icons";
import ProductCard from "@/app/components/ui/ProductCard";
import ProductGallery from "@/app/components/ui/ProductGallery";
import ProductPurchase from "@/app/components/ui/ProductPurchase";
import { siteConfig } from "@/app/config/site";
import { getProductBySlug, getRelatedProducts } from "@/app/lib/catalog";
import { formatNaira } from "@/app/utils/product";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

type Params = Promise<{ slug: string }>;

const container = "mx-auto w-full max-w-[1240px] px-4 sm:px-6";

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) return { title: "Product not found | Luxol Supermarket" };

  return {
    title: `${product.name} | Luxol Supermarket`,
    description: product.description,
  };
}

export default async function ProductPage({ params }: { params: Params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  const related = await getRelatedProducts(slug, 5);
  const categoryLabel = siteConfig.categories.find(
    (c) => c.slug === product.category,
  )?.label;
  const images = product.gallery?.length ? product.gallery : [product.image];

  return (
    <div>
      {/* Page banner */}
      <section className="bg-[#f2f2f0] py-12 text-center sm:py-16">
        <div className={container}>
          <p className="text-3xl font-bold text-neutral-900 sm:text-4xl">Shop</p>
          <nav aria-label="Breadcrumb" className="mt-3 text-sm">
            <ol className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-neutral-900">
              <li>
                <Link href="/" className="hover:text-luxol-green">
                  Home
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link href="/shop" className="hover:text-luxol-green">
                  Shop
                </Link>
              </li>
              {categoryLabel && (
                <>
                  <li aria-hidden="true">/</li>
                  <li>
                    <Link
                      href={`/shop?category=${product.category}`}
                      className="hover:text-luxol-green"
                    >
                      {categoryLabel}
                    </Link>
                  </li>
                </>
              )}
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="font-medium text-luxol-green">
                Product Details
              </li>
            </ol>
          </nav>
        </div>
      </section>

      <div className={`${container} py-12 sm:py-16`}>
        {/* Gallery + purchase panel */}
        <div className="grid gap-10 lg:grid-cols-[minmax(0,490px)_minmax(0,1fr)] lg:gap-14">
          <ProductGallery images={images} name={product.name} />

          <div>
            <h1 className="text-2xl font-semibold text-neutral-700 sm:text-[28px]">
              {product.name}
            </h1>

            {product.description && (
              <p className="mt-3 max-w-[640px] text-base leading-relaxed text-neutral-500">
                {product.description}
              </p>
            )}

            <p className="mt-5 flex flex-wrap items-baseline gap-x-3">
              <span className="text-4xl font-bold text-neutral-900">
                {formatNaira(product.price)}
              </span>
              {product.oldPrice ? (
                <del className="text-base text-neutral-400">
                  {formatNaira(product.oldPrice)}
                </del>
              ) : null}
            </p>

            {product.delivery && (
              <p className="mt-5 inline-flex items-center gap-2.5 rounded-lg bg-[#eaf3e6] px-4 py-3 text-sm text-luxol-green">
                <DeliveryIcon className="size-4 shrink-0" />
                30 minutes to 2 Hours delivery depending on location
              </p>
            )}

            <div className="mt-8">
              <ProductPurchase product={product} variants={product.variants} />
            </div>
          </div>
        </div>

        {/* About */}
        {(product.about || (product.ingredients?.length ?? 0) > 0) && (
          <section
            aria-labelledby="about-heading"
            className="mt-16 max-w-[720px] sm:mt-20"
          >
            <h2
              id="about-heading"
              className="text-2xl font-semibold text-neutral-700"
            >
              About this product
            </h2>

            {product.about && (
              <p className="mt-4 text-base leading-relaxed text-neutral-500">
                {product.about}
              </p>
            )}

            {product.ingredients && product.ingredients.length > 0 && (
              <>
                <h3 className="mt-10 text-xl text-neutral-600">
                  What&rsquo;s inside
                </h3>
                <ul className="mt-5 flex flex-col gap-4">
                  {product.ingredients.map((ingredient) => (
                    <li
                      key={ingredient}
                      className="flex items-center gap-4 text-base text-neutral-600"
                    >
                      <span
                        aria-hidden="true"
                        className="size-3 shrink-0 rounded-full border-2 border-neutral-400"
                      />
                      {ingredient}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </section>
        )}

        {/* Related products */}
        {related.length > 0 && (
          <section
            aria-labelledby="related-heading"
            className="mt-20 sm:mt-28"
          >
            <div className="text-center">
              <p className="text-lg font-semibold text-neutral-500">
                Related Products
              </p>
              <h2
                id="related-heading"
                className="mt-2 text-3xl font-bold text-neutral-800 sm:text-4xl"
              >
                Explore <span className="text-luxol-green">Related Products</span>
              </h2>
            </div>

            <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-5 lg:gap-x-5">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
