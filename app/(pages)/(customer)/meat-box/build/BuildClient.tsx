"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import useOpenAuth from "@/app/components/auth/useOpenAuth";
import { CheckCircleIcon } from "@/app/components/ui/icons";
import { boxTotal, resolveSelection, type MeatBoxSelection } from "@/app/utils/meat-box";
import { formatNaira } from "@/app/utils/product";
import { notify } from "@/lib/notify";
import { getErrorMessage } from "@/redux/config/errors";
import {
  MEAT_BOX_CATALOGUE_REFETCH,
  useCreateMeatBoxOrderMutation,
  useGetMeatBoxOptionsQuery,
} from "@/redux/slices/meatBoxApi";
import type { MeatBoxOptions } from "@/redux/types";
import { useCart } from "@/redux/hooks";

import DeliveryStep, { GUIDELINES_MAX, type DeliveryValues } from "../components/DeliveryStep";
import ReviewStep from "../components/ReviewStep";
import SelectStep from "../components/SelectStep";
import SelectedItemsCard from "../components/SelectedItemsCard";
import StepProgress from "../components/StepProgress";

/** Loads what's on offer (the same data staff manage), then hands it to the builder. */
export default function BuildClient() {
  const query = useGetMeatBoxOptionsQuery(undefined, MEAT_BOX_CATALOGUE_REFETCH);
  const options = query.data?.data;

  if (query.isLoading) return <BuildSkeleton />;

  if (query.isError || !options) {
    return (
      <div role="alert" className="flex flex-col items-center py-16 text-center">
        <h2 className="text-xl font-bold text-neutral-900">We couldn&apos;t load the Meat Box</h2>
        <p className="mt-2 max-w-sm text-sm text-neutral-500">{getErrorMessage(query.error)}</p>
        <button
          type="button"
          onClick={() => void query.refetch()}
          className="mt-6 inline-flex h-11 items-center rounded-lg bg-luxol-green px-5 text-sm font-semibold text-white transition hover:brightness-110"
        >
          Try again
        </button>
      </div>
    );
  }

  return <Builder options={options} onRefresh={() => void query.refetch()} />;
}

type Step = 1 | 2 | 3;

