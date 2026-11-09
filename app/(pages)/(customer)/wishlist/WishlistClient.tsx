"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import SignInPrompt from "@/app/components/ui/SignInPrompt";
import { HeartIcon } from "@/app/components/ui/icons";
import { notify } from "@/lib/notify";
import { getErrorMessage } from "@/redux/config/errors";
import { useGetWishlistQuery, useRemoveFromWishlistMutation } from "@/redux/slices/wishlistApi";
import WishlistRow, { WISHLIST_COLUMNS } from "./components/WishlistRow";

function WishlistSkeleton() {
  return (
    <div aria-hidden="true" className="space-y-4">
      <div className="h-[72px] animate-pulse rounded-2xl bg-luxol-orange/40" />
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="h-28 animate-pulse rounded-xl bg-neutral-100" />
      ))}
    </div>
  );
}

export default function WishlistClient() {
  const { status } = useSession();
  const signedIn = status === "authenticated";

  const { data, isLoading, isError, error, refetch } = useGetWishlistQuery(undefined, {
    skip: !signedIn,
  });
  const [removeFromWishlist] = useRemoveFromWishlistMutation();

  async function handleRemove(productId: string) {
    try {
      // The row leaves the list straight away (see wishlistApi) and comes back if this fails
      await removeFromWishlist(productId).unwrap();
      notify.success("Removed from wishlist", { id: "wishlist-remove" });
    } catch (err) {
      notify.error("Couldn't remove that item", { message: getErrorMessage(err) });
    }
  }

  if (status === "loading" || (signedIn && isLoading)) return <WishlistSkeleton />;

  if (!signedIn) {
    return (
      <SignInPrompt
        title="Sign in to see your wishlist"
        description="Items you save for later are kept with your account, so they're here on every device."
      />
    );
  }

  if (isError || !data) {
    return (
      <div role="alert" className="flex flex-col items-center gap-3 py-16 text-center">
        <p className="text-sm text-neutral-600">{getErrorMessage(error)}</p>
        <button
          type="button"
          onClick={refetch}
          className="rounded-lg border border-neutral-300 px-5 py-2.5 text-sm font-semibold text-neutral-900 hover:bg-neutral-50"
        >
          Try again
        </button>
      </div>
    );
  }

  const items = data.data.items;

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center py-16 text-center">
        <span className="flex size-16 items-center justify-center rounded-full bg-neutral-100 text-neutral-400">
          <HeartIcon className="size-7" />
        </span>
        <h2 className="mt-5 text-xl font-bold text-neutral-900">Your wishlist is empty</h2>
        <p className="mt-2 max-w-sm text-sm text-neutral-500">
          Tap Save For Later on any product and it will show up here.
        </p>
        <Link
          href="/shop"
          className="mt-6 inline-flex h-11 items-center rounded-lg bg-luxol-green px-6 text-sm font-semibold text-white transition hover:brightness-110"
        >
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Column titles (the rows stack on small screens, so these hide there) */}
      <div
        aria-hidden="true"
        className={`hidden items-center gap-x-4 rounded-2xl bg-luxol-orange px-4 py-6 text-lg font-medium text-neutral-900 md:grid ${WISHLIST_COLUMNS}`}
      >
        <span className="pl-14">Product</span>
        <span>Price</span>
        <span>Stock Status</span>
        <span className="min-w-36" />
      </div>

      <ul aria-label="Wishlist">
        {items.map((item) => (
          <WishlistRow key={item.id} item={item} onRemove={handleRemove} />
        ))}
      </ul>
    </div>
  );
}
