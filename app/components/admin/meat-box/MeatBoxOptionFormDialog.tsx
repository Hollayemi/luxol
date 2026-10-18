"use client";

import { useState } from "react";
import { ModalButton, ModalHeader } from "@/app/components/admin/inventory/ModalHeader";
import { SelectField, TextField } from "@/app/components/admin/inventory/fields";
import { formatNaira } from "@/app/utils/product";
import { notify } from "@/lib/notify";
import { getErrorMessage } from "@/redux/config/errors";
import {
  useCreateAdminMeatBoxOptionMutation,
  useUpdateAdminMeatBoxOptionMutation,
} from "@/redux/slices/adminMeatBoxApi";
import type {
  AdminMeatBoxActiveStatus,
  AdminMeatBoxCategory,
  AdminMeatBoxOption,
  CreateAdminMeatBoxOptionRequest,
} from "@/redux/types";
import {
  computeBoxPrice,
  decimalPlaces,
  formatPerKg,
  formatWeight,
  parseDecimal,
  sanitizeDecimal,
} from "./formatters";
import { SingleImageField } from "./SingleImageField";

const STATUS_OPTIONS = [
  { label: "Active", value: "ACTIVE" },
  { label: "Inactive", value: "INACTIVE" },
];

/** Grams (Decimal(10,3)). */
const MAX_WEIGHT_DECIMALS = 3;

type ErrorKey = "label" | "categoryId" | "weight" | "maxQuantity" | "displayOrder";
type Errors = Partial<Record<ErrorKey, string>>;

function toText(value: number | null | undefined) {
  return value == null ? "" : String(value);
}

/** "" -> null, otherwise the number (callers have validated it already). */
function toNumber(raw: string) {
  return raw.trim() === "" ? null : Number(raw);
}

function checkWeight(raw: string): string | undefined {
  const n = parseDecimal(raw);
  if (!Number.isFinite(n) || n <= 0) return "Enter the weight of this meat box";
  if (decimalPlaces(raw) > MAX_WEIGHT_DECIMALS) return `Up to ${MAX_WEIGHT_DECIMALS} decimal places`;
  return undefined;
}

export type MeatBoxOptionFormDialogProps = {
  /** Omit to create a new meat box. */
  option?: AdminMeatBoxOption;
  /** Every category, for the category select. */
  categories: AdminMeatBoxCategory[];
  /** Pre-selects a category when "Add option" was clicked inside one. */
  defaultCategoryId?: string;
  close: () => void;
};

/**
 * Create / edit a Meat Box option ("Full Goat", "Half Cow", "Quarter Cow" ...).
 * Staff only enter the weight: the price is the category's price per kg x that
 * weight, shown here as a live preview and worked out for real by the backend.
 */
