"use client";

import { useState } from "react";
import { ModalButton, ModalHeader } from "@/app/components/admin/inventory/ModalHeader";
import { SelectField, TextField } from "@/app/components/admin/inventory/fields";
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
  AdminMeatBoxUnit,
  CreateAdminMeatBoxOptionRequest,
} from "@/redux/types";
import { decimalPlaces, parseDecimal, sanitizeDecimal } from "./formatters";
import { SingleImageField } from "./SingleImageField";

const UNIT_OPTIONS = [
  { label: "Whole / half / quarter animal (priced after weighing)", value: "ANIMAL" },
  { label: "By the kilo (fixed price per kg)", value: "KG" },
];

const STATUS_OPTIONS = [
  { label: "Active", value: "ACTIVE" },
  { label: "Inactive", value: "INACTIVE" },
];

/** Grams (Decimal(10,3)) and kobo (Decimal(12,2)). */
const MAX_WEIGHT_DECIMALS = 3;
const MAX_MONEY_DECIMALS = 2;

type ErrorKey = "label" | "categoryId" | "pricePerKg" | "weight" | "price" | "maxQuantity" | "displayOrder";
type Errors = Partial<Record<ErrorKey, string>>;

function toText(value: number | null | undefined) {
  return value == null ? "" : String(value);
}

/** "" -> null, otherwise the number (callers have validated it already). */
function toNumber(raw: string) {
  return raw.trim() === "" ? null : Number(raw);
}

function checkAmount(raw: string, decimals: number, what: string): string | undefined {
  const n = parseDecimal(raw);
  if (!Number.isFinite(n) || n <= 0) return `Enter ${what}`;
  if (decimalPlaces(raw) > decimals) return `Up to ${decimals} decimal places`;
  return undefined;
}

