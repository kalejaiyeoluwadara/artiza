"use client";

import { useRef } from "react";
import { Check, TriangleAlert } from "lucide-react";
import { Dialog } from "./Dialog";
import type { VerificationState } from "../lib/usePaymentVerification";

/**
 * What the customer sees between paying and having the thing they paid for.
 *
 * It is a dialog rather than a toast because it is the only thing on screen
 * that matters at that moment, and because "did my money go through" deserves
 * a definite answer rather than something that slides away after four seconds.
 */
export function PaymentVerification({
  state,
  onRetry,
  onDone,
}: {
  state: VerificationState;
  onRetry: () => void;
  onDone: () => void;
}) {
  const actionRef = useRef<HTMLButtonElement>(null);
  const { phase, payment } = state;

  const isBundle = payment?.purpose === "bundle";

  return (
    <Dialog
      open
      onClose={onDone}
      label={TITLES[phase]}
      initialFocusRef={actionRef}
      // While it is still checking there is no answer to act on, so the
      // dialog holds — dismissing here would hide the outcome, not skip it.
      dismissable={phase !== "verifying"}
    >
      <div className="flex flex-col items-center text-center">
        <StatusMark phase={phase} />

        <h2 className="title mt-4 text-ink">{TITLES[phase]}</h2>

        <p className="mt-2 text-[0.9375rem] text-pretty text-sub">
          {state.message ?? bodyFor(phase, isBundle)}
        </p>

        {payment ? (
          <p className="caption mt-3 break-all">
            Reference <span className="figure text-ink">{payment.reference}</span>
          </p>
        ) : null}
      </div>

      {phase === "verifying" ? null : (
        <div className="mt-6 flex gap-2.5">
          {phase === "timeout" ? (
            <button
              type="button"
              onClick={onRetry}
              className="pressable flex-1 rounded-full bg-fill py-3 text-[0.9375rem] font-semibold text-ink"
            >
              Check again
            </button>
          ) : null}

          <button
            ref={actionRef}
            type="button"
            onClick={onDone}
            className="pressable flex-1 rounded-full bg-accent py-3 text-[0.9375rem] font-semibold text-white"
          >
            {phase === "settled"
              ? isBundle
                ? "See my credits"
                : "See the contact"
              : "Done"}
          </button>
        </div>
      )}
    </Dialog>
  );
}

const TITLES: Record<VerificationState["phase"], string> = {
  verifying: "Confirming your payment",
  settled: "Payment confirmed",
  failed: "Payment didn't go through",
  timeout: "Still confirming",
};

function bodyFor(phase: VerificationState["phase"], isBundle: boolean): string {
  switch (phase) {
    case "verifying":
      return "This usually takes a couple of seconds. Don't close this page.";
    case "settled":
      return isBundle
        ? "Your credits have been added. Each one unlocks a contact."
        : "The contact is unlocked. It stays on your account for good.";
    case "failed":
      return "Nothing was charged. You can try again or use a different method.";
    case "timeout":
      return "Your bank has confirmed the payment but we're still waiting on it to land. It usually arrives within a minute — nothing is lost.";
  }
}

function StatusMark({ phase }: { phase: VerificationState["phase"] }) {
  if (phase === "verifying") {
    return (
      <span
        aria-hidden
        className="size-12 rounded-full border-[3px] border-fill border-t-accent motion-safe:animate-spin"
      />
    );
  }

  if (phase === "settled") {
    return (
      <span
        aria-hidden
        className="flex size-12 items-center justify-center rounded-full bg-accent-soft text-accent"
      >
        <Check size={26} strokeWidth={2.6} />
      </span>
    );
  }

  const tone = phase === "failed" ? "bg-danger/10 text-danger" : "bg-fill text-sub";

  return (
    <span
      aria-hidden
      className={`flex size-12 items-center justify-center rounded-full ${tone}`}
    >
      <TriangleAlert size={24} strokeWidth={2.4} />
    </span>
  );
}
