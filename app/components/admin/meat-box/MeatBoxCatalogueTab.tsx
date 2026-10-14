"use client";

import { useState } from "react";
import { ConfirmDialog } from "@/app/components/admin/ConfirmDialog";
import AdminIcon from "@/app/components/admin/layout/AdminIcon";
import { useDialog } from "@/app/components/dialog/DialogProvider";
import { notify } from "@/lib/notify";
import { getErrorMessage } from "@/redux/config/errors";
import {
  useDeleteAdminMeatBoxCategoryMutation,
  useDeleteAdminMeatBoxOptionMutation,
  useListAdminMeatBoxCatalogueQuery,
  useUpdateAdminMeatBoxCategoryMutation,
  useUpdateAdminMeatBoxOptionMutation,
} from "@/redux/slices/adminMeatBoxApi";
import type { AdminMeatBoxActiveStatus, AdminMeatBoxCategory, AdminMeatBoxOption } from "@/redux/types";
import { MeatBoxCategoryFormDialog } from "./MeatBoxCategoryFormDialog";
import { MeatBoxCategorySection } from "./MeatBoxCategorySection";
import { MeatBoxOptionFormDialog } from "./MeatBoxOptionFormDialog";

/**
 * The "Options & Categories" tab: every category with its meat boxes read
 * together, plus create / edit / delete for both through dialogs.
 */
