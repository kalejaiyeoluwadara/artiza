"use client";

import { useRef, useState } from "react";
import { Dialog } from "./Dialog";
import { settleConfirm, usePendingConfirm, type ConfirmTone } from "../lib/confirm";

interface ShownRequest {
  id: number;
  title: string;
  body?: string;
  confirmLabel: string;
  cancelLabel?: string;
  tone?: ConfirmTone;
  onConfirm?: () => Promise<void>;
}

/**
 * Renders whatever `confirm()` is currently asking. Mounted once, near the
 * root — every confirmation in the app comes through here, so they all look
 * and behave the same and none of them ship their own dialog state.
 */
export function ConfirmHost() {
  const pending = usePendingConfirm();
  const cancelRef = useRef<HTMLButtonElement>(null);

  // The store clears the moment an answer is given, but the dialog still has
  // an exit animation to play — so the last question is held for the way out.
  const [shown, setShown] = useState<ShownRequest | null>(pending);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Adjusting state during render rather than in an effect: React re-runs this
  // component immediately with the new values, so there is no extra painted
  // frame and no setState-in-effect cascade.
  if (pending && pending.id !== shown?.id) {
    setShown(pending);
    setBusy(false);
    setError(null);
    return null;
  }

  if (!shown) return null;

  async function handleConfirm() {
    // Captured up front — the store can clear across an await.
    const request = shown;
    if (!request) return;

    if (!request.onConfirm) {
      settleConfirm(true);
      return;
    }

    setBusy(true);
    setError(null);

    try {
      await request.onConfirm();
      settleConfirm(true);
    } catch (cause) {
      // Stay open and say what happened — closing would leave the customer
      // guessing whether anything was charged.
      setBusy(false);
      setError(
        cause instanceof Error
          ? cause.message
          : "Something went wrong. Please try again.",
      );
    }
  }

  const tone = shown.tone ?? "accent";

  return (
    <Dialog
      open={pending !== null}
      onClose={() => settleConfirm(false)}
      label={shown.title}
      description={shown.body}
      initialFocusRef={cancelRef}
      // Mid-request, a stray tap on the scrim must not orphan the work.
      dismissable={!busy}
    >
      <h2 className="title text-ink">{shown.title}</h2>

      {shown.body ? (
        <p className="mt-2 text-[0.9375rem] text-pretty text-sub">{shown.body}</p>
      ) : null}

      {error ? (
        <p role="alert" className="caption mt-3 text-danger">
          {error}
        </p>
      ) : null}

      <div className="mt-6 flex gap-2.5">
        <button
          ref={cancelRef}
          type="button"
          onClick={() => settleConfirm(false)}
          disabled={busy}
          className="pressable flex-1 rounded-full bg-fill py-3 text-[0.9375rem] font-semibold text-ink disabled:opacity-50"
        >
          {shown.cancelLabel ?? "Cancel"}
        </button>

        <button
          type="button"
          onClick={handleConfirm}
          disabled={busy}
          className={`pressable flex-1 rounded-full py-3 text-[0.9375rem] font-semibold text-white disabled:opacity-60 ${
            tone === "danger" ? "bg-danger" : "bg-accent"
          }`}
        >
          {busy ? "Working…" : shown.confirmLabel}
        </button>
      </div>
    </Dialog>
  );
}
