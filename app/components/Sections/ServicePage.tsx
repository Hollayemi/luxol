import Image from "next/image";
import Link from "next/link";

type Heading = { lead: string; accent: string };

export type ServiceStep = {
  title: string;
  summary: string;
  detail: string;
};

export type ServicePageProps = {
  /** Full-width photo under the header (decorative) */
  bannerImage: string;
  intro: {
    heading: Heading;
    description: string;
    benefitsTitle: string;
    benefits: string[];
    cta: { label: string; href: string };
    image: {
      src: string;
      alt: string;
      /** "card" = rounded photo, "cutout" = product shot with no background */
      style: "card" | "cutout";
    };
    imageSide: "left" | "right";
  };
  howItWorks: {
    heading: Heading;
    description: string;
    steps: ServiceStep[];
  };
};

const container = "mx-auto w-full max-w-[1100px] px-4 sm:px-6";

function BenefitIcon() {
  return (
    <span
      aria-hidden="true"
      className="flex size-6 shrink-0 items-center justify-center rounded-full border-2 border-luxol-orange/60"
    >
      <span className="size-2.5 rounded-full border border-luxol-orange bg-luxol-orange/20" />
    </span>
  );
}

/**
 * Shared layout for the Meat Box and Freezer Planner pages:
 * banner photo, intro with benefits and a call to action, and a
 * four step "how it works" section on green.
 */
export default function ServicePage({
  bannerImage,
  intro,
  howItWorks,
}: ServicePageProps) {
  const imageFirst = intro.imageSide === "left";

  return (
    <div>
      {/* Banner */}
      <div className="relative h-[200px] w-full overflow-hidden bg-neutral-200 sm:h-[260px] lg:h-[320px]">
        <Image
          src={bannerImage}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      </div>

      {/* Intro */}
      <section
        aria-labelledby="service-heading"
        className={`${container} py-14 sm:py-20 lg:py-24`}
      >
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-20">
          <div className={imageFirst ? "lg:order-2" : ""}>
            <h1
              id="service-heading"
              className="text-3xl font-bold leading-tight text-neutral-800 sm:text-4xl"
            >
              {intro.heading.lead}{" "}
              <span className="text-luxol-orange">{intro.heading.accent}</span>
            </h1>

            <p className="mt-6 max-w-[440px] text-sm leading-relaxed text-neutral-500 sm:text-[15px]">
              {intro.description}
            </p>

            <h2 className="mt-9 text-base font-semibold text-neutral-900">
              {intro.benefitsTitle}
            </h2>

            <ul className="mt-5 flex flex-col gap-4">
              {intro.benefits.map((benefit) => (
                <li
                  key={benefit}
                  className="flex items-center gap-4 text-sm text-neutral-600"
                >
                  <BenefitIcon />
                  {benefit}
                </li>
              ))}
            </ul>

            <Link
              href={intro.cta.href}
              className="mt-10 inline-flex h-12 items-center gap-2 rounded-lg bg-luxol-green px-6 text-sm font-medium text-white transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-luxol-green"
            >
              {intro.cta.label} <span aria-hidden="true">→</span>
            </Link>
          </div>

          <div className={imageFirst ? "lg:order-1" : ""}>
            {intro.image.style === "card" ? (
              <div className="relative mx-auto aspect-[4/5] w-full max-w-[390px] overflow-hidden rounded-[32px] bg-neutral-100">
                <Image
                  src={intro.image.src}
                  alt={intro.image.alt}
                  fill
                  sizes="(min-width: 1024px) 390px, 90vw"
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="relative mx-auto aspect-square w-full max-w-[440px]">
                <Image
                  src={intro.image.src}
                  alt={intro.image.alt}
                  fill
                  sizes="(min-width: 1024px) 440px, 90vw"
                  className="object-contain"
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section
        id="how-it-works"
        aria-labelledby="how-it-works-heading"
        className="bg-luxol-green py-16 text-white sm:py-24"
      >
        <div className={container}>
          <p className="text-sm uppercase tracking-wide text-white/70">
            How it works
          </p>

          <h2
            id="how-it-works-heading"
            className="mt-3 text-3xl font-bold leading-tight sm:text-4xl"
          >
            <span className="block">{howItWorks.heading.lead}</span>
            <span className="block text-luxol-orange">
              {howItWorks.heading.accent}
            </span>
          </h2>

          <p className="mt-6 max-w-[560px] text-sm leading-relaxed text-white/90">
            {howItWorks.description}
          </p>

          <ol className="mt-14 grid gap-12 sm:grid-cols-2 lg:mt-20 lg:grid-cols-4 lg:gap-10">
            {howItWorks.steps.map((step, i) => {
              const last = i === howItWorks.steps.length - 1;
              return (
                <li key={step.title}>
                  <div className="flex items-center">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-luxol-orange text-sm font-bold text-white">
                      {i + 1}
                    </span>
                    {!last && (
                      <span
                        aria-hidden="true"
                        className="hidden h-px flex-1 bg-white/40 lg:-mr-10 lg:block"
                      />
                    )}
                  </div>

                  <h3 className="mt-8 max-w-[200px] text-lg font-semibold leading-snug text-luxol-orange">
                    {step.title}
                  </h3>
                  <p className="mt-5 max-w-[220px] text-sm text-white/90">
                    {step.summary}
                  </p>
                  <p className="mt-5 max-w-[230px] text-sm leading-relaxed text-white/80">
                    {step.detail}
                  </p>
                </li>
              );
            })}
          </ol>
        </div>
      </section>
    </div>
  );
}
