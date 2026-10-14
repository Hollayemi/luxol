"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useSession } from "next-auth/react";
import useOpenAuth from "@/app/components/auth/useOpenAuth";
import { isActive } from "@/app/utils/meat-box";
import { getErrorMessage } from "@/redux/config/errors";
import {
  MEAT_BOX_ORDER_POLL_MS,
  useListMyMeatBoxOrdersQuery,
} from "@/redux/slices/meatBoxApi";
import OngoingBox from "../components/OngoingBox";
import OrderHistory from "../components/OrderHistory";

const primaryBtn =
  "inline-flex h-11 items-center rounded-lg bg-luxol-green px-5 text-sm font-semibold text-white transition hover:brightness-110";

export default function ManageClient({ highlightOrderId }: { highlightOrderId?: string }) {
  const { status: sessionStatus } = useSession();
  const openAuth = useOpenAuth();
  const authed = sessionStatus === "authenticated";

  // While something is waiting on staff (weighing) or on the payment webhook,
  // re-check so the price and the "Place Order" button show up on their own.
  const { data, isLoading, isError, error, refetch } = useListMyMeatBoxOrdersQuery(undefined, {
    skip: !authed,
    pollingInterval: MEAT_BOX_ORDER_POLL_MS,
  });

  if (sessionStatus === "loading" || (authed && isLoading)) {
    return <div aria-hidden="true" className="h-96 animate-pulse rounded-3xl bg-neutral-100" />;
  }

  if (!authed) {
    return (
      <Empty title="Sign in to manage your Meat Box" body="Log in to see your orders and deliveries.">
        <button type="button" onClick={() => openAuth("login")} className={primaryBtn}>
          Sign in
        </button>
      </Empty>
    );
  }

  if (isError) {
    return (
      <Empty title="We couldn't load your Meat Box" body={getErrorMessage(error)}>
        <button
          type="button"
          onClick={() => void refetch()}
          className="inline-flex h-11 items-center rounded-lg border border-neutral-300 px-5 text-sm font-semibold"
        >
          Try again
        </button>
      </Empty>
    );
  }

  const orders = data?.data.items ?? [];
  if (orders.length === 0) {
    return (
      <Empty
        title="You haven't ordered a Meat Box yet"
        body="Pick whole, half or quarter animals, or cuts by the kilo, and we'll prepare them fresh."
      >
        <Link href="/meat-box/build" className={primaryBtn}>
          Build Your Meat Box
        </Link>
      </Empty>
    );
  }

  const ongoing = orders.find(isActive);

  return (
    <div className="grid gap-12 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
      <section aria-labelledby="manage-heading">
        <h2 id="manage-heading" className="text-xl font-bold text-neutral-900">
          Manage Meat Box
        </h2>
        <div className="mt-6">
          {ongoing ? (
            <OngoingBox order={ongoing} />
          ) : (
            <div className="rounded-3xl bg-neutral-50 p-6">
              <p className="text-base font-semibold text-neutral-900">No ongoing Meat Box</p>
              <p className="mt-1.5 text-sm text-neutral-500">
                Your last box has been delivered. Ready for the next one?
              </p>
              <Link href="/meat-box/build" className={`${primaryBtn} mt-5`}>
                Build Your Meat Box
              </Link>
            </div>
          )}
        </div>
      </section>

      <section aria-labelledby="history-heading">
        <h2 id="history-heading" className="text-xl font-bold text-neutral-900">
          Order History
        </h2>
        <div className="mt-6">
          <OrderHistory orders={orders} initialOpenId={highlightOrderId} />
        </div>
      </section>
    </div>
  );
}

function Empty({ title, body, children }: { title: string; body: string; children: ReactNode }) {
  return (
    <div className="flex flex-col items-center py-16 text-center">
      <h2 className="text-xl font-bold text-neutral-900">{title}</h2>
      <p className="mt-2 max-w-sm text-sm text-neutral-500">{body}</p>
      <div className="mt-6">{children}</div>
    </div>
  );
}
