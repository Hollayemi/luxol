import Image from "next/image";
import Link from "next/link";

export default function Hero() {
  return (
    <section
      aria-labelledby="hero-heading"
      className="relative isolate overflow-hidden bg-[#f5f8ef]"
    >
      {/* Background image (decorative) */}
      <Image
        src="/images/hero.webp"
        alt=""
        fill
        priority
        sizes="100vw"
        className="-z-10 object-cover object-right"
      />

      {/* Keeps the text readable when the basket sits behind it on small screens */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-linear-to-r from-[#f5f8ef]/95 via-[#f5f8ef]/70 to-transparent lg:hidden"
      />

      <div className="mx-auto flex min-h-[440px] w-full max-w-[1240px] items-center px-4 py-14 sm:min-h-[480px] sm:px-6 lg:min-h-[520px]">
        <div className="max-w-[500px]">
          <p className="text-xs font-medium uppercase tracking-wide text-luxol-green sm:text-sm">
            Freshness you can trust
          </p>

          <h1
            id="hero-heading"
            className="mt-4 text-4xl font-bold leading-[1.1] tracking-tight text-neutral-900 sm:text-5xl lg:text-[56px]"
          >
            <span className="block text-luxol-orange">Quality food,</span>
            delivered to your door.
          </h1>

          <p className="mt-5 max-w-[420px] text-sm leading-relaxed text-neutral-700 sm:text-base">
            Fresh meat, everyday groceries, and carefully selected essentials
            all in one place, delivered fresh and ready for your home.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/shop"
              className="inline-flex h-11 items-center rounded-lg bg-luxol-green px-6 text-sm font-medium text-white transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-luxol-green"
            >
              Start Shopping
            </Link>
            <Link
              href="/categories"
              className="inline-flex h-11 items-center rounded-lg bg-luxol-orange px-6 text-sm font-medium text-white transition hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-luxol-orange"
            >
              Browse categories
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
