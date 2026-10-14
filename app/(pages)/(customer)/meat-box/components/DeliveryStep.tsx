"use client";

import { AddressSection } from "@/app/components/cart/CartDrawer";
import { InfoIcon } from "@/app/components/ui/icons";
import { SelectField, labelClass } from "@/app/components/ui/form-fields";
import type { MeatBoxOptions } from "@/redux/types";

export const GUIDELINES_MAX = 500;

export type DeliveryValues = {
  frequencyId: string;
  day: string;
  window: string;
  addressId: string;
  guidelines: string;
};

export default function DeliveryStep({
  options,
  values,
  onChange,
  addressError,
}: {
  options: MeatBoxOptions;
  values: DeliveryValues;
  onChange: (patch: Partial<DeliveryValues>) => void;
  addressError?: string;
}) {
  return (
    <div>
      <h2 className="text-lg font-bold text-neutral-900">How do you want it delivered?</h2>

      <div className="mt-6">
        <SelectField
          label="Delivery frequency"
          value={values.frequencyId}
          onChange={(e) => onChange({ frequencyId: e.target.value })}
        >
          <option value="" disabled>
            Select delivery frequency
          </option>
          {options.deliveryFrequencies.map((f) => (
            <option key={f.id} value={f.id}>
              {f.label}
            </option>
          ))}
        </SelectField>
      </div>

      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <SelectField
          label="Delivery Day"
          value={values.day}
          onChange={(e) => onChange({ day: e.target.value })}
        >
          <option value="" disabled>
            Select delivery day
          </option>
          {options.deliveryDays.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </SelectField>

        <SelectField
          label="Delivery Window"
          value={values.window}
          onChange={(e) => onChange({ window: e.target.value })}
        >
          <option value="" disabled>
            Select delivery window
          </option>
          {options.deliveryWindows.map((w) => (
            <option key={w} value={w}>
              {w}
            </option>
          ))}
        </SelectField>
      </div>

      <div className="mt-5">
        <label htmlFor="meat-guidelines" className={`${labelClass} mb-2`}>
          Custom Butchery Guidelines
        </label>
        <textarea
          id="meat-guidelines"
          rows={4}
          maxLength={GUIDELINES_MAX}
          value={values.guidelines}
          onChange={(e) => onChange({ guidelines: e.target.value })}
          placeholder="e.g. Please separate the meat into smaller 1kg packs, remove excess fat from beef steak, and skin the chicken..."
          className="w-full resize-none rounded-xl border border-neutral-200 bg-neutral-100/70 px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-luxol-green focus:outline-none focus:ring-2 focus:ring-luxol-green/30"
        />
        <p className="mt-2 flex items-center gap-2 rounded-lg bg-[#f8e9d2] px-3 py-2 text-[11px] text-neutral-700">
          <InfoIcon className="size-3.5 shrink-0 text-luxol-orange" />
          This helps our butchers prepare your box exactly the way you like it. Your satisfaction
          is our signature.
        </p>
      </div>

      <hr className="my-8 border-neutral-200" />

      <AddressSection
        selectedId={values.addressId}
        error={addressError}
        onSelect={(id) => onChange({ addressId: id })}
      />
    </div>
  );
}
