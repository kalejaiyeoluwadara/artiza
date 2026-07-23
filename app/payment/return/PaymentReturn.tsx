"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { PaymentVerification } from "../../../components/PaymentVerification";
import { usePaymentVerification } from "../../../lib/usePaymentVerification";
import { useUnlocks } from "../../../context/UnlocksContext";
import { toast } from "../../../lib/toast";

export function PaymentReturn() {
  const router = useRouter();
  const params = useSearchParams();
  const { update } = useSession();
  const { refresh } = useUnlocks();

  // Paystack sends `reference`; `trxref` is the same value under its older name.
  const reference = params.get("reference") ?? params.get("trxref");

  const { state, retry } = usePaymentVerification(reference);

  // Both of these are stale the instant the payment settles: the unlock list
  // was read before the webhook granted anything, and the session's credit
  // count is a copy taken at sign-in that the bundle just changed server-side.
  // Refreshing them the moment it settles — not on the customer's tap — means
  // /unlocked is already warm and the new credits are spendable right away,
  // even if they never tap through this screen. A ref keeps it to one pass, so
  // an unstable `update` identity can't loop it or rotate the token twice.
  const settled = state.phase === "settled";
  const refreshedRef = useRef(false);
  useEffect(() => {
    if (!settled || refreshedRef.current) return;
    refreshedRef.current = true;
    refresh();
    void update();
  }, [settled, refresh, update]);

  async function handleDone() {
    const isBundle = state.payment?.purpose === "bundle";

    if (settled) {
      toast.success(
        isBundle ? "Credits added" : "Contact unlocked",
        {
          description: isBundle
            ? "They're ready whenever you are."
            : "It's saved to your unlocked list.",
        },
      );
    }

    // `replace`, so the back button never returns to a spent reference.
    router.replace(settled && !isBundle ? "/unlocked" : "/account");
  }

  if (!reference) {
    return (
      <div className="mx-auto w-full max-w-md px-4 py-20 text-center">
        <h1 className="title text-ink">Nothing to confirm</h1>
        <p className="mt-2 text-[0.9375rem] text-sub">
          This page opens after a payment. Head back to your account.
        </p>
        <button
          type="button"
          onClick={() => router.replace("/account")}
          className="pressable mt-6 rounded-full bg-accent px-5 py-3 text-[0.9375rem] font-semibold text-white"
        >
          Go to account
        </button>
      </div>
    );
  }

  return <PaymentVerification state={state} onRetry={retry} onDone={handleDone} />;
}

