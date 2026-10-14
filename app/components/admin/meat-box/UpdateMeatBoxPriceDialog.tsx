"use client";

import { useState } from "react";
import AdminIcon from "@/app/components/admin/layout/AdminIcon";
import { fieldInputClass } from "@/app/components/admin/inventory/fields";
import { formatNaira } from "@/app/utils/product";
import { notify } from "@/lib/notify";
import { getErrorMessage } from "@/redux/config/errors";
import { useUpdateAdminMeatBoxPriceMutation } from "@/redux/slices/adminMeatBoxApi";
import type { AdminMeatBoxOrderDetail, AdminMeatBoxOrderItem } from "@/redux/types";
import {
  decimalPlaces,
  formatMeatBoxCode,
  formatWeight,
  getItemHint,
  parseDecimal,
  roundMoney,
  sanitizeDecimal,
} from "./formatters";

/** Grams, and kobo. */
const MAX_WEIGHT_DECIMALS = 3;
const MAX_PRICE_DECIMALS = 2;

type LineDraft = {
  weight: string;
  price: string;
  /** Once staff type a price themselves we stop suggesting one from the weight. */
  priceEdited: boolean;
};

type LineErrors = { weight?: string; price?: string };

function toDraft(value: number | null): string {
  return value == null ? "" : String(value);
}

function validateLine(draft: LineDraft): LineErrors {
  const errors: LineErrors = {};
  const weight = parseDecimal(draft.weight);
  const price = parseDecimal(draft.price);

  if (!Number.isFinite(weight) || weight <= 0) errors.weight = "Enter the final weight";
  else if (decimalPlaces(draft.weight) > MAX_WEIGHT_DECIMALS) errors.weight = "Up to 3 decimal places";

  if (!Number.isFinite(price) || price <= 0) errors.price = "Enter the total price";
  else if (decimalPlaces(draft.price) > MAX_PRICE_DECIMALS) errors.price = "Up to 2 decimal places";

  return errors;
}

export type UpdateMeatBoxPriceDialogProps = {
  order: AdminMeatBoxOrderDetail;
  /**
   * Called when staff are finished, whether they saved or backed out. The
   * drawer uses it to come back, since only one dialog can be open at a time.
   */
  onDone: () => void;
};

/**
 * "Update Meat Box Price": staff enter the final weight and the price of every
 * line after the meat is weighed. Saving confirms the price, which is what lets
 * the customer place the order and pay.
 */
