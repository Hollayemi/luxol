"use client";

import type { MeatBoxCategory } from "@/redux/types";
import OptionCard from "./OptionCard";

export default function SelectStep({
  categories,
  selectedIds,
  onToggle,
}: {
  categories: MeatBoxCategory[];
  selectedIds: Set<string>;
  onToggle: (optionId: string) => void;
}) {
  const visible = categories.filter((c) => c.options.length > 0);

  if (visible.length === 0) {
    return (
      <p className="rounded-2xl bg-neutral-50 p-5 text-sm text-neutral-500">
        No meat is available to order right now. Please check back shortly.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-10">
      {visible.map((category) => (
        <section key={category.id} aria-labelledby={`meat-cat-${category.id}`}>
          <h2
            id={`meat-cat-${category.id}`}
            className="text-base font-semibold text-luxol-green"
          >
            {category.label} Options
          </h2>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {category.options.map((option) => (
              <OptionCard
                key={option.id}
                option={option}
                selected={selectedIds.has(option.id)}
                onToggle={() => onToggle(option.id)}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
