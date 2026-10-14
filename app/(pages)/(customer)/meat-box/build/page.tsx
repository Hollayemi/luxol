import type { Metadata } from "next";
import Link from "next/link";
import BuildClient from "./BuildClient";

export const metadata: Metadata = {
  title: "Build Your Meat Box | Luxol Supermarket",
  description:
    "Choose whole, half or quarter animals and cuts by the kilo, then tell us how you want them delivered.",
};

const container = "mx-auto w-full max-w-[1240px] px-4 sm:px-6";

export default function BuildMeatBoxPage() {
  return (
    <div>
      <section className="bg-[#f2f2f0] py-10 text-center sm:py-12">
        <div className={container}>
          <h1 className="text-3xl font-bold text-neutral-900 sm:text-4xl">Meat Box</h1>
          <nav aria-label="Breadcrumb" className="mt-3 text-sm">
            <ol className="flex items-center justify-center gap-x-2 text-neutral-600">
              <li>
                <Link href="/" className="hover:text-luxol-green">
                  Home
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="font-medium text-luxol-green">
                Meat Box
              </li>
            </ol>
          </nav>
        </div>
      </section>

      <div className={`${container} py-10 sm:py-14`}>
        <BuildClient />
      </div>
    </div>
  );
}