function Builder({ options, onRefresh }: { options: MeatBoxOptions; onRefresh: () => void }) {
  const cart = useCart();
  const { status: sessionStatus } = useSession();
  const openAuth = useOpenAuth();
  const [createOrder, { isLoading: submitting }] = useCreateMeatBoxOrderMutation();

  const topRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState<Step>(1);
  // Set once the order exists and we're sending the customer to pay for it
  const [paying, setPaying] = useState<{ orderId: string; total: number } | null>(null);
  const [submitError, setSubmitError] = useState("");

  const [selection, setSelection] = useState<MeatBoxSelection[]>([]);
  const [delivery, setDelivery] = useState<DeliveryValues>({
    frequencyId: options.deliveryFrequencies[0]?.id ?? "",
    day: "",
    window: "",
    addressId: cart.addressId ?? "",
    guidelines: "",
  });

  const allOptions = useMemo(() => options.categories.flatMap((c) => c.options), [options]);
  // Staff may have changed or removed something since the page loaded
  const items = useMemo(() => resolveSelection(selection, allOptions), [selection, allOptions]);
  const selectedIds = useMemo(() => new Set(items.map((i) => i.option.id)), [items]);

  // Bring the top of the form into view when moving between steps
  useEffect(() => {
    topRef.current?.scrollIntoView({ block: "start", behavior: "smooth" });
  }, [step, paying]);

  function toggle(optionId: string) {
    setSelection((prev) =>
      prev.some((s) => s.optionId === optionId)
        ? prev.filter((s) => s.optionId !== optionId)
        : [...prev, { optionId, quantity: 1 }],
    );
  }

  function setQuantity(optionId: string, quantity: number) {
    setSelection((prev) => prev.map((s) => (s.optionId === optionId ? { ...s, quantity } : s)));
  }

  const patchDelivery = (patch: Partial<DeliveryValues>) =>
    setDelivery((d) => ({ ...d, ...patch }));

  const deliveryValid =
    !!delivery.frequencyId && !!delivery.day && !!delivery.window && !!delivery.addressId;

  function next() {
    if (step === 1) {
      if (items.length === 0) return;
      // Choosing an address and placing the order both need an account
      if (sessionStatus !== "authenticated") {
        openAuth("login");
        return;
      }
      setStep(2);
    } else if (step === 2 && deliveryValid) {
      setStep(3);
    }
  }

  /** The price is fixed, so placing the order means paying for it straight away. */
  async function submit() {
    if (submitting || items.length === 0 || !deliveryValid) return;
    if (sessionStatus !== "authenticated") {
      openAuth("login");
      return;
    }

    setSubmitError("");
    try {
      const res = await createOrder({
        items: items.map((i) => ({ optionId: i.option.id, quantity: i.quantity })),
        deliveryFrequency: delivery.frequencyId,
        deliveryDay: delivery.day,
        deliveryWindow: delivery.window,
        addressId: delivery.addressId,
        butcheryGuidelines: delivery.guidelines.trim().slice(0, GUIDELINES_MAX) || undefined,
      }).unwrap();

      setPaying({ orderId: res.data.order.id, total: res.data.order.total });
      window.location.assign(res.data.payment.authorizationUrl);
    } catch (err) {
      const message = getErrorMessage(err);
      setSubmitError(message);
      notify.error("We couldn't place your order", { message });
      // A price or option may have changed while they were choosing
      onRefresh();
    }
  }

  if (paying) {
    return (
      <div ref={topRef} className="scroll-mt-24">
        <RedirectingToPayment orderId={paying.orderId} total={paying.total} />
      </div>
    );
  }

  const total = boxTotal(items);
  const actionByStep = {
    1: { label: "Continue", disabled: items.length === 0, onAction: next },
    2: { label: "Continue", disabled: !deliveryValid || items.length === 0, onAction: next },
    3: {
      label: `Pay Now · ${formatNaira(total)}`,
      disabled: !deliveryValid || items.length === 0,
      onAction: submit,
    },
  } as const;
  const action = actionByStep[step];

  return (
    <div ref={topRef} className="scroll-mt-24">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-xl font-semibold text-neutral-800">Shop Bulk Meat</h2>
        <p className="mt-3 text-sm leading-relaxed text-neutral-500">
          Order whole, half, or quarter animals prepared by our expert butchers. Ideal for large
          families, events, or deep freezing, and also add some additional assorted varieties
        </p>
        <p className="mt-6 rounded-xl bg-[#f8f1e6] px-5 py-4 text-left text-xs leading-relaxed text-neutral-700">
          <span className="font-semibold text-luxol-orange">How pricing works:</span> every meat box
          has a set weight and each meat has a price per kg, so the price you see is the price you
          pay. Choose what you want, then order and pay in one go.
        </p>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div>
          <StepProgress step={step} />

          <div className="mt-8">
            {step === 1 && (
              <SelectStep
                categories={options.categories}
                selectedIds={selectedIds}
                onToggle={toggle}
              />
            )}

            {step === 2 && (
              <DeliveryStep options={options} values={delivery} onChange={patchDelivery} />
            )}

            {step === 3 && (
              <ReviewStep
                items={items}
                options={options}
                values={delivery}
                onEdit={() => setStep(1)}
              />
            )}
          </div>

          {step > 1 && (
            <button
              type="button"
              onClick={() => setStep((s) => (s - 1) as Step)}
              className="mt-8 text-sm font-semibold text-neutral-600 hover:text-luxol-green"
            >
              ← Back
            </button>
          )}

          {submitError && (
            <p role="alert" className="mt-4 text-sm font-medium text-red-600">
              {submitError}
            </p>
          )}
        </div>

        <SelectedItemsCard
          items={items}
          editable={step !== 3}
          onQuantityChange={setQuantity}
          onRemove={toggle}
          actionLabel={action.label}
          actionDisabled={action.disabled}
          actionLoading={submitting}
          onAction={action.onAction}
        />
      </div>
    </div>
  );
}

/**
 * Shown while the browser leaves for the payment page. The order already
 * exists (unpaid), so if they come back without paying it's waiting in their
 * Meat Box with a Pay Now button rather than being lost.
 */
function RedirectingToPayment({ orderId, total }: { orderId: string; total: number }) {
  return (
    <div className="flex flex-col items-center py-16 text-center">
      <span className="flex size-16 items-center justify-center rounded-full bg-luxol-green/10 text-luxol-green">
        <CheckCircleIcon className="size-8" />
      </span>
      <h2 className="mt-6 text-xl font-bold text-neutral-900">Taking you to payment…</h2>
      <p className="mt-2 max-w-sm text-sm text-neutral-500">
        Your Meat Box is ready. Pay {formatNaira(total)} to confirm your order.
      </p>
      <Link
        href={`/meat-box/manage?order=${orderId}`}
        className="mt-6 text-sm font-semibold text-luxol-green hover:underline"
      >
        Not redirected? View your Meat Box
      </Link>
    </div>
  );
}

function BuildSkeleton() {
  return (
    <div aria-hidden="true" className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px]">
      <div className="space-y-4">
        <div className="h-3 w-full animate-pulse rounded bg-neutral-100" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-44 animate-pulse rounded-xl bg-neutral-100" />
          ))}
        </div>
      </div>
      <div className="h-96 animate-pulse rounded-3xl bg-neutral-100" />
    </div>
  );
}
