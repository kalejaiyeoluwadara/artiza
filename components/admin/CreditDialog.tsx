"use client";

import { useEffect, useRef, useState } from "react";
import { Coins, History, Minus, Plus } from "lucide-react";
import { Dialog } from "../Dialog";
import { Skeleton } from "../Skeleton";
import { TextArea } from "./Fields";
import { ApiError } from "../../lib/api/error";
import { useApi } from "../../lib/api/useApi";
import { UNLOCK_PRICE } from "../../lib/artisans";
import { shortDate } from "../../lib/outreach";
import type {
  AdjustCreditsResult,
  AdminUser,
  CreditGrant,
} from "../../lib/api/types";

/** The API's own ceiling on one adjustment. Enforced here so a typo is caught
 *  before it becomes a 422 — and, more to the point, before it becomes a gift. */
const MAX_ADJUSTMENT = 20;

/** What a support gesture actually looks like: one job, or a bundle's worth. */
const QUICK_AMOUNTS = [1, 2, 3, 5];

type Mode = "give" | "take";

/**
 * Moving credits on and off one customer's account.
 *
 * A credit is a free contact unlock, so this dialog is the console's only
 * screen that gives away money. It is built to make that fact hard to miss:
 * the naira value of the adjustment is spelled out under the amount, the
 * reason is required rather than optional, and the trail of every previous
 * adjustment sits underneath so nobody grants the same apology twice.
 *
 * There is no edit and no delete — the API's trail is append-only. A mistake
 * is corrected by taking the same amount back, with a reason that says so.
 */
