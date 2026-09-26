"use client";

import { useState } from "react";
import { isRatable, type Order, type TrackStep } from "@/app/data/orders-data";
import RatingStars from "./RatingStars";

const DOT_STYLES = {
  done: "border-neutral-900 bg-neutral-900",
  active: "border-luxol-orange bg-luxol-orange",
  pending: "border-neutral-300 bg-white",
} as const;

const TITLE_STYLES = {
  done: "text-neutral-900",
  active: "text-luxol-orange",
  pending: "text-neutral-400",
} as const;

const DESC_STYLES = {
  done: "text-neutral-500",
  active: "text-luxol-orange/80",
  pending: "text-neutral-400",
} as const;

function RatingBlock({
  order,
  onSubmitRating,
}: {
  order: Order;
  onSubmitRating: (stars: number, comment: string) => void;
}) {
  const [stars, setStars] = useState(0);
  const [comment, setComment] = useState("");

  if (order.rating) {
    return (
      <div className="mt-2.5">
        <RatingStars value={order.rating.stars} readOnly />
        {order.rating.comment && (
          <p className="mt-2 max-w-sm rounded-lg bg-neutral-100 px-3 py-2 text-xs leading-relaxed text-neutral-600">
            {order.rating.comment}
          </p>
        )}
      </div>
    );
  }

  if (!isRatable(order)) {
    return (
      <div className="mt-2.5">
        <RatingStars value={0} readOnly size="size-5 opacity-40" />
      </div>
    );
  }

  return (
    <div className="mt-2.5 flex flex-col gap-2.5">
      <RatingStars value={stars} onChange={setStars} />
      {stars > 0 && (
        <div className="flex max-w-sm flex-col gap-2">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Tell us about your experience (optional)"
            rows={2}
            className="w-full resize-none rounded-lg border border-neutral-200 px-3 py-2 text-xs text-neutral-700 placeholder:text-neutral-400 focus:border-luxol-orange focus:outline-none focus:ring-2 focus:ring-luxol-orange/30"
          />
          <button
            type="button"
            onClick={() => onSubmitRating(stars, comment.trim())}
            className="self-start rounded-lg bg-luxol-orange px-4 py-1.5 text-xs font-semibold text-black transition hover:brightness-95"
          >
            Submit review
          </button>
        </div>
      )}
    </div>
  );
}

function Step({
  step,
  isLast,
  order,
  onSubmitRating,
}: {
  step: TrackStep;
  isLast: boolean;
  order: Order;
  onSubmitRating: (stars: number, comment: string) => void;
}) {
  return (
    <li className="flex gap-4">
      {/* Date column */}
      <div className="w-10 shrink-0 pt-0.5 text-right text-[11px] font-medium leading-tight text-neutral-400">
        <span className="block">{step.month ?? "-"}</span>
        <span className="block">{step.day ?? "-"}</span>
      </div>

      {/* Dot + connecting line */}
      <div className="flex w-3 shrink-0 flex-col items-center">
        <span
          aria-hidden="true"
          className={`mt-1.5 size-3 shrink-0 rounded-full border-2 ${DOT_STYLES[step.state]}`}
        />
        {!isLast && <span aria-hidden="true" className="mt-1 w-px flex-1 bg-neutral-200" />}
      </div>

      {/* Content */}
      <div className={`min-w-0 flex-1 ${isLast ? "pb-1" : "pb-7"}`}>
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5">
          <p className={`text-sm font-semibold ${TITLE_STYLES[step.state]}`}>{step.title}</p>
          {step.time && (
            <span className={`text-xs font-medium ${TITLE_STYLES[step.state]}`}>{step.time}</span>
          )}
        </div>
        <p className={`mt-0.5 text-xs ${DESC_STYLES[step.state]}`}>{step.description}</p>

        {step.id === "rate" && <RatingBlock order={order} onSubmitRating={onSubmitRating} />}
      </div>
    </li>
  );
}

export default function TrackTimeline({
  order,
  onSubmitRating,
}: {
  order: Order;
  onSubmitRating: (stars: number, comment: string) => void;
}) {
  return (
    <section aria-labelledby="track-details-heading">
      <h2 id="track-details-heading" className="text-base font-semibold text-neutral-900">
        Track Details
      </h2>
      <ol className="mt-5">
        {order.track.map((step, i) => (
          <Step
            key={step.id}
            step={step}
            isLast={i === order.track.length - 1}
            order={order}
            onSubmitRating={onSubmitRating}
          />
        ))}
      </ol>
    </section>
  );
}
