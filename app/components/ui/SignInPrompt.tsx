"use client";

import useOpenAuth from "@/app/components/auth/useOpenAuth";

export type SignInPromptProps = {
  title: string;
  description: string;
};

/** Shown on account-only pages (wishlist, loyalty) to someone who isn't signed in. */
export default function SignInPrompt({ title, description }: SignInPromptProps) {
  const openAuth = useOpenAuth();

  return (
    <div className="flex flex-col items-center py-16 text-center">
      <h2 className="text-xl font-bold text-neutral-900">{title}</h2>
      <p className="mt-2 max-w-sm text-sm text-neutral-500">{description}</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={() => openAuth("login")}
          className="inline-flex h-11 items-center rounded-lg bg-luxol-green px-6 text-sm font-semibold text-white transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-luxol-green"
        >
          Sign in
        </button>
        <button
          type="button"
          onClick={() => openAuth("register")}
          className="inline-flex h-11 items-center rounded-lg border border-neutral-300 px-6 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-50"
        >
          Create account
        </button>
      </div>
    </div>
  );
}