export function CreditDialog({
  user,
  onClose,
  onSaved,
}: {
  /** The account being adjusted, or null when the dialog is closed. */
  user: AdminUser | null;
  onClose: () => void;
  onSaved: (result: AdjustCreditsResult) => void;
}) {
  const { api } = useApi();
  const cancelRef = useRef<HTMLButtonElement>(null);

  const [mode, setMode] = useState<Mode>("give");
  const [amount, setAmount] = useState(1);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();

  const [history, setHistory] = useState<CreditGrant[]>();
  const [historyFailed, setHistoryFailed] = useState(false);

  // The dialog animates out, so the account is held for the way back — but its
  // id is what the form resets on, not its identity.
  const [shown, setShown] = useState<AdminUser | null>(user);

  if (user && user.id !== shown?.id) {
    setShown(user);
    setMode("give");
    setAmount(1);
    setReason("");
    setError(undefined);
    setBusy(false);
    setHistory(undefined);
    setHistoryFailed(false);
  }

  const id = user?.id;

  useEffect(() => {
    if (!id) return;

    const controller = new AbortController();

    api.admin.users
      .creditHistory(id, controller.signal)
      .then((grants) => {
        if (!controller.signal.aborted) setHistory(grants);
      })
      .catch((cause: unknown) => {
        if (controller.signal.aborted) return;
        if (cause instanceof ApiError && cause.isAborted) return;
        // A trail that won't load must not block the adjustment — it is
        // context, not a gate.
        setHistoryFailed(true);
      });

    return () => controller.abort();
  }, [api, id]);

  if (!shown) return null;

  const signed = mode === "give" ? amount : -amount;
  const balanceAfter = shown.credits + signed;
  const overdrawn = balanceAfter < 0;
  const valid =
    amount >= 1 && amount <= MAX_ADJUSTMENT && reason.trim().length >= 3 && !overdrawn;

  async function submit() {
    if (!shown || !valid) return;

    setBusy(true);
    setError(undefined);

    try {
      const result = await api.admin.users.adjustCredits(shown.id, {
        amount: signed,
        reason: reason.trim(),
      });
      onSaved(result);
      onClose();
    } catch (cause) {
      setBusy(false);
      setError(
        cause instanceof ApiError
          ? cause.message
          : "That didn't save. Try again in a moment.",
      );
    }
  }

  return (
    <Dialog
      open={user !== null}
      onClose={onClose}
      label={`Credits for ${shown.name}`}
      description="Give this customer free unlocks, or take some back."
      initialFocusRef={cancelRef}
      dismissable={!busy}
    >
      <h2 className="title text-ink">Credits</h2>
      <p className="caption mt-0.5 truncate">
        {shown.name} · {shown.email}
      </p>

      {/* ── Where the balance stands ──────────────────────────────────── */}
      <div className="mt-4 flex items-center gap-3 rounded-2xl bg-fill px-4 py-3">
        <Coins size={18} strokeWidth={2} className="shrink-0 text-sub" />
        <p className="text-[0.9375rem] text-sub">
          <span className="figure text-ink">{shown.credits}</span> unspent{" "}
          {shown.credits === 1 ? "credit" : "credits"} now
        </p>
        <p className="figure ml-auto text-sm text-accent">
          → {Math.max(0, balanceAfter)}
        </p>
      </div>

      {/* ── Give or take ──────────────────────────────────────────────── */}
      <div
        role="group"
        aria-label="Direction"
        className="mt-4 flex gap-1 rounded-full bg-fill p-1"
      >
        {(
          [
            { value: "give", label: "Give", icon: Plus },
            { value: "take", label: "Take back", icon: Minus },
          ] as const
        ).map(({ value, label, icon: Icon }) => {
          const active = mode === value;
          return (
            <button
              key={value}
              type="button"
              aria-pressed={active}
              disabled={busy}
              onClick={() => setMode(value)}
              className={`pressable flex flex-1 items-center justify-center gap-1.5 rounded-full py-2 text-sm font-semibold transition-colors duration-200 ease-out ${
                active ? "bg-card text-ink" : "text-sub"
              }`}
            >
              <Icon size={14} strokeWidth={2.6} />
              {label}
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {QUICK_AMOUNTS.map((quick) => {
          const active = amount === quick;
          return (
            <button
              key={quick}
              type="button"
              aria-pressed={active}
              disabled={busy}
              onClick={() => setAmount(quick)}
              className={`pressable figure rounded-full px-4 py-1.5 text-sm font-semibold transition-colors duration-200 ease-out ${
                active ? "bg-ink text-canvas" : "bg-fill text-sub"
              }`}
            >
              {mode === "give" ? "+" : "−"}
              {quick}
            </button>
          );
        })}

        <label className="ml-auto flex items-center gap-2">
          <span className="caption">Or</span>
          <input
            type="number"
            min={1}
            max={MAX_ADJUSTMENT}
            value={amount}
            disabled={busy}
            onChange={(event) =>
              setAmount(Math.trunc(Number(event.target.value) || 0))
            }
            className="figure w-16 rounded-xl bg-fill px-3 py-1.5 text-center text-sm text-ink"
            aria-label="Credits to adjust"
          />
        </label>
      </div>

      {/* The number in the currency the decision is actually made in. */}
      <p className="caption mt-2 px-1">
        {amount >= 1 && amount <= MAX_ADJUSTMENT
          ? mode === "give"
            ? `${amount} free ${amount === 1 ? "unlock" : "unlocks"} — worth ₦${(
                amount * UNLOCK_PRICE
              ).toLocaleString("en-NG")} of contacts.`
            : `Removes ₦${(amount * UNLOCK_PRICE).toLocaleString(
                "en-NG",
              )} of unlocks they haven't spent yet.`
          : `Between 1 and ${MAX_ADJUSTMENT} credits at a time.`}
      </p>

      <div className="mt-4">
        <TextArea
          label="Why"
          value={reason}
          onChange={setReason}
          rows={2}
          maxLength={200}
          placeholder="Goodwill — the plumber never picked up."
          hint="Kept forever against your name. This can't be edited later."
        />
      </div>

      {overdrawn ? (
        <p role="alert" className="caption mt-3 px-1 text-danger">
          They only have {shown.credits}. You can&apos;t take back more than
          that.
        </p>
      ) : error ? (
        <p role="alert" className="caption mt-3 px-1 text-danger">
          {error}
        </p>
      ) : null}

      <div className="mt-5 flex gap-2.5">
        <button
          ref={cancelRef}
          type="button"
          onClick={onClose}
          disabled={busy}
          className="pressable flex-1 rounded-full bg-fill py-3 text-[0.9375rem] font-semibold text-ink disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => void submit()}
          disabled={busy || !valid}
          className={`pressable flex-1 rounded-full py-3 text-[0.9375rem] font-semibold text-white disabled:opacity-50 ${
            mode === "take" ? "bg-danger" : "bg-accent"
          }`}
        >
          {busy
            ? "Saving…"
            : mode === "give"
              ? `Give ${amount}`
              : `Take back ${amount}`}
        </button>
      </div>

      {/* ── What has already been done to this account ────────────────── */}
      <section className="mt-5 border-t border-line pt-4">
        <h3 className="caption flex items-center gap-1.5 font-semibold text-ink">
          <History size={13} strokeWidth={2.2} />
          Previous adjustments
        </h3>

        {history === undefined && !historyFailed ? (
          <div className="mt-2 space-y-2">
            <Skeleton className="h-4 w-full rounded-md" />
            <Skeleton className="h-4 w-2/3 rounded-md" />
          </div>
        ) : historyFailed ? (
          <p className="caption mt-1.5">
            Couldn&apos;t load the trail. The adjustment above still works.
          </p>
        ) : history!.length === 0 ? (
          <p className="caption mt-1.5">
            Nobody has ever adjusted this account by hand.
          </p>
        ) : (
          <ul className="mt-2 max-h-40 space-y-2.5 overflow-y-auto pr-1">
            {history!.map((grant) => (
              <li key={grant.id} className="flex items-start gap-2.5">
                <span
                  className={`figure shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${
                    grant.amount > 0
                      ? "bg-accent-soft text-accent"
                      : "bg-fill text-danger"
                  }`}
                >
                  {grant.amount > 0 ? `+${grant.amount}` : grant.amount}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm text-pretty text-ink">
                    {grant.reason}
                  </span>
                  <span className="caption block truncate">
                    {shortDate(grant.createdAt)}
                    {grant.grantedByName ? ` · ${grant.grantedByName}` : ""} ·
                    left them {grant.balanceAfter}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </Dialog>
  );
}
