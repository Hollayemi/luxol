"use client";

import { useState } from "react";
import { useDialog } from "@/app/components/dialog/DialogProvider";
import { notify } from "@/lib/notify";
import { getErrorMessage } from "@/redux/config/errors";
import {
  useClearRewardActivitiesMutation,
  useListRewardActivitiesQuery,
} from "@/redux/slices/rewardsApi";
import { formatActivityDate, formatActivityPoints } from "@/app/utils/rewards";

const PAGE_STEP = 5;

function ClearDialog({ close }: { close: () => void }) {
  const [clear, { isLoading }] = useClearRewardActivitiesMutation();
  const [error, setError] = useState("");

  async function handleClear() {
    setError("");
    try {
      await clear().unwrap();
      notify.success("Activity list cleared", { id: "rewards-clear" });
      close();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <div className="p-6">
      <h2 className="text-base font-semibold text-neutral-900">Clear your points activity?</h2>
      <p className="mt-2 text-sm text-neutral-500">
        This only clears the list on this page. Your points balance won&apos;t change.
      </p>
      {error && (
        <p role="alert" className="mt-3 text-sm text-red-600">
          {error}
        </p>
      )}
      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          onClick={close}
          disabled={isLoading}
          className="h-10 rounded-lg border border-neutral-300 px-4 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50 disabled:opacity-60"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleClear}
          disabled={isLoading}
          className="h-10 rounded-lg bg-luxol-green px-4 text-sm font-medium text-white transition hover:brightness-110 disabled:cursor-wait disabled:opacity-70"
        >
          {isLoading ? "Clearing..." : "Clear list"}
        </button>
      </div>
    </div>
  );
}

/** The grey "Points Activities" panel: a timeline of points earned and spent. */
export default function PointsActivities() {
  const { openDialog } = useDialog();
  // "View More" asks for a bigger first page, so the list keeps its order and never repeats
  const [limit, setLimit] = useState(PAGE_STEP);

  const { currentData, isFetching, isLoading, isError, error, refetch } = useListRewardActivitiesQuery({
    page: 1,
    perPage: limit,
  });

  const list = currentData?.data;
  const items = list?.items ?? [];
  const total = list?.total ?? 0;

  return (
    <section aria-labelledby="points-activities-heading" className="rounded-xl bg-[#f5f5f5] p-6 sm:p-8">
      <div className="flex items-center justify-between gap-4">
        <h3 id="points-activities-heading" className="text-xl font-semibold text-neutral-900">
          Points Activities
        </h3>
        {items.length > 0 && (
          <button
            type="button"
            onClick={() =>
              openDialog(({ close }) => <ClearDialog close={close} />, {
                title: "Clear points activity",
                side: "center",
                width: "sm",
              })
            }
            className="flex items-center gap-1.5 rounded text-sm text-neutral-800 transition hover:text-luxol-green focus-visible:outline-2 focus-visible:outline-luxol-green"
          >
            <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
            Clear list
          </button>
        )}
      </div>

      <div className="mt-6">
        {isLoading ? (
          <div aria-hidden="true" className="space-y-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-14 animate-pulse rounded-lg bg-neutral-200/70" />
            ))}
          </div>
        ) : isError ? (
          <div role="alert" className="text-sm text-neutral-600">
            {getErrorMessage(error)}{" "}
            <button type="button" onClick={refetch} className="font-semibold text-luxol-green underline">
              Try again
            </button>
          </div>
        ) : items.length === 0 ? (
          <p className="py-6 text-sm text-neutral-500">
            No points activity yet. Points you earn and spend will show up here.
          </p>
        ) : (
          <>
            <ol>
              {items.map((activity, i) => {
                const isLast = i === items.length - 1;
                return (
                  <li key={activity.id} className="flex gap-4">
                    <div className="flex w-5 shrink-0 flex-col items-center">
                      <span aria-hidden="true" className="mt-1 size-5 rounded-full border-[3px] border-neutral-500 bg-[#f5f5f5]" />
                      {!isLast && <span aria-hidden="true" className="w-px flex-1 bg-neutral-300" />}
                    </div>
                    <div className={`min-w-0 flex-1 ${isLast ? "" : "pb-7"}`}>
                      <p className="text-base font-medium text-neutral-900">
                        {formatActivityPoints(activity.points)}
                      </p>
                      <p className="mt-1 text-sm text-neutral-700">{activity.description}</p>
                      <p className="mt-1 text-xs text-neutral-400">{formatActivityDate(activity)}</p>
                    </div>
                  </li>
                );
              })}
            </ol>

            {items.length < total && (
              <button
                type="button"
                onClick={() => setLimit((n) => n + PAGE_STEP)}
                disabled={isFetching}
                className="mx-auto mt-4 block rounded px-3 py-1 text-base font-medium text-luxol-green transition hover:underline disabled:opacity-60"
              >
                {isFetching ? "Loading..." : "View More"}
              </button>
            )}
          </>
        )}
      </div>
    </section>
  );
}
