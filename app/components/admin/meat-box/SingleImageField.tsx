"use client";

import { ImageUploadField } from "@/app/components/admin/inventory/fields";

export type SingleImageFieldProps = {
  /** The newly chosen file, if any. */
  value: File | null;
  onChange: (file: File | null) => void;
  /** The image already saved on the category / option, shown while editing. */
  current?: string | null;
  error?: string;
  onError?: (message: string) => void;
};

/**
 * One image per category / option. ImageUploadField is multi-file, so this
 * keeps the most recently chosen file (picking again replaces the old one),
 * and shows the saved image so staff know what they'd be replacing.
 */
export function SingleImageField({ value, onChange, current, error, onError }: SingleImageFieldProps) {
  return (
    <div>
      {current && !value && (
        <div className="mb-3 flex items-center gap-3 rounded-xl bg-neutral-50 p-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={current} alt="" className="size-14 shrink-0 rounded-lg object-cover" />
          <p className="text-xs text-neutral-500">Current image. Upload a new one to replace it.</p>
        </div>
      )}
      <ImageUploadField
        label="Image"
        hint="SVG, PNG, JPG, GIF or WebP, up to 5MB"
        value={value ? [value] : []}
        onChange={(files) => onChange(files[files.length - 1] ?? null)}
        error={error}
        onError={onError}
      />
    </div>
  );
}
