import Image from "next/image";
import Link from "next/link";

export default function PromoBanners() {
  return (
    <section
      aria-label="Promotions"
      className="mx-auto w-full max-w-[1240px] px-4 pb-12 sm:px-6 sm:pb-14"
    >
      <div className="grid gap-5 lg:grid-cols-[1.45fr_1fr]">
        {/* Weekend Super Saver */}
        <article className="relative isolate min-h-[250px] overflow-hidden rounded-2xl bg-luxol-greeen text-white sm:min-h-[270px]">
          <Image
              src="/images/flyer1.webp"
              alt=""
              fill
              sizes="(min-width: 1024px) 360px, 50vw"
              className="object-contain "
            />
        </article>

        {/* 30 minute delivery */}
        <article className="relative isolate min-h-[250px] overflow-hidden rounded-2xl bg-[#@@d6eadb] sm:min-h-[270px] ">
          <Image
              src="/images/flyer2.webp"
              alt=""
              fill
              sizes="(min-width: 1024px) 360px, 50vw"
              className="object-contain "
            />
        </article>
      </div>
    </section>
  );
}
