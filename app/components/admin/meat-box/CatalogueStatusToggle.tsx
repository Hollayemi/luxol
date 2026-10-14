"use client";

import { useState } from "react";
import AdminIcon from "@/app/components/admin/layout/AdminIcon";
import type { AdminMeatBoxActiveStatus } from "@/redux/types";

const OPTIONS: { label: string; value: AdminMeatBoxActiveStatus }[] = [
  { label: "Active", value: "ACTIVE" },
  { label: "Inactive", value: "INACTIVE" },
];

export type CatalogueStatusToggleProps = {
  value: AdminMeatBoxActiveStatus;
  /** Save the new status. Reject to keep the old one (show the error yourself). */
  onChange: (status: AdminMeatBoxActiveStatus) => Promise<void>;
  /** Names the control for screen readers, e.g. "Status of Quarter Cow". */
  label: string;
};

/** The inline Active / Inactive select on a category or option row. */
export function CatalogueStatusToggle({ value, onChange, label }: CatalogueStatusToggleProps) {
  const [saving, setSaving] = useState(false);
  const active = value === "ACTIVE";

  async function handleChange(next: AdminMeatBoxActiveStatus) {
    if (next === value) return;
    setSaving(true);
    try {
      await onChange(next);
    } catch {
      // The caller already told the user; the select snaps back to `value`.
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="relative inline-block">
      <select
        aria-label={label}
        value={value}
        disabled={saving}
        onChange={(e) => handleChange(e.target.value as AdminMeatBoxActiveStatus)}
        className={`appearance-none rounded-lg border border-neutral-200 bg-white py-1.5 pl-6 pr-8 text-sm disabled:opacity-60 ${
          active ? "text-luxol-green" : "text-neutral-500"
        }`}
      >
        {OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute left-2.5 top-1/2 size-1.5 -translate-y-1/2 rounded-full ${
          active ? "bg-luxol-green" : "bg-neutral-400"
        }`}
      />
      <AdminIcon
        name="chevronDown"
        className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-neutral-500"
      />
    </div>
  );
}
