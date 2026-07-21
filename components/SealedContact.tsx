"use client";

import { Lock, MessageCircle } from "lucide-react";
import { UNLOCK_PRICE, phoneGroups } from "../lib/artisans";

/**
 * The signature moment. The number is withheld, not hidden — masked
 * digits at full tabular width, so what you're paying for has an honest
 * shape and nothing reflows on reveal.
 *
 * Unlocking happens once per artisan, ever, so it keeps the app's only
 * orchestrated animation: groups resolve left to right.
 */
export function SealedContact({
  phone,
  name,
  unlocked,
  onUnlock,
}: {
  phone: string;
  name: string;
  unlocked: boolean;
  onUnlock: () => void;
}) {
  const groups = phoneGroups(phone);

  return (
    <div className="rounded-2xl bg-fill p-3">
      <div className="flex items-center justify-between gap-3">
        <p
          className="figure text-[1.0625rem] text-ink"
          aria-label={
            unlocked
              ? `${name}'s phone number: ${groups.join(" ")}`
              : "Phone number locked until unlocked"
          }
        >
          {groups.map((group, i) => (
            <Digits
              key={i}
              group={group}
              masked={i > 0 && !unlocked}
              index={i}
            />
          ))}
        </p>

        {!unlocked && (
          <span className="flex shrink-0 items-center gap-1 text-xs font-medium text-sub">
            <Lock size={12} strokeWidth={2.2} />
            Locked
          </span>
        )}
      </div>

      <div className="mt-3">
        {unlocked ? (
          <a
            href={`https://wa.me/${phone}`}
            target="_blank"
            rel="noreferrer"
            className="pressable hover-dim flex w-full items-center justify-center gap-2 rounded-full bg-accent py-3 text-[0.9375rem] font-semibold text-white"
          >
            <MessageCircle size={16} strokeWidth={2.2} />
            Message on WhatsApp
          </a>
        ) : (
          <button
            type="button"
            onClick={onUnlock}
            className="pressable hover-dim flex w-full items-center justify-center rounded-full bg-accent py-3 text-[0.9375rem] font-semibold text-white"
          >
            Unlock contact · ₦{UNLOCK_PRICE}
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Masked digits render as dots at the same tabular width. On unlock,
 * groups resolve left to right with a touch of blur burning off, so the
 * crossfade reads as one number resolving rather than two overlapping.
 */
function Digits({
  group,
  masked,
  index,
}: {
  group: string;
  masked: boolean;
  index: number;
}) {
  return (
    <span className="relative mr-1.5 inline-block last:mr-0">
      {/* Reserves final width — nothing shifts when digits resolve. */}
      <span aria-hidden className="invisible">
        {group}
      </span>

      <span
        aria-hidden
        className="absolute inset-0 text-faint"
        style={{
          opacity: masked ? 1 : 0,
          transition: `opacity 140ms var(--ease-out) ${
            masked ? 0 : index * 90
          }ms`,
        }}
      >
        {"•".repeat(group.length)}
      </span>

      <span
        className="absolute inset-0"
        style={{
          opacity: masked ? 0 : 1,
          filter: masked ? "blur(3px)" : "blur(0px)",
          transition: `opacity 220ms var(--ease-out) ${
            masked ? 0 : index * 90
          }ms, filter 220ms var(--ease-out) ${masked ? 0 : index * 90}ms`,
        }}
      >
        {group}
      </span>
    </span>
  );
}