export function MeatBoxCatalogueTab() {
  const { openDialog } = useDialog();
  const { data, isLoading, isError, error, refetch } = useListAdminMeatBoxCatalogueQuery();
  const [updateCategory] = useUpdateAdminMeatBoxCategoryMutation();
  const [updateOption] = useUpdateAdminMeatBoxOptionMutation();
  const [deleteCategory] = useDeleteAdminMeatBoxCategoryMutation();
  const [deleteOption] = useDeleteAdminMeatBoxOptionMutation();
  const [search, setSearch] = useState("");

  const categories = data?.data.items ?? [];
  const optionCount = categories.reduce((sum, c) => sum + c.options.length, 0);
  const query = search.trim().toLowerCase();

  /** A category stays when its own name matches (then all its options show) or any option does. */
  const visible = categories.flatMap((category) => {
    if (!query) return [{ category, options: category.options }];
    if (category.label.toLowerCase().includes(query)) return [{ category, options: category.options }];
    const options = category.options.filter((o) => o.label.toLowerCase().includes(query));
    return options.length > 0 ? [{ category, options }] : [];
  });

  function openCategoryForm(category?: AdminMeatBoxCategory) {
    openDialog(({ close }) => <MeatBoxCategoryFormDialog category={category} close={close} />, {
      title: category ? "Edit Category" : "Add Category",
      side: "center",
      width: "xl",
    });
  }

  function openOptionForm(option?: AdminMeatBoxOption, defaultCategoryId?: string) {
    openDialog(
      ({ close }) => (
        <MeatBoxOptionFormDialog
          option={option}
          categories={categories}
          defaultCategoryId={defaultCategoryId}
          close={close}
        />
      ),
      { title: option ? "Edit Meat Box" : "Add Meat Box", side: "center", width: "xl" },
    );
  }

  function confirmDeleteCategory(category: AdminMeatBoxCategory) {
    openDialog(
      ({ close }) => (
        <ConfirmDialog
          title="Delete this category?"
          description={`"${category.label}" will be removed from the Meat Box page.`}
          onConfirm={async () => {
            try {
              await deleteCategory(category.id).unwrap();
              notify.success("Category deleted");
            } catch (err) {
              notify.error("Couldn't delete category", { message: getErrorMessage(err) });
              throw err;
            }
          }}
          close={close}
        />
      ),
      { title: "Delete category", side: "center", width: "sm" },
    );
  }

  function confirmDeleteOption(option: AdminMeatBoxOption) {
    openDialog(
      ({ close }) => (
        <ConfirmDialog
          title="Delete this meat box?"
          description={`"${option.label}" will be removed from the Meat Box page. If customers have already ordered it, set it to Inactive instead.`}
          onConfirm={async () => {
            try {
              await deleteOption(option.id).unwrap();
              notify.success("Meat box deleted");
            } catch (err) {
              notify.error("Couldn't delete meat box", { message: getErrorMessage(err) });
              throw err;
            }
          }}
          close={close}
        />
      ),
      { title: "Delete meat box", side: "center", width: "sm" },
    );
  }

  async function handleCategoryStatus(category: AdminMeatBoxCategory, status: AdminMeatBoxActiveStatus) {
    try {
      await updateCategory({ id: category.id, status }).unwrap();
    } catch (err) {
      notify.error("Couldn't update status", { message: getErrorMessage(err) });
      throw err;
    }
  }

  async function handleOptionStatus(option: AdminMeatBoxOption, status: AdminMeatBoxActiveStatus) {
    try {
      await updateOption({ id: option.id, status }).unwrap();
    } catch (err) {
      notify.error("Couldn't update status", { message: getErrorMessage(err) });
      throw err;
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-neutral-100 bg-white p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-0 flex-1">
            <AdminIcon
              name="search"
              className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-neutral-400"
            />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search categories or meat boxes......"
              className="h-11 w-full rounded-xl bg-neutral-100 pl-11 pr-4 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-luxol-green/30"
            />
          </div>

          <button
            type="button"
            onClick={() => openCategoryForm()}
            className="flex h-11 items-center gap-2 rounded-xl border border-neutral-200 px-4 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
          >
            <AdminIcon name="plus" className="size-4" />
            Add Category
          </button>
          <button
            type="button"
            onClick={() => openOptionForm()}
            disabled={categories.length === 0}
            title={categories.length === 0 ? "Create a category first" : undefined}
            className="flex h-11 items-center gap-2 rounded-xl bg-luxol-green px-4 text-sm font-medium text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <AdminIcon name="plus" className="size-4" />
            Add Meat Box
          </button>
        </div>

        {data && (
          <p className="mt-4 text-xs text-neutral-500">
            {categories.length} {categories.length === 1 ? "category" : "categories"} · {optionCount}{" "}
            {optionCount === 1 ? "meat box" : "meat boxes"}
          </p>
        )}
      </div>

      {isLoading ? (
        <CatalogueSkeleton />
      ) : isError ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-neutral-100 bg-white py-16 text-center">
          <p className="text-sm text-neutral-600">{getErrorMessage(error)}</p>
          <button
            type="button"
            onClick={refetch}
            className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-50"
          >
            Try again
          </button>
        </div>
      ) : categories.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-neutral-100 bg-white py-16 text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-neutral-100 text-neutral-400">
            <AdminIcon name="meatBox" className="size-7" />
          </span>
          <p className="text-sm font-medium text-neutral-900">No categories yet</p>
          <p className="max-w-sm text-sm text-neutral-500">
            Start with a category like Cow Beef or Goat, then add the meat boxes customers can pick inside it.
          </p>
          <button
            type="button"
            onClick={() => openCategoryForm()}
            className="mt-2 rounded-lg bg-luxol-green px-4 py-2 text-sm font-medium text-white hover:brightness-110"
          >
            Add Category
          </button>
        </div>
      ) : visible.length === 0 ? (
        <div className="rounded-2xl border border-neutral-100 bg-white py-16 text-center">
          <p className="text-sm font-medium text-neutral-900">Nothing matches your search</p>
          <p className="mt-1 text-sm text-neutral-500">Try a different category or meat box name.</p>
        </div>
      ) : (
        visible.map(({ category, options }) => (
          <MeatBoxCategorySection
            key={category.id}
            category={category}
            options={options}
            searching={query !== ""}
            onEditCategory={openCategoryForm}
            onDeleteCategory={confirmDeleteCategory}
            onAddOption={(c) => openOptionForm(undefined, c.id)}
            onEditOption={(option) => openOptionForm(option)}
            onDeleteOption={confirmDeleteOption}
            onCategoryStatus={handleCategoryStatus}
            onOptionStatus={handleOptionStatus}
          />
        ))
      )}
    </div>
  );
}

function CatalogueSkeleton() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className="space-y-4 rounded-2xl border border-neutral-100 bg-white p-6">
          <div className="h-12 w-64 animate-pulse rounded-xl bg-neutral-100" />
          <div className="h-12 animate-pulse rounded-lg bg-neutral-100" />
          <div className="h-12 animate-pulse rounded-lg bg-neutral-100" />
        </div>
      ))}
    </div>
  );
}
