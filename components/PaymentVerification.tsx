"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { VerificationState } from "../lib/usePaymentVerification";

/**
 * What the customer sees between paying and having the thing they paid for.
 *
 * It owns the whole page rather than sitting in a dialog. A modal is for a task
 * laid over something you were already doing — but arriving back from Paystack,
 * this *is* the thing you are doing, and there is nothing behind it worth
 * looking at. On the page it can also take the room to state the amount and the
 * reference, which is what someone actually wants if they later need to argue
 * with their bank.
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
  const { phase, payment } = state;
  const isBundle = payment?.purpose === "bundle";

  return (
    <div className="mx-auto w-full max-w-md px-4 pb-28 pt-14 md:px-6 md:pb-16 md:pt-20">
      <div className="flex flex-col items-center text-center">
        <StatusMark phase={phase} />

        <h1 className="title-lg mt-7 text-ink">{TITLES[phase]}</h1>

        <p className="mt-3 text-[1.0625rem] leading-relaxed text-pretty text-sub">
          {state.message ?? bodyFor(phase, isBundle)}
        </p>
      </div>

      {payment ? (
        <dl className="mt-9 overflow-hidden rounded-2xl bg-fill">
          <Row label="Amount">
            <span className="figure text-ink">
              ₦{payment.amount.toLocaleString("en-NG")}
            </span>
          </Row>

          <Row label={isBundle ? "Bundle" : "Unlock"}>
            <span className="text-ink">
              {isBundle ? "3 contact unlocks" : "One artisan contact"}
            </span>
          </Row>

          {payment.channel ? (
            <Row label="Paid by">
              <span className="capitalize text-ink">{payment.channel}</span>
            </Row>
          ) : null}

          {/* Last, and allowed to wrap — it is the longest value here and the
              one nobody reads unless something has gone wrong. */}
          <Row label="Reference">
            <span className="figure break-all text-right text-[0.8125rem] text-sub">
              {payment.reference}
            </span>
          </Row>
        </dl>
      ) : null}

      <div className="mt-8 space-y-3">
        {phase === "verifying" ? (
          // Nothing to act on yet, and a disabled button only invites taps.
          <p className="caption text-center text-faint">
            Keep this page open — it updates on its own.
          </p>
        ) : (
          <>
            <button
              type="button"
              onClick={onDone}
              className="pressable hover-dim w-full rounded-full bg-accent py-3.5 text-[1.0625rem] font-semibold text-white shadow-[0_1px_3px_rgba(13,122,95,0.25)]"
            >
              {primaryLabel(phase, isBundle)}
            </button>

            {phase === "timeout" ? (
              <button
                type="button"
                onClick={onRetry}
                className="pressable w-full rounded-full bg-fill py-3.5 text-[1.0625rem] font-semibold text-ink"
              >
                Check again
              </button>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-6 border-b border-line px-4 py-3.5 last:border-b-0">
      <dt className="caption shrink-0">{label}</dt>
      <dd className="min-w-0 text-[0.9375rem] font-semibold">{children}</dd>
    </div>
  );
}

/**
 * The status glyph, at page scale.
 *
 * The settled state draws itself: the ring sweeps round, then the check strokes
 * in. Drawing rather than fading is the point — a stroke that travels reads as
 * something being *completed*, which is exactly the news. Under
 * `prefers-reduced-motion` it cuts straight to the finished mark, where a
 * travelling stroke would be the wrong idea entirely.
 */
function StatusMark({ phase }: { phase: VerificationState["phase"] }) {
  const reduced = useReducedMotion();

  if (phase === "verifying") {
    return (
      <span
        aria-hidden
        className="size-20 rounded-full border-[3px] border-fill border-t-accent motion-safe:animate-spin"
        style={{ animationDuration: "0.9s" }}
      />
    );
  }

  if (phase === "settled") {
    return (
      <span aria-hidden className="relative flex size-20 items-center justify-center">
        {/* The tint arrives under the stroke, so the mark lands on a surface
            rather than floating on the page. */}
        <motion.span
          className="absolute inset-0 rounded-full bg-accent-soft"
          initial={reduced ? false : { scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          // No bounce: no gesture carried momentum into this, and a confirmed
          // payment should feel certain rather than springy.
          transition={{ type: "spring", bounce: 0, duration: 0.45 }}
        />

        <svg
          viewBox="0 0 52 52"
          className="relative size-20 text-accent"
          fill="none"
          stroke="currentColor"
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <motion.circle
            cx="26"
            cy="26"
            r="23"
            initial={reduced ? false : { pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.55, ease: [0.23, 1, 0.32, 1] }}
            // Starts at 12 o'clock rather than 3, so the sweep reads as a dial
            // completing instead of an arbitrary arc.
            style={{ rotate: -90, transformOrigin: "center" }}
          />
          <motion.path
            d="M16 26.5 L23 33.5 L36.5 19"
            initial={reduced ? false : { pathLength: 0 }}
            animate={{ pathLength: 1 }}
            // Overlaps the ring's tail slightly — waiting for a clean finish
            // reads as two separate events rather than one.
            transition={{ duration: 0.3, delay: 0.4, ease: [0.23, 1, 0.32, 1] }}
          />
        </svg>
      </span>
    );
  }

  const failed = phase === "failed";

  return (
    <span
      aria-hidden
      className={`flex size-20 items-center justify-center rounded-full ${
        failed ? "bg-danger/10 text-danger" : "bg-fill text-sub"
      }`}
    >
      <svg
        viewBox="0 0 52 52"
        className="size-20"
        fill="none"
        stroke="currentColor"
        strokeWidth={3}
        strokeLinecap="round"
      >
        {failed ? (
          <>
            <path d="M19 19 L33 33" />
            <path d="M33 19 L19 33" />
          </>
        ) : (
          <>
            {/* Still waiting: a clock, not a warning — nothing has gone wrong. */}
            <circle cx="26" cy="26" r="15" strokeWidth={2.5} />
            <path d="M26 17.5 V26.5 L32 30" />
          </>
        )}
      </svg>
    </span>
  );
}

const TITLES: Record<VerificationState["phase"], string> = {
  verifying: "Confirming your payment",
  settled: "Payment confirmed",
  failed: "Payment didn't go through",
  timeout: "Still confirming",
};

function primaryLabel(
  phase: VerificationState["phase"],
  isBundle: boolean,
): string {
  if (phase === "settled") return isBundle ? "See my credits" : "See the contact";
  if (phase === "failed") return "Back to account";
  return "Done";
}

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
