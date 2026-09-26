"use client";

import { useState } from "react";
import { CheckCircleIcon } from "@/app/components/ui/icons";
import { SelectField } from "@/app/components/ui/form-fields";
import {
  ALLOCATION_STEP,
  DELIVERY_DAYS,
  DELIVERY_FREQUENCIES,
  DELIVERY_WINDOWS,
  PROTEIN_OPTIONS,
  adjustAllocation,
  canDecrease as canDecreaseShare,
  canIncrease as canIncreaseShare,
  toggleProtein,
  type Allocation,
} from "@/app/data/subscription-checkout-data";
import { formatPlanPrice, type MembershipPlan } from "@/app/data/subscription-data";
import AddressSection, {
  EMPTY_ADDRESS_FORM,
  type AddressFormValue,
} from "./components/AddressSection";
import ProteinCard from "./components/ProteinCard";
import SummaryCard from "./components/SummaryCard";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default function CheckoutClient({ plan }: { plan: MembershipPlan }) {
  const [allocation, setAllocation] = useState<Allocation>({});
  const [frequencyId, setFrequencyId] = useState("");
  const [day, setDay] = useState("");
  const [deliveryWindow, setDeliveryWindow] = useState("");
  const [address, setAddress] = useState<AddressFormValue>(EMPTY_ADDRESS_FORM);

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const selectedProteins = PROTEIN_OPTIONS.filter((p) => p.id in allocation);
  const frequency = DELIVERY_FREQUENCIES.find((f) => f.id === frequencyId);
  const weeklyAmount = Math.round(plan.price / (frequency?.deliveriesPerMonth ?? 4));

  const isValid =
    selectedProteins.length > 0 &&
    !!frequencyId &&
    !!day &&
    !!deliveryWindow &&
    address.address.trim().length > 0 &&
    !!address.region &&
    address.phone.replace(/\D/g, "").length >= 10;

  async function handleSubmit() {
    if (!isValid || submitting) return;
    setSubmitError("");
    setSubmitting(true);
    try {
      // No payment/subscriptions backend yet — this simulates the request
      // so the review flow (selection, validation, summary) is fully
      // exercised end to end.
      await delay(700);
      setSubmitted(true);
    } catch {
      setSubmitError("We couldn't start your subscription. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center py-16 text-center">
        <span className="flex size-16 items-center justify-center rounded-full bg-luxol-green/10 text-luxol-green">
          <CheckCircleIcon className="size-8" />
        </span>
        <h2 className="mt-6 text-xl font-bold text-neutral-900">
          Taking you to payment…
        </h2>
        <p className="mt-2 max-w-sm text-sm text-neutral-500">
          Your {plan.name} membership is ready — {formatPlanPrice(plan.price)}/month,{" "}
          {frequency?.label.toLowerCase()} on {day}s, {deliveryWindow}.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div>
        <h2 className="text-lg font-bold text-neutral-900">Review Your Membership Plan</h2>

        <p className="mt-4 rounded-2xl bg-[#f8f1e6] p-5 text-sm leading-relaxed text-neutral-700">
          <span className="font-semibold text-luxol-orange">
            Customize your weekly protein mix:
          </span>{" "}
          Your {formatPlanPrice(plan.price)} membership is divided across your selected
          weekly deliveries. Choose the proteins you want from the list below — you can
          select one, several, or all of them — then set the percentage you&apos;d like
          for each. Each delivery, we&apos;ll use your selected percentages to prepare a{" "}
          {formatPlanPrice(weeklyAmount)} worth of protein mix for you.
        </p>

        <h3 className="mt-8 text-base font-semibold text-neutral-900">
          Select your preferred Protein Supply
        </h3>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {PROTEIN_OPTIONS.map((protein) => (
            <ProteinCard
              key={protein.id}
              protein={protein}
              allocation={allocation}
              onToggle={() => setAllocation((a) => toggleProtein(a, protein.id))}
              onAdjust={(dir) =>
                setAllocation((a) =>
                  adjustAllocation(a, protein.id, dir * ALLOCATION_STEP),
                )
              }
              canDecrease={canDecreaseShare(allocation, protein.id)}
              canIncrease={canIncreaseShare(allocation, protein.id)}
            />
          ))}
        </div>

        <div className="mt-8">
          <SelectField
            label="Delivery frequency"
            value={frequencyId}
            onChange={(e) => setFrequencyId(e.target.value)}
          >
            <option value="" disabled>
              Select delivery frequency
            </option>
            {DELIVERY_FREQUENCIES.map((f) => (
              <option key={f.id} value={f.id}>
                {f.label}
              </option>
            ))}
          </SelectField>
        </div>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <SelectField label="Delivery Day" value={day} onChange={(e) => setDay(e.target.value)}>
            <option value="" disabled>
              Select delivery day
            </option>
            {DELIVERY_DAYS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </SelectField>

          <SelectField
            label="Delivery Window"
            value={deliveryWindow}
            onChange={(e) => setDeliveryWindow(e.target.value)}
          >
            <option value="" disabled>
              Select delivery window
            </option>
            {DELIVERY_WINDOWS.map((w) => (
              <option key={w} value={w}>
                {w}
              </option>
            ))}
          </SelectField>
        </div>

        <hr className="my-8 border-neutral-200" />

        <AddressSection value={address} onChange={setAddress} />
      </div>

      <SummaryCard
        plan={plan}
        selectedProteinNames={selectedProteins.map((p) => p.name)}
        isValid={isValid}
        submitting={submitting}
        onSubmit={handleSubmit}
      />

      {submitError && (
        <p role="alert" className="lg:col-span-2 text-sm font-medium text-red-600">
          {submitError}
        </p>
      )}
    </div>
  );
}
