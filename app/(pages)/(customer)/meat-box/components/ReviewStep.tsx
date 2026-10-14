"use client";

import type { ReactNode } from "react";
import { AlertCircleIcon } from "@/app/components/ui/icons";
import {
  estimateBox,
  formatKgRange,
  formatNairaRange,
  formatQuantity,
  type SelectedItem,
} from "@/app/utils/meat-box";
import { formatNaira } from "@/app/utils/product";
import { useListAddressesQuery } from "@/redux/slices/usersApi";
import type { MeatBoxOptions } from "@/redux/types";
import type { DeliveryValues } from "./DeliveryStep";

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-6">
      <h3 className="text-sm font-semibold text-neutral-900">{title}</h3>
      <dl className="mt-3 flex flex-col gap-2.5 rounded-xl border border-neutral-200 p-4 text-xs">
        {children}
      </dl>
    </section>
  );
}

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-6">
      <dt className="shrink-0 text-neutral-500">{label}</dt>
      <dd className="text-right font-medium text-neutral-900">{value}</dd>
    </div>
  );
}

/** What a line is expected to cost: exact for per-kilo meat, an estimate (or nothing yet) for animals. */
function lineEstimate({ option, quantity }: SelectedItem): string {
  if (option.unit === "kg" && option.pricePerKg != null) {
    return formatNaira(option.pricePerKg * quantity);
  }
  if (option.estimatedPrice) {
    return `~${formatNairaRange({
      min: option.estimatedPrice.min * quantity,
      max: option.estimatedPrice.max * quantity,
    })}`;
  }
  return "Unconfirmed";
}

export default function ReviewStep({
  items,
  options,
  values,
  onEdit,
}: {
  items: SelectedItem[];
  options: MeatBoxOptions;
  values: DeliveryValues;
  onEdit: () => void;
}) {
  const { data } = useListAddressesQuery();
  const address = data?.data.find((a) => a.id === values.addressId);
  const frequency = options.deliveryFrequencies.find((f) => f.id === values.frequencyId);
  const estimate = estimateBox(items);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-neutral-900">Review your Meat Box</h2>
        <button
          type="button"
          onClick={onEdit}
          className="text-xs font-semibold text-luxol-orange hover:underline"
        >
          Edit
        </button>
      </div>

      <Section title="1. Selected Meats">
        {items.map((item) => (
          <Row
            key={item.option.id}
            label={`${item.option.label} (${formatQuantity(item.option.unit, item.quantity)})`}
            value={lineEstimate(item)}
          />
        ))}
      </Section>

      <Section title="2. Delivery Address">
        <Row label="Address" value={address?.address ?? "—"} />
        <Row label="Full Name" value={address?.fullName ?? "—"} />
        <Row label="Phone Number" value={address ? `+234 ${address.phone}` : "—"} />
      </Section>

      <Section title="3. Preferences">
        <Row label="Schedule Frequency" value={frequency?.label ?? "—"} />
        <Row label="Delivery Day" value={values.day} />
        <Row label="Delivery Window" value={values.window} />
        <Row
          label="Custom Butchery Guideline"
          value={
            values.guidelines.trim() ? (
              <span className="line-clamp-2 max-w-xs whitespace-pre-line">
                {values.guidelines.trim()}
              </span>
            ) : (
              "None"
            )
          }
        />
      </Section>

      <div className="mt-6 rounded-xl bg-[#f8f1e6] p-4">
        <p className="flex items-center gap-2 text-xs font-semibold text-luxol-orange">
          <AlertCircleIcon className="size-4" />
          Weight &amp; Price Variance
        </p>
        <p className="mt-1.5 text-[11px] leading-relaxed text-neutral-600">
          Your final weight and price may vary slightly. Meat is prepared and weighed fresh after
          ordering, so we will confirm the final amount prior to dispatch.
        </p>
      </div>

      <div className="mt-4 flex items-end justify-between gap-4 rounded-xl bg-luxol-green p-4 text-white">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-wide text-white/70">
            Est. box weight
          </p>
          <p className="mt-0.5 text-lg font-bold">
            {estimate.weightKg ? `~${formatKgRange(estimate.weightKg)}` : "To be weighed"}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-medium uppercase tracking-wide text-white/70">
            Est. total range
          </p>
          <p className="mt-0.5 text-lg font-bold text-luxol-orange">
            {estimate.price ? formatNairaRange(estimate.price) : "Confirmed after weighing"}
          </p>
        </div>
      </div>
    </div>
  );
}
