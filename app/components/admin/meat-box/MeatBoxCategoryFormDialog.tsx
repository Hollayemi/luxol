"use client";

import { useState } from "react";
import { ModalButton, ModalHeader } from "@/app/components/admin/inventory/ModalHeader";
import { SelectField, TextField } from "@/app/components/admin/inventory/fields";
import { notify } from "@/lib/notify";
import { getErrorMessage } from "@/redux/config/errors";
import {
  useCreateAdminMeatBoxCategoryMutation,
  useUpdateAdminMeatBoxCategoryMutation,
} from "@/redux/slices/adminMeatBoxApi";
import type { AdminMeatBoxActiveStatus, AdminMeatBoxCategory } from "@/redux/types";
import { decimalPlaces, parseDecimal, sanitizeDecimal } from "./formatters";
import { SingleImageField } from "./SingleImageField";

const STATUS_OPTIONS = [
  { label: "Active", value: "ACTIVE" },
  { label: "Inactive", value: "INACTIVE" },
];

/** Kobo (Decimal(12,2)). */
const MAX_PRICE_DECIMALS = 2;

function checkPricePerKg(raw: string): string | undefined {
  const n = parseDecimal(raw);
  if (!Number.isFinite(n) || n <= 0) return "Enter the price per kg";
  if (decimalPlaces(raw) > MAX_PRICE_DECIMALS) return `Up to ${MAX_PRICE_DECIMALS} decimal places`;
  return undefined;
}

export type MeatBoxCategoryFormDialogProps = {
  /** Omit to create a new category. */
  category?: AdminMeatBoxCategory;
  close: () => void;
};

/**
 * Create / edit a Meat Box category ("Cow Beef", "Goat" ...). The category owns
 * the price per kg: every meat box inside it costs that price x its weight.
 */
export function MeatBoxCategoryFormDialog({ category, close }: MeatBoxCategoryFormDialogProps) {
  const [createCategory, { isLoading: creating }] = useCreateAdminMeatBoxCategoryMutation();
  const [updateCategory, { isLoading: updating }] = useUpdateAdminMeatBoxCategoryMutation();
  const loading = creating || updating;

  const [label, setLabel] = useState(category?.label ?? "");
  const [pricePerKg, setPricePerKg] = useState(category ? String(category.pricePerKg) : "");
  const [image, setImage] = useState<File | null>(null);
  const [status, setStatus] = useState<AdminMeatBoxActiveStatus>(category?.status ?? "ACTIVE");
  const [displayOrder, setDisplayOrder] = useState(category ? String(category.displayOrder) : "");
  const [imageError, setImageError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const order = displayOrder.trim() === "" ? 0 : Number(displayOrder);
  const orderValid = Number.isInteger(order) && order >= 0;
  const labelValid = label.trim().length >= 2;
  const priceError = checkPricePerKg(pricePerKg);
  const valid = labelValid && orderValid && !priceError;

  // Only reveal a field's problem once they've tried to save (the price starts empty).
  const showPriceError = submitted ? priceError : undefined;

  async function handleSave() {
    if (loading) return;
    setSubmitted(true);
    setError("");
    if (!valid) return;

    const body = {
      label: label.trim(),
      pricePerKg: parseDecimal(pricePerKg),
      status,
      displayOrder: order,
      ...(image ? { image } : {}),
    };

    try {
      if (category) {
        await updateCategory({ id: category.id, ...body }).unwrap();
        notify.success("Category updated", {
          message:
            body.pricePerKg !== category.pricePerKg
              ? `"${body.label}" was saved and its meat boxes were re-priced.`
              : `"${body.label}" was saved.`,
        });
      } else {
        await createCategory(body).unwrap();
        notify.success("Category created", { message: `"${body.label}" was added to the Meat Box page.` });
      }
      close();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <>
      <ModalHeader
        title="Meat Box Categories"
        onClose={close}
        actions={
          <ModalButton onClick={handleSave} loading={loading}>
            {loading ? "Saving..." : "Save"}
          </ModalButton>
        }
      />

      <div className="max-h-[calc(90dvh-73px)] overflow-y-auto px-6 py-6 sm:px-8">
        <div className="mb-6">
          <h3 className="text-base font-semibold text-neutral-900">
            {category ? "Edit Category" : "Add New Category"}
          </h3>
          <p className="mt-1 text-sm text-neutral-500">
            {category
              ? "Update this category's details. Changing the price per kg re-prices every meat box in it."
              : "A category groups related meat boxes on the Meat Box page, like Cow Beef or Goat, and sets their price per kg."}
          </p>
        </div>

        <div className="space-y-5">
          <TextField
            label="Category Name"
            value={label}
            onChange={setLabel}
            placeholder="e.g. Cow Beef"
            required
          />

          <div>
            <TextField
              label="Price per kg (₦)"
              hint="Every meat box in this category costs this price x its weight."
              value={pricePerKg}
              onChange={(v) => setPricePerKg(sanitizeDecimal(v))}
              placeholder="e.g. 8000"
              required
            />
            {showPriceError && (
              <p role="alert" className="mt-1.5 text-xs text-red-600">
                {showPriceError}
              </p>
            )}
          </div>

          <SingleImageField
            value={image}
            onChange={setImage}
            current={category?.image}
            error={imageError}
            onError={setImageError}
          />
          <SelectField
            label="Category Status"
            hint="Inactive categories are hidden from customers."
            value={status}
            onChange={(v) => setStatus(v as AdminMeatBoxActiveStatus)}
            options={STATUS_OPTIONS}
          />
          <div>
            <TextField
              label="Display Order"
              hint="Determines where this category appears on the Meat Box page."
              type="number"
              min={0}
              value={displayOrder}
              onChange={setDisplayOrder}
              placeholder="e.g. 1"
            />
            {!orderValid && (
              <p role="alert" className="mt-1.5 text-xs text-red-600">
                Use a whole number, 0 or more.
              </p>
            )}
          </div>

          {error && (
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          )}
        </div>
      </div>
    </>
  );
}
