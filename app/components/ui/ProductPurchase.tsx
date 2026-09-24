"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  FacebookIcon,
  LinkedInIcon,
  MailIcon,
  WhatsAppIcon,
} from "./icons";
import { Product } from "@/app/utils/product";

const MAX_QTY = 99;

type ShareKind = "whatsapp" | "facebook" | "linkedin" | "mail" | "copy";

function LinkIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

const SHARE_BUTTONS: { kind: ShareKind; label: string; icon: ReactNode }[] = [
  { kind: "whatsapp", label: "Share on WhatsApp", icon: <WhatsAppIcon className="size-5" /> },
  { kind: "facebook", label: "Share on Facebook", icon: <FacebookIcon className="size-5" /> },
  { kind: "linkedin", label: "Share on LinkedIn", icon: <LinkedInIcon className="size-5" /> },
  { kind: "mail", label: "Share by email", icon: <MailIcon className="size-5" /> },
  { kind: "copy", label: "Copy link", icon: <LinkIcon className="size-5" /> },
];

export default function ProductPurchase({
  product,
  variants,
}: {
  product: Product;
  variants?: string[];
}) {
  const [variant, setVariant] = useState<string | undefined>(variants?.[0]);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [saved, setSaved] = useState(false);
  const [notice, setNotice] = useState("");

  const addedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const noticeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (addedTimer.current) clearTimeout(addedTimer.current);
      if (noticeTimer.current) clearTimeout(noticeTimer.current);
    };
  }, []);

  function flash(message: string) {
    setNotice(message);
    if (noticeTimer.current) clearTimeout(noticeTimer.current);
    noticeTimer.current = setTimeout(() => setNotice(""), 2500);
  }

  function handleAdd() {
    // Your cart can listen for this: window.addEventListener("cart:add", ...)
    window.dispatchEvent(
      new CustomEvent("cart:add", { detail: { ...product, quantity, variant } }),
    );

    setAdded(true);
    if (addedTimer.current) clearTimeout(addedTimer.current);
    addedTimer.current = setTimeout(() => setAdded(false), 1500);
  }

  function handleSave() {
    const next = !saved;
    setSaved(next);
    // Your wishlist can listen for this: window.addEventListener("wishlist:toggle", ...)
    window.dispatchEvent(
      new CustomEvent("wishlist:toggle", { detail: { product, saved: next } }),
    );
    flash(next ? "Saved for later" : "Removed from saved items");
  }

  async function handleShare(kind: ShareKind) {
    const url = window.location.href;

    if (kind === "copy") {
      try {
        await navigator.clipboard.writeText(url);
        flash("Link copied");
      } catch {
        flash("Couldn't copy the link");
      }
      return;
    }

    if (kind === "mail") {
      window.location.href = `mailto:?subject=${encodeURIComponent(
        product.name,
      )}&body=${encodeURIComponent(url)}`;
      return;
    }

    const targets = {
      whatsapp: `https://wa.me/?text=${encodeURIComponent(`${product.name} ${url}`)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    };
    window.open(targets[kind], "_blank", "noopener,noreferrer");
  }

  return (
    <div className="space-y-8">
      {variants && variants.length > 0 && (
        <div>
          <h2 className="text-base font-semibold text-neutral-800">Variants</h2>
          <div
            role="radiogroup"
            aria-label="Variants"
            className="mt-4 flex flex-wrap gap-3"
          >
            {variants.map((v) => {
              const selected = v === variant;
              return (
                <button
                  key={v}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setVariant(v)}
                  className={`h-12 rounded-full border px-6 text-sm transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-luxol-green ${
                    selected
                      ? "border-luxol-green bg-luxol-green font-medium text-white"
                      : "border-neutral-200 bg-white text-neutral-700 hover:border-luxol-green"
                  }`}
                >
                  {v}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-base font-semibold text-neutral-800">Quantity</h2>

        <div className="mt-4 flex flex-wrap items-center gap-4">
          <div className="inline-flex h-14 items-center gap-2 rounded-full border border-neutral-200 px-2">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1}
              aria-label="Decrease quantity"
              className="flex size-10 items-center justify-center rounded-full bg-neutral-100 text-lg leading-none text-neutral-800 transition hover:bg-neutral-200 disabled:opacity-40"
            >
              −
            </button>
            <output
              aria-live="polite"
              aria-label="Quantity"
              className="w-10 text-center text-sm text-neutral-900"
            >
              {quantity}
            </output>
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.min(MAX_QTY, q + 1))}
              disabled={quantity >= MAX_QTY}
              aria-label="Increase quantity"
              className="flex size-10 items-center justify-center rounded-full bg-neutral-100 text-lg leading-none text-neutral-800 transition hover:bg-neutral-200 disabled:opacity-40"
            >
              +
            </button>
          </div>

          <button
            type="button"
            onClick={handleAdd}
            className="h-14 rounded-lg bg-luxol-green px-9 text-sm font-medium text-white transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-luxol-green"
          >
            {added ? "Added to Cart" : "Add to Cart"}
          </button>

          <button
            type="button"
            onClick={handleSave}
            aria-pressed={saved}
            className="h-14 rounded-lg bg-luxol-orange px-9 text-sm font-medium text-black transition hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-luxol-orange"
          >
            {saved ? "Saved" : "Save For Later"}
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 border-t border-neutral-200 pt-8">
        <span className="text-base font-semibold text-neutral-900">Share:</span>
        <ul className="flex items-center gap-3 text-neutral-700">
          {SHARE_BUTTONS.map((s) => (
            <li key={s.kind}>
              <button
                type="button"
                onClick={() => handleShare(s.kind)}
                aria-label={s.label}
                className="rounded p-1 transition hover:text-luxol-green focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-luxol-green"
              >
                {s.icon}
              </button>
            </li>
          ))}
        </ul>
        <p role="status" className="min-h-5 text-sm text-luxol-green">
          {notice}
        </p>
      </div>
    </div>
  );
}
