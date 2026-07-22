"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useApi } from "./api/useApi";
import { ApiError } from "./api/error";
import type { PaymentStatus } from "./api/types";

export type VerificationPhase = "verifying" | "settled" | "failed" | "timeout";

export interface VerificationState {
  phase: VerificationPhase;
  payment?: PaymentStatus;
  message?: string;
}

/**
 * Paystack redirects the customer back the instant the money clears, but the
 * unlock is granted by the webhook — which may land a second or two later. So
 * the screen polls until the API says `fulfilled`, rather than assuming the
 * redirect means delivery.
 */
const POLL_INTERVAL_MS = 1500;
const MAX_ATTEMPTS = 12; // ~18s, then we stop and offer a manual retry.

export function usePaymentVerification(reference: string | null) {
  const { api, signedIn } = useApi();
  const [state, setState] = useState<VerificationState>({ phase: "verifying" });
  const [attemptKey, setAttemptKey] = useState(0);

  // The poll loop reads these without re-subscribing the effect.
  const apiRef = useRef(api);
  useEffect(() => {
    apiRef.current = api;
  });

  useEffect(() => {
    if (!reference || !signedIn) return;

    // Two independent stop signals: `cancelled` for anything already in
    // flight when this tears down, and the timeout handle for the next tick
    // that has not fired yet. Cleaning up only one of them leaks the other.
    let cancelled = false;
    let timeout: ReturnType<typeof setTimeout> | undefined;
    let attempts = 0;

    async function poll() {
      attempts += 1;

      try {
        const payment = await apiRef.current.unlocks.verifyPayment(reference!);
        if (cancelled) return;

        if (payment.fulfilled) {
          setState({ phase: "settled", payment });
          return;
        }

        if (payment.status === "failed" || payment.status === "abandoned") {
          setState({
            phase: "failed",
            payment,
            message:
              payment.status === "abandoned"
                ? "The payment was cancelled. Nothing was charged."
                : "The payment didn't go through. Nothing was charged.",
          });
          return;
        }

        // Paid but not yet delivered — the webhook is still in flight.
        if (attempts >= MAX_ATTEMPTS) {
          setState({ phase: "timeout", payment });
          return;
        }

        timeout = setTimeout(poll, POLL_INTERVAL_MS);
      } catch (cause) {
        if (cancelled) return;

        // A reference the API has never heard of will never settle.
        if (cause instanceof ApiError && cause.isNotFound) {
          setState({
            phase: "failed",
            message: "We couldn't find that payment. If you were charged, contact support.",
          });
          return;
        }

        if (attempts >= MAX_ATTEMPTS) {
          setState({ phase: "timeout" });
          return;
        }

        timeout = setTimeout(poll, POLL_INTERVAL_MS);
      }
    }

    void poll();

    return () => {
      cancelled = true;
      if (timeout) clearTimeout(timeout);
    };
  }, [reference, signedIn, attemptKey]);

  /** Restarts the poll from zero — the "Check again" button. */
  const retry = useCallback(() => {
    setState({ phase: "verifying" });
    setAttemptKey((n) => n + 1);
  }, []);

  return { state, retry };
}