export function UpdateMeatBoxPriceDialog({ order, onDone }: UpdateMeatBoxPriceDialogProps) {
  const [updatePrice, { isLoading }] = useUpdateAdminMeatBoxPriceMutation();
  const [drafts, setDrafts] = useState<Record<string, LineDraft>>(() =>
    Object.fromEntries(
      order.items.map((item) => [
        item.id,
        { weight: toDraft(item.finalWeightKg), price: toDraft(item.lineTotal), priceEdited: item.lineTotal != null },
      ]),
    ),
  );
  const [submitted, setSubmitted] = useState(false);

  const alreadyConfirmed = order.priceConfirmedAt != null;
  const errors = Object.fromEntries(order.items.map((item) => [item.id, validateLine(drafts[item.id])]));
  const hasErrors = Object.values(errors).some((e) => e.weight || e.price);

  const totalWeight = order.items.reduce((sum, item) => {
    const weight = parseDecimal(drafts[item.id].weight);
    return Number.isFinite(weight) ? sum + weight : sum;
  }, 0);
  const totalPrice = order.items.reduce((sum, item) => {
    const price = parseDecimal(drafts[item.id].price);
    return Number.isFinite(price) ? sum + price : sum;
  }, 0);

  function setWeight(item: AdminMeatBoxOrderItem, raw: string) {
    const weight = sanitizeDecimal(raw);
    setDrafts((prev) => {
      const current = prev[item.id];
      const next: LineDraft = { ...current, weight };

      // Per-kilo meat has a fixed price, so suggest weight x price per kg.
      const parsed = parseDecimal(weight);
      if (item.unit === "KG" && item.pricePerKg != null && !current.priceEdited && Number.isFinite(parsed)) {
        next.price = String(roundMoney(parsed * item.pricePerKg));
      }
      return { ...prev, [item.id]: next };
    });
  }

  function setPrice(item: AdminMeatBoxOrderItem, raw: string) {
    setDrafts((prev) => ({
      ...prev,
      [item.id]: { ...prev[item.id], price: sanitizeDecimal(raw), priceEdited: true },
    }));
  }

  async function handleSubmit() {
    setSubmitted(true);
    if (hasErrors) return;

    try {
      await updatePrice({
        id: order.id,
        items: order.items.map((item) => ({
          itemId: item.id,
          finalWeightKg: parseDecimal(drafts[item.id].weight),
          lineTotal: parseDecimal(drafts[item.id].price),
        })),
      }).unwrap();
      notify.success(alreadyConfirmed ? "Price updated" : "Price confirmed", {
        message: alreadyConfirmed
          ? `${formatMeatBoxCode(order.code)} has a new weight and price.`
          : `${formatMeatBoxCode(order.code)} is ready for the customer to pay.`,
      });
      onDone();
    } catch (err) {
      notify.error("Couldn't save the price", { message: getErrorMessage(err) });
    }
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
      noValidate
      className="px-6 py-6 sm:px-8"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-neutral-900">Update Meat Box Price</h2>
          <p className="mt-1.5 text-sm text-neutral-400">
            Review the final weight and update the price of this Meat Box order before confirming the final amount.
          </p>
        </div>
        <button
          type="button"
          onClick={onDone}
          disabled={isLoading}
          aria-label="Close"
          className="flex size-7 shrink-0 items-center justify-center rounded-md border border-neutral-200 bg-white text-neutral-600 transition hover:bg-neutral-50 disabled:opacity-60"
        >
          <AdminIcon name="close" className="size-4" />
        </button>
      </div>

      <hr className="my-6 border-neutral-100" />

      <ul className="space-y-6">
        {order.items.map((item) => {
          const draft = drafts[item.id];
          const lineErrors = submitted ? errors[item.id] : {};
          return (
            <li
              key={item.id}
              className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_9.5rem_13rem] sm:items-start sm:gap-5"
            >
              <div className="min-w-0 sm:pt-1">
                <p className="text-base font-semibold text-neutral-900">{item.label}</p>
                <p className="mt-1 text-xs text-neutral-400">{getItemHint(item)}</p>
              </div>

              <div>
                <label htmlFor={`weight-${item.id}`} className="text-sm font-semibold text-neutral-900">
                  Final Weight <span className="font-normal text-neutral-400">(kg)</span>
                </label>
                <input
                  id={`weight-${item.id}`}
                  value={draft.weight}
                  onChange={(e) => setWeight(item, e.target.value)}
                  disabled={isLoading}
                  inputMode="decimal"
                  autoComplete="off"
                  placeholder="e.g. 45kg"
                  aria-invalid={!!lineErrors.weight}
                  className={`${fieldInputClass} mt-2`}
                />
                {lineErrors.weight && (
                  <p role="alert" className="mt-1.5 text-xs text-red-600">
                    {lineErrors.weight}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor={`price-${item.id}`} className="text-sm font-semibold text-neutral-900">
                  Total price <span className="font-normal text-neutral-400">(₦)</span>
                </label>
                <input
                  id={`price-${item.id}`}
                  value={draft.price}
                  onChange={(e) => setPrice(item, e.target.value)}
                  disabled={isLoading}
                  inputMode="decimal"
                  autoComplete="off"
                  placeholder="e.g. ₦20,000"
                  aria-invalid={!!lineErrors.price}
                  className={`${fieldInputClass} mt-2`}
                />
                {lineErrors.price && (
                  <p role="alert" className="mt-1.5 text-xs text-red-600">
                    {lineErrors.price}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      <hr className="my-6 border-neutral-100" />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <dl className="flex items-center gap-8 text-sm">
          <div>
            <dt className="text-neutral-400">Total weight</dt>
            <dd className="mt-1 font-semibold text-neutral-900">{formatWeight(totalWeight)}</dd>
          </div>
          <div>
            <dt className="text-neutral-400">Order total</dt>
            <dd className="mt-1 font-semibold text-neutral-900">{formatNaira(roundMoney(totalPrice))}</dd>
          </div>
        </dl>

        <div className="flex w-full items-center gap-3 sm:w-auto">
          <button
            type="button"
            onClick={onDone}
            disabled={isLoading}
            className="h-11 flex-1 rounded-xl border border-neutral-300 px-6 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50 disabled:opacity-60 sm:flex-none"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="h-11 flex-1 rounded-xl bg-luxol-green px-6 text-sm font-medium text-white transition hover:brightness-110 disabled:cursor-wait disabled:opacity-70 sm:flex-none"
          >
            {isLoading ? "Saving..." : alreadyConfirmed ? "Update Price" : "Confirm Price"}
          </button>
        </div>
      </div>
    </form>
  );
}
