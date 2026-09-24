"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { EASE } from "../ui/motion";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};

export default function Hero() {
  const reduce = useReducedMotion();
  const v = reduce ? { hidden: { opacity: 1 }, show: { opacity: 1 } } : item;

  return (
    <section
      aria-labelledby="hero-heading"
      className="relative isolate overflow-hidden bg-[#f5f8ef]"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, ease: EASE }}
        className="absolute inset-0 -z-10"
      >
        <Image
          src="/images/hero.webp"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-right"
        />
      </motion.div>

      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-linear-to-r from-[#f5f8ef]/95 via-[#f5f8ef]/70 to-transparent lg:hidden"
      />

      <div className="mx-auto flex min-h-[440px] w-full max-w-[1240px] items-center px-4 py-14 sm:min-h-[480px] sm:px-6 lg:min-h-[520px]">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="max-w-[500px]"
        >
          <motion.p
            variants={v}
            className="text-xs font-medium uppercase tracking-wide text-luxol-green sm:text-sm"
          >
            Freshness you can trust
          </motion.p>

          <motion.h1
            variants={v}
            id="hero-heading"
            className="mt-4 text-4xl font-bold leading-[1.1] tracking-tight text-neutral-900 sm:text-5xl lg:text-[56px]"
          >
            <span className="block text-luxol-orange">Quality food,</span>
            delivered to your door.
          </motion.h1>

          <motion.p
            variants={v}
            className="mt-5 max-w-[420px] text-sm leading-relaxed text-neutral-700 sm:text-base"
          >
            Fresh meat, everyday groceries, and carefully selected essentials
            all in one place, delivered fresh and ready for your home.
          </motion.p>

          <motion.div variants={v} className="mt-8 flex flex-wrap gap-3">
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
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}