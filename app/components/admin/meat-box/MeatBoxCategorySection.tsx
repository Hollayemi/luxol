"use client";

import AdminIcon from "@/app/components/admin/layout/AdminIcon";
import { formatNaira } from "@/app/utils/product";
import type { AdminMeatBoxActiveStatus, AdminMeatBoxCategory, AdminMeatBoxOption } from "@/redux/types";
import { CatalogueStatusToggle } from "./CatalogueStatusToggle";
import { formatPerKg, formatWeight } from "./formatters";

export type MeatBoxCategorySectionProps = {
  category: AdminMeatBoxCategory;
  /** The options to list. Fewer than `category.options` while searching. */
  options: AdminMeatBoxOption[];
  /** True while a search is filtering the list (changes the empty message). */
  searching: boolean;
  onEditCategory: (category: AdminMeatBoxCategory) => void;
  onDeleteCategory: (category: AdminMeatBoxCategory) => void;
  onAddOption: (category: AdminMeatBoxCategory) => void;
  onEditOption: (option: AdminMeatBoxOption) => void;
  onDeleteOption: (option: AdminMeatBoxOption) => void;
  onCategoryStatus: (category: AdminMeatBoxCategory, status: AdminMeatBoxActiveStatus) => Promise<void>;
  onOptionStatus: (option: AdminMeatBoxOption, status: AdminMeatBoxActiveStatus) => Promise<void>;
};

const COLUMNS = ["Meat Box", "Weight", "Price", "Max Qty", "Status", "Actions"];

function Thumb({ src, size }: { src: string | null; size: "sm" | "md" }) {
  const box = size === "md" ? "size-12 rounded-xl" : "size-10 rounded-lg";
  return (
    <span className={`flex shrink-0 items-center justify-center overflow-hidden bg-neutral-100 ${box}`}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className="size-full object-cover" />
      ) : (
        <AdminIcon name="package" className="size-4 text-neutral-400" />
      )}
    </span>
  );
}

function IconButton({
  label,
  onClick,
  disabled,
  title,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={title ?? label}
      className="flex size-9 items-center justify-center rounded-lg border border-neutral-200 text-neutral-500 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-neutral-500"
    >
      {children}
    </button>
  );
}

/** One category with its options underneath, read together. */
export function MeatBoxCategorySection({
  category,
  options,
  searching,
  onEditCategory,
  onDeleteCategory,
  onAddOption,
  onEditOption,
  onDeleteOption,
  onCategoryStatus,
  onOptionStatus,
}: MeatBoxCategorySectionProps) {
  const total = category.options.length;
  const hasOptions = total > 0;

  return (
    <section className="rounded-2xl border border-neutral-100 bg-white p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <Thumb src={category.image} size="md" />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="truncate text-base font-semibold text-neutral-900">{category.label}</h3>
              <span className="rounded-md bg-[#e7f4e4] px-2 py-0.5 text-xs font-semibold text-luxol-green">
                {formatPerKg(category.pricePerKg)}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-neutral-500">
              {total} {total === 1 ? "meat box" : "meat boxes"} · Display order {category.displayOrder}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <CatalogueStatusToggle
            label={`Status of ${category.label}`}
            value={category.status}
            onChange={(status) => onCategoryStatus(category, status)}
          />
          <button
            type="button"
            onClick={() => onAddOption(category)}
            className="flex h-9 items-center gap-1.5 rounded-lg border border-neutral-300 px-3 text-xs font-medium text-neutral-900 transition hover:bg-neutral-50"
          >
            <AdminIcon name="plus" className="size-3.5" />
            Add Meat Box
          </button>
          <button
            type="button"
            onClick={() => onEditCategory(category)}
            className="flex h-9 items-center gap-1.5 rounded-lg bg-luxol-green px-3 text-xs font-medium text-white transition hover:brightness-110"
          >
            <AdminIcon name="edit" className="size-3.5" />
            Edit Category
          </button>
          <IconButton
            label={`Delete ${category.label}`}
            title={hasOptions ? "Remove or move its meat boxes first" : `Delete ${category.label}`}
            disabled={hasOptions}
            onClick={() => onDeleteCategory(category)}
          >
            <AdminIcon name="trash" className="size-4" />
          </IconButton>
        </div>
      </div>

      {options.length === 0 ? (
        <div className="mt-5 rounded-xl bg-neutral-50 px-4 py-8 text-center">
          <p className="text-sm text-neutral-500">
            {searching && hasOptions
              ? "No meat boxes in this category match your search."
              : "No meat boxes in this category yet."}
          </p>
          {!hasOptions && (
            <button
              type="button"
              onClick={() => onAddOption(category)}
              className="mt-3 rounded-lg bg-luxol-green px-4 py-2 text-sm font-medium text-white hover:brightness-110"
            >
              Add the first one
            </button>
          )}
        </div>
      ) : (
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[760px] text-left">
            <thead>
              <tr className="border-b border-neutral-100 text-xs uppercase tracking-wide text-neutral-400">
                {COLUMNS.map((col) => (
                  <th key={col} className="pb-3 pr-4 font-normal">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {options.map((option) => (
                <tr key={option.id} className="border-b border-neutral-100 last:border-0">
                  <td className="py-3.5 pr-4">
                    <div className="flex items-center gap-3">
                      <Thumb src={option.image} size="sm" />
                      <span className="text-sm font-medium text-neutral-900">{option.label}</span>
                    </div>
                  </td>
                  <td className="py-3.5 pr-4 text-sm text-neutral-900">{formatWeight(option.weightKg)}</td>
                  <td className="py-3.5 pr-4 text-sm text-neutral-900">
                    <p className="font-medium">{formatNaira(option.price)}</p>
                    <p className="mt-0.5 text-xs text-neutral-400">
                      {formatWeight(option.weightKg)} x {formatPerKg(category.pricePerKg)}
                    </p>
                  </td>
                  <td className="py-3.5 pr-4 text-sm text-neutral-900">{option.maxQuantity ?? "Default"}</td>
                  <td className="py-3.5 pr-4">
                    <CatalogueStatusToggle
                      label={`Status of ${option.label}`}
                      value={option.status}
                      onChange={(status) => onOptionStatus(option, status)}
                    />
                  </td>
                  <td className="py-3.5">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onEditOption(option)}
                        className="flex h-9 items-center gap-1.5 rounded-lg bg-luxol-green px-3 text-xs font-medium text-white transition hover:brightness-110"
                      >
                        <AdminIcon name="edit" className="size-3.5" />
                        Edit
                      </button>
                      <IconButton label={`Delete ${option.label}`} onClick={() => onDeleteOption(option)}>
                        <AdminIcon name="trash" className="size-4" />
                      </IconButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
