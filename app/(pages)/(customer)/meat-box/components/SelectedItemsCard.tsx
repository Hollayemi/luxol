"use client";

import { CloseIcon } from "@/app/components/ui/icons";
import {
  MIN_QUANTITY,
  boxTotal,
  boxWeightKg,
  formatKg,
  formatQuantity,
  lineTotal,
  maxQuantityFor,
  type SelectedItem,
} from "@/app/utils/meat-box";
import { formatNaira } from "@/app/utils/product";

const stepBtn =
  "flex size-7 items-center justify-center rounded-full text-sm font-semibold text-neutral-700 transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:text-neutral-300 disabled:hover:bg-transparent";

function Stepper({
  item,
  onChange,
}: {
  item: SelectedItem;
  onChange: (quantity: number) => void;
}) {
  const { option, quantity } = item;
  const max = maxQuantityFor(option);
  return (
    <div
      role="group"
      aria-label={`Quantity of ${option.label}`}
      className="flex items-center rounded-full border border-neutral-200 bg-white px-1 py-0.5"
    >
      <button
        type="button"
        onClick={() => onChange(quantity - 1)}
        disabled={quantity <= MIN_QUANTITY}
        aria-label={`Decrease ${option.label}`}
        className={stepBtn}
      >
        −
      </button>
      <span className="min-w-6 text-center text-xs font-semibold text-neutral-900" aria-live="polite">
        {quantity}
      </span>
      <button
        type="button"
        onClick={() => onChange(quantity + 1)}
        disabled={quantity >= max}
        aria-label={`Increase ${option.label}`}
        className={stepBtn}
      >
        +
      </button>
    </div>
  );
}

export default function SelectedItemsCard({
  items,
  editable,
  onQuantityChange,
  onRemove,
  actionLabel,
  actionDisabled,
  actionLoading,
  onAction,
}: {
  items: SelectedItem[];
  /** Steps 1 and 2 let the customer adjust the box from here; the review is read-only. */
  editable: boolean;
  onQuantityChange?: (optionId: string, quantity: number) => void;
  onRemove?: (optionId: string) => void;
  actionLabel: string;
  actionDisabled?: boolean;
  actionLoading?: boolean;
  onAction: () => void;
}) {
  return (
    <aside className="rounded-3xl bg-neutral-50 p-6 lg:sticky lg:top-24">
      <h2 className="text-base font-semibold text-neutral-900">Selected Items</h2>

      {items.length === 0 ? (
        <p className="mt-5 text-sm text-neutral-500">
          Nothing selected yet. Pick the meats you want from the options.
        </p>
      ) : (
        <ul className="mt-5 flex flex-col gap-4">
          {items.map((item) => (
            <li key={item.option.id} className="flex items-center gap-3">
              {editable && (
                <button
                  type="button"
                  onClick={() => onRemove?.(item.option.id)}
                  aria-label={`Remove ${item.option.label}`}
                  className="shrink-0 text-neutral-400 transition hover:text-neutral-700"
                >
                  <CloseIcon className="size-3.5" />
                </button>
              )}

              <div className="min-w-0 flex-1">
                <p className="truncate text-xs text-neutral-600">
                  {item.option.label}
                  <span className="ml-1.5 text-neutral-400">
                    {formatKg(item.option.weightKg * item.quantity)}
                  </span>
                </p>
                <p className="text-sm font-semibold text-neutral-900">
                  {formatNaira(lineTotal(item))}
                  {!editable && (
                    <span className="ml-1.5 text-xs font-normal text-neutral-500">
                      {formatQuantity(item.quantity)}
                    </span>
                  )}
                </p>
              </div>

              {editable && (
                <Stepper
                  item={item}
                  onChange={(q) => onQuantityChange?.(item.option.id, q)}
                />
              )}
            </li>
          ))}
        </ul>
      )}

      <hr className="my-5 border-neutral-200" />

      <div className="flex items-center justify-between text-sm">
        <span className="text-neutral-600">Total Weight</span>
        <span className="font-semibold text-neutral-900">{formatKg(boxWeightKg(items))}</span>
      </div>
      <div className="mt-2.5 flex items-center justify-between text-sm">
        <span className="text-neutral-600">Total Cost</span>
        <span className="text-base font-bold text-neutral-900">{formatNaira(boxTotal(items))}</span>
      </div>

      <p className="mt-4 text-sm font-semibold text-luxol-green">Fixed price, no surprises</p>
      <p className="mt-1.5 text-[11px] leading-relaxed text-neutral-500">
        Each meat box is priced by its weight and the price per kg shown above, so what you see is
        what you pay. You&apos;ll pay securely online when you place your order.
      </p>

      <button
        type="button"
        onClick={onAction}
        disabled={actionDisabled || actionLoading}
        className="mt-5 inline-flex h-12 w-full items-center justify-center rounded-xl bg-luxol-orange px-6 text-sm font-semibold text-black transition hover:brightness-95 disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-400"
      >
        {actionLoading ? "Processing…" : actionLabel}
      </button>
    </aside>
  );
}
