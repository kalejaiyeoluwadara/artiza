"use client";

import { useState } from "react";
import { Hexagon, Phone } from "lucide-react";
import { UNLOCK_PRICE, phoneGroups } from "../lib/artisans";

/**
 * The signature element. The number is shown as withheld, not hidden —
 * redacted rather than blurred, so the shape of what you're buying is
 * honest and it never reads as a rendering bug on a slow connection.
 *
 * Rare interaction (once per artisan, ever), so it earns real motion.
 * It is the only orchestrated animation in the product.
 */
export function SealedContact({
  phone,
  name,
  compact = false,
}: {
  phone: string;
  name: string;
  compact?: boolean;
}) {
  const [unlocked, setUnlocked] = useState(false);
  const groups = phoneGroups(phone);

  return (
    <div className="rounded-sm border border-line bg-ink/60 p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="type-label">Contact</span>
        <span
          className={`type-label flex items-center gap-1 ${
            unlocked ? "text-brass" : "text-brass-dim"
          }`}
          style={{ transition: "color 200ms var(--ease-out)" }}
        >
          <Hexagon
            size={11}
            strokeWidth={2.5}
            fill={unlocked ? "currentColor" : "none"}
          />
          {unlocked ? "Open" : "Sealed"}
        </span>
      </div>

      <p
        className={`type-figure mt-2 flex flex-wrap items-baseline gap-x-2 text-bone ${
          compact ? "text-h3" : "text-h3 sm:text-h2"
        }`}
        aria-label={
          unlocked
            ? `${name}'s phone number: ${groups.join(" ")}`
            : "Phone number sealed until unlocked"
        }
      >
        {groups.map((group, i) => (
          <Digits key={i} group={group} masked={i > 0 && !unlocked} index={i} />
        ))}
      </p>

      <div className="mt-3 flex items-center justify-between gap-3 border-t border-line pt-3">
        {unlocked ? (
          <a
            href={`https://wa.me/${phone}`}
            target="_blank"
            rel="noreferrer"
            className="pressable inline-flex w-full items-center justify-center gap-2 rounded-sm bg-brass px-4 py-2.5 text-sm font-semibold text-ink hover-lift"
          >
            <Phone size={14} strokeWidth={2.5} />
            Message on WhatsApp
          </a>
        ) : (
          <>
            <span className="text-sm text-smoke">
              <span className="type-figure text-bone">₦{UNLOCK_PRICE}</span> to
              unlock
            </span>
            <button
              type="button"
              onClick={() => setUnlocked(true)}
              className="pressable rounded-sm bg-brass px-4 py-2.5 text-sm font-semibold text-ink hover-lift"
            >
              Unlock contact
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/**
 * Masked digits render as brass dots at the same tabular width, so the
 * number never reflows when it resolves. Groups resolve left to right.
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
    <span className="relative inline-block">
      {/* Reserves the final width up front — nothing shifts on reveal. */}
      <span aria-hidden className="invisible">
        {group}
      </span>

      <span
        className="absolute inset-0 text-brass-dim"
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
