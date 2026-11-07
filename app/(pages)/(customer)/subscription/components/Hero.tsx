"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { fadeUp, stagger, viewportOnce } from "@/app/components/ui/motion";

export default function Hero() {
  return (
    <section className="bg-[#f8f1e6] py-16 sm:py-20 lg:py-24">
      <motion.div
        variants={stagger(0.12)}
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        className="mx-auto w-full max-w-[720px] px-4 text-center sm:px-6"
      >
        <motion.h1
          variants={fadeUp}
          className="text-3xl font-bold leading-tight text-neutral-800 sm:text-4xl lg:text-[44px]"
        >
          Your regular
          <br />
          <span className="text-luxol-orange">protein supply</span>, handled.
        </motion.h1>
        <motion.p
          variants={fadeUp}
          className="mx-auto mt-6 max-w-[480px] text-sm leading-relaxed text-neutral-500 sm:text-[15px]"
        >
          Get quality meat and protein delivered to your door every week, based on a
          plan that fits your household or business.
        </motion.p>

        <motion.div
          variants={fadeUp}
          className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <Link
            href="/subscription/membership"
            className="inline-flex w-full items-center justify-center rounded-full bg-luxol-orange px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-luxol-orange/90 sm:w-auto"
          >
            Manage Subscription
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}