"use client";

import { CheckCircleIcon } from "@/app/components/ui/icons";
import type { Allocation, ProteinOption } from "@/app/data/subscription-checkout-data";

export default function ProteinCard({
  protein,
  allocation,
  onToggle,
  onAdjust,
  canDecrease,
  canIncrease,
}: {
  protein: ProteinOption;
  allocation: Allocation;
  onToggle: () => void;
  onAdjust: (delta: number) => void;
  canDecrease: boolean;
  canIncrease: boolean;
}) {
  const Icon = protein.icon;
  const selected = protein.id in allocation;
  const percent = allocation[protein.id];

  return (
    <div
      className={`relative flex flex-col overflow-hidden rounded-2xl border transition ${
        selected ? "border-luxol-green" : "border-neutral-200"
      }`}
    >
      {selected && (
        <span className="absolute left-3 top-3 z-10 flex size-6 items-center justify-center rounded-full bg-luxol-green text-white">
          <CheckCircleIcon className="size-4" />
        </span>
      )}

      <div className={`flex h-28 items-center justify-center ${protein.tint}`}>
        <Icon className="size-12" />
      </div>

      <div className="flex flex-col gap-3 p-4">
        <p className="text-sm font-bold text-neutral-900">{protein.name}</p>

        {selected ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onToggle}
              className="h-9 flex-1 rounded-lg border border-neutral-300 px-2 text-xs font-semibold text-neutral-700 transition hover:border-luxol-green hover:text-luxol-green"
            >
              Unselect
            </button>
            <div className="flex h-9 shrink-0 items-center gap-1 rounded-full border border-neutral-200 px-1">
              <button
                type="button"
                onClick={() => onAdjust(-1)}
                disabled={!canDecrease}
                aria-label={`Decrease ${protein.name} share`}
                className="flex size-7 items-center justify-center rounded-full text-sm leading-none text-neutral-700 transition hover:bg-neutral-100 disabled:opacity-30"
              >
                −
              </button>
              <span className="min-w-9 text-center text-xs font-semibold text-neutral-900">
                {percent}%
              </span>
              <button
                type="button"
                onClick={() => onAdjust(1)}
                disabled={!canIncrease}
                aria-label={`Increase ${protein.name} share`}
                className="flex size-7 items-center justify-center rounded-full text-sm leading-none text-neutral-700 transition hover:bg-neutral-100 disabled:opacity-30"
              >
                +
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={onToggle}
            className="h-9 w-full rounded-lg bg-luxol-green text-xs font-semibold text-white transition hover:brightness-110"
          >
            Select
          </button>
        )}
      </div>
    </div>
  );
}