/** Both ends or neither: half a range would just confuse the customer. */
function checkRange(minRaw: string, maxRaw: string, decimals: number, what: string): string | undefined {
  if (minRaw.trim() === "" && maxRaw.trim() === "") return undefined;
  const minError = checkAmount(minRaw, decimals, `the minimum ${what}`);
  if (minError) return minError;
  const maxError = checkAmount(maxRaw, decimals, `the maximum ${what}`);
  if (maxError) return maxError;
  if (parseDecimal(maxRaw) < parseDecimal(minRaw)) return "The maximum can't be below the minimum";
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
 * Create / edit a Meat Box option ("Quarter Cow", "Goat Meat by Kg" ...).
 * Only the fields that make sense for the chosen unit are shown: per-kilo
 * meat has a fixed price per kg, animals have estimated weight and price
 * ranges (they are priced for real after weighing).
 */
export function MeatBoxOptionFormDialog({ option, categories, defaultCategoryId, close }: MeatBoxOptionFormDialogProps) {
  const [createOption, { isLoading: creating }] = useCreateAdminMeatBoxOptionMutation();
  const [updateOption, { isLoading: updating }] = useUpdateAdminMeatBoxOptionMutation();
  const loading = creating || updating;

  const [label, setLabel] = useState(option?.label ?? "");
  const [categoryId, setCategoryId] = useState(option?.categoryId ?? defaultCategoryId ?? categories[0]?.id ?? "");
  const [unit, setUnit] = useState<AdminMeatBoxUnit>(option?.unit ?? "ANIMAL");
  const [pricePerKg, setPricePerKg] = useState(toText(option?.pricePerKg));
  const [minKg, setMinKg] = useState(toText(option?.estimatedMinKg));
  const [maxKg, setMaxKg] = useState(toText(option?.estimatedMaxKg));
  const [minPrice, setMinPrice] = useState(toText(option?.estimatedMinPrice));
  const [maxPrice, setMaxPrice] = useState(toText(option?.estimatedMaxPrice));
  const [maxQuantity, setMaxQuantity] = useState(toText(option?.maxQuantity));
  const [status, setStatus] = useState<AdminMeatBoxActiveStatus>(option?.status ?? "ACTIVE");
  const [displayOrder, setDisplayOrder] = useState(option ? String(option.displayOrder) : "");
  const [image, setImage] = useState<File | null>(null);
  const [imageError, setImageError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const isKg = unit === "KG";

  const errors: Errors = {};
  if (label.trim().length < 2) errors.label = "Enter a name of at least 2 characters";
  if (!categoryId) errors.categoryId = "Choose a category";
  if (isKg) {
    errors.pricePerKg = checkAmount(pricePerKg, MAX_MONEY_DECIMALS, "the price per kg");
  } else {
    errors.weight = checkRange(minKg, maxKg, MAX_WEIGHT_DECIMALS, "weight");
    errors.price = checkRange(minPrice, maxPrice, MAX_MONEY_DECIMALS, "price");
  }
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

    // Fields that don't apply to the chosen unit are sent as null so that
    // switching an option's unit clears the old ones on the backend.
    const body = {
      categoryId,
      label: label.trim(),
      unit,
      pricePerKg: isKg ? toNumber(pricePerKg) : null,
      estimatedMinKg: isKg ? null : toNumber(minKg),
      estimatedMaxKg: isKg ? null : toNumber(maxKg),
      estimatedMinPrice: isKg ? null : toNumber(minPrice),
      estimatedMaxPrice: isKg ? null : toNumber(maxPrice),
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
        // Nothing to clear on a new option, so don't send empty fields.
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
    label: c.status === "INACTIVE" ? `${c.label} (inactive)` : c.label,
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
              ? "Update what customers can order and how it is priced."
              : "Add something customers can pick on the Meat Box page, like a Quarter Cow or Goat Meat by Kg."}
          </p>
        </div>

        <div className="space-y-5">
          <div>
            <TextField
              label="Meat Box Name"
              value={label}
              onChange={setLabel}
              placeholder="e.g. Quarter Cow"
              required
            />
            <FieldError message={shown.label} />
          </div>

          <div>
            <SelectField
              label="Category"
              value={categoryId}
              onChange={setCategoryId}
              options={categoryOptions}
              placeholder="Select a category"
            />
            <FieldError message={shown.categoryId} />
          </div>

          <SelectField
            label="Sold As"
            hint="Animals are weighed after the order and priced then. Per-kilo meat has a fixed price."
            value={unit}
            onChange={(v) => setUnit(v as AdminMeatBoxUnit)}
            options={UNIT_OPTIONS}
          />

          {isKg ? (
            <div>
              <TextField
                label="Price per kg (₦)"
                value={pricePerKg}
                onChange={(v) => setPricePerKg(sanitizeDecimal(v))}
                placeholder="e.g. 8500"
              />
              <FieldError message={shown.pricePerKg} />
            </div>
          ) : (
            <>
              <div>
                <p className="text-sm font-medium text-neutral-900">Estimated weight of one unit (kg)</p>
                <p className="mt-1 text-xs text-neutral-500">
                  What customers are told to expect, e.g. a quarter cow is 45 - 55kg.
                </p>
                <div className="mt-2.5 grid grid-cols-2 gap-4">
                  <TextField
                    label="Minimum"
                    value={minKg}
                    onChange={(v) => setMinKg(sanitizeDecimal(v))}
                    placeholder="e.g. 45"
                  />
                  <TextField
                    label="Maximum"
                    value={maxKg}
                    onChange={(v) => setMaxKg(sanitizeDecimal(v))}
                    placeholder="e.g. 55"
                  />
                </div>
                <FieldError message={shown.weight} />
              </div>

              <div>
                <p className="text-sm font-medium text-neutral-900">Estimated price of one unit (₦)</p>
                <p className="mt-1 text-xs text-neutral-500">
                  Shown as a range until staff weigh the meat and confirm the final price.
                </p>
                <div className="mt-2.5 grid grid-cols-2 gap-4">
                  <TextField
                    label="Minimum"
                    value={minPrice}
                    onChange={(v) => setMinPrice(sanitizeDecimal(v))}
                    placeholder="e.g. 300000"
                  />
                  <TextField
                    label="Maximum"
                    value={maxPrice}
                    onChange={(v) => setMaxPrice(sanitizeDecimal(v))}
                    placeholder="e.g. 360000"
                  />
                </div>
                <FieldError message={shown.price} />
              </div>
            </>
          )}

          <div>
            <TextField
              label="Max quantity per order"
              hint={
                isKg
                  ? "The most kilos a customer can order at once. Leave blank for the default."
                  : "The most a customer can order at once. Leave blank for the default."
              }
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

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="mt-1.5 text-xs text-red-600">
      {message}
    </p>
  );
}
