"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { PaymentVerification } from "../../../components/PaymentVerification";
import { usePaymentVerification } from "../../../lib/usePaymentVerification";
import { toast } from "../../../lib/toast";

export function PaymentReturn() {
  const router = useRouter();
  const params = useSearchParams();
  const { update } = useSession();

  // Paystack sends `reference`; `trxref` is the same value under its older name.
  const reference = params.get("reference") ?? params.get("trxref");

  const { state, retry } = usePaymentVerification(reference);

  async function handleDone() {
    const settled = state.phase === "settled";
    const isBundle = state.payment?.purpose === "bundle";

    if (settled) {
      // The session's credit count is a copy taken at sign-in; a purchase just
      // changed it, so pull the live figure before the account page renders it.
      await update();
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

  return (
    <>
      {/* Something has to occupy the page behind the dialog — a bare scrim
          over nothing reads as a broken screen. */}
      <div className="mx-auto w-full max-w-md px-4 py-20 text-center">
        <p className="caption">Artiza</p>
      </div>

      <PaymentVerification state={state} onRetry={retry} onDone={handleDone} />
    </>
  );
}