export function MeatBoxOptionFormDialog({ option, categories, defaultCategoryId, close }: MeatBoxOptionFormDialogProps) {
  const [createOption, { isLoading: creating }] = useCreateAdminMeatBoxOptionMutation();
  const [updateOption, { isLoading: updating }] = useUpdateAdminMeatBoxOptionMutation();
  const loading = creating || updating;

  const [label, setLabel] = useState(option?.label ?? "");
  const [categoryId, setCategoryId] = useState(option?.categoryId ?? defaultCategoryId ?? categories[0]?.id ?? "");
  const [weight, setWeight] = useState(toText(option?.weightKg));
  const [maxQuantity, setMaxQuantity] = useState(toText(option?.maxQuantity));
  const [status, setStatus] = useState<AdminMeatBoxActiveStatus>(option?.status ?? "ACTIVE");
  const [displayOrder, setDisplayOrder] = useState(option ? String(option.displayOrder) : "");
  const [image, setImage] = useState<File | null>(null);
  const [imageError, setImageError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const category = categories.find((c) => c.id === categoryId);
  const weightNumber = parseDecimal(weight);
  const previewPrice =
    category && Number.isFinite(weightNumber) && weightNumber > 0
      ? computeBoxPrice(category.pricePerKg, weightNumber)
      : null;

  const errors: Errors = {};
  if (label.trim().length < 2) errors.label = "Enter a name of at least 2 characters";
  if (!categoryId) errors.categoryId = "Choose a category";
  errors.weight = checkWeight(weight);
  if (maxQuantity.trim() !== "") {
    const n = Number(maxQuantity);
    if (!Number.isInteger(n) || n < 1) errors.maxQuantity = "Use a whole number, 1 or more";
  }
  if (displayOrder.trim() !== "") {
    const n = Number(displayOrder);
    if (!Number.isInteger(n) || n < 0) errors.displayOrder = "Use a whole number, 0 or more";
  }
  const hasErrors = Object.values(errors).some(Boolean);
  const shown: Errors = submitted ? errors : {};

  async function handleSave() {
    if (loading) return;
    setSubmitted(true);
    setError("");
    if (hasErrors) return;

    const body = {
      categoryId,
      label: label.trim(),
      weightKg: parseDecimal(weight),
      maxQuantity: toNumber(maxQuantity),
      status,
      displayOrder: toNumber(displayOrder) ?? 0,
      ...(image ? { image } : {}),
    };

    try {
      if (option) {
        await updateOption({ id: option.id, ...body }).unwrap();
        notify.success("Meat box updated", { message: `"${body.label}" was saved.` });
      } else {
        // Nothing to clear on a new option, so don't send an empty max quantity.
        const createBody = Object.fromEntries(
          Object.entries(body).filter(([, value]) => value !== null),
        ) as CreateAdminMeatBoxOptionRequest;
        await createOption(createBody).unwrap();
        notify.success("Meat box created", { message: `"${body.label}" was added to the Meat Box page.` });
      }
      close();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  const categoryOptions = categories.map((c) => ({
    label: `${c.label} (${formatPerKg(c.pricePerKg)})${c.status === "INACTIVE" ? " (inactive)" : ""}`,
    value: c.id,
  }));

  return (
    <>
      <ModalHeader
        title="Meat Box"
        onClose={close}
        actions={
          <ModalButton onClick={handleSave} loading={loading}>
            {loading ? "Saving..." : "Save"}
          </ModalButton>
        }
      />

      <div className="max-h-[calc(90dvh-73px)] overflow-y-auto px-6 py-6 sm:px-8">
        <div className="mb-6">
          <h3 className="text-base font-semibold text-neutral-900">{option ? "Edit Meat Box" : "Add New Meat Box"}</h3>
          <p className="mt-1 text-sm text-neutral-500">
            {option
              ? "Update what customers can order. The price follows the weight and the category's price per kg."
              : "Add something customers can pick on the Meat Box page, like a Full Goat, a Half Cow or a Quarter Cow."}
          </p>
        </div>

        <div className="space-y-5">
          <div>
            <TextField
              label="Meat Box Name"
              value={label}
              onChange={setLabel}
              placeholder="e.g. Full Goat"
              required
            />
            <FieldError message={shown.label} />
          </div>

          <div>
            <SelectField
              label="Category"
              hint="The category's price per kg decides what this meat box costs."
              value={categoryId}
              onChange={setCategoryId}
              options={categoryOptions}
              placeholder="Select a category"
            />
            <FieldError message={shown.categoryId} />
          </div>

          <div>
            <TextField
              label="Weight (kg)"
              hint="The weight of one meat box, e.g. 120 for a full goat."
              value={weight}
              onChange={(v) => setWeight(sanitizeDecimal(v))}
              placeholder="e.g. 120"
              required
            />
            <FieldError message={shown.weight} />
          </div>

          <PricePreview
            price={previewPrice}
            weightKg={previewPrice != null ? weightNumber : null}
            pricePerKg={category?.pricePerKg ?? null}
          />

          <div>
            <TextField
              label="Max quantity per order"
              hint="The most of this meat box a customer can order at once. Leave blank for the default."
              type="number"
              min={1}
              value={maxQuantity}
              onChange={setMaxQuantity}
              placeholder="e.g. 5"
            />
            <FieldError message={shown.maxQuantity} />
          </div>

          <SingleImageField
            value={image}
            onChange={setImage}
            current={option?.image}
            error={imageError}
            onError={setImageError}
          />

          <SelectField
            label="Status"
            hint="Inactive meat boxes are hidden from customers."
            value={status}
            onChange={(v) => setStatus(v as AdminMeatBoxActiveStatus)}
            options={STATUS_OPTIONS}
          />

          <div>
            <TextField
              label="Display Order"
              hint="Determines where this appears inside its category."
              type="number"
              min={0}
              value={displayOrder}
              onChange={setDisplayOrder}
              placeholder="e.g. 1"
            />
            <FieldError message={shown.displayOrder} />
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

/** The calculated price of this meat box, so staff can see what customers will pay. */
function PricePreview({
  price,
  weightKg,
  pricePerKg,
}: {
  price: number | null;
  weightKg: number | null;
  pricePerKg: number | null;
}) {
  return (
    <div className="rounded-xl bg-neutral-50 px-4 py-3.5" aria-live="polite">
      <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">Price (calculated)</p>
      <p className="mt-1 text-lg font-semibold text-neutral-900">{price != null ? formatNaira(price) : "-"}</p>
      <p className="mt-0.5 text-xs text-neutral-500">
        {price != null && weightKg != null && pricePerKg != null
          ? `${formatWeight(weightKg)} x ${formatPerKg(pricePerKg)}`
          : "Enter a weight to see the price. It's the weight x the category's price per kg."}
      </p>
    </div>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="mt-1.5 text-xs text-red-600">
      {message}
    </p>
  );
}
