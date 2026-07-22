"use client";

import { Lock, PhoneCall } from "lucide-react";
import {
  Artisan,
  SealedDetails,
  UNLOCK_PRICE,
  channelsFor,
  formatPhone,
  phoneE164,
  phoneGroups,
} from "../lib/artisans";
import { WhatsAppIcon } from "./BrandIcons";
import { CopyButton } from "./ContactPanel";

/**
 * Group widths for the mask, when there is no number to measure yet. Every
 * Nigerian mobile number has this shape, so the redaction is the right size
 * before the real digits ever reach the browser.
 */
const MASK_GROUPS = ["+234", "000", "000", "0000"];

/**
 * The signature moment. The number is withheld, not hidden — masked digits at
 * full tabular width, so what you're paying for has an honest shape and
 * nothing reflows on reveal.
 *
 * The digits genuinely are not here until they're paid for: `details` arrives
 * from a separate, guarded endpoint. Which means the reveal animation plays at
 * exactly the moment the data lands, and the locked state has nothing in the
 * page source to read.
 */
export function SealedContact({
  artisan,
  unlocked,
  details,
  loadingDetails = false,
  onUnlock,
}: {
  artisan: Artisan;
  unlocked: boolean;
  details?: SealedDetails | null;
  loadingDetails?: boolean;
  onUnlock: () => void;
}) {
  const { name } = artisan;

  // Masked until the real digits are in hand — so the moment between "paid"
  // and "loaded" still reads as sealed rather than flashing placeholder zeros.
  const groups = details ? phoneGroups(details.phone) : MASK_GROUPS;
  const revealed = Boolean(details);

  const channels = details ? channelsFor(artisan, details) : [];
  const whatsapp = channels.find((channel) => channel.kind === "whatsapp");

  return (
    <div className="rounded-2xl bg-fill p-3">
      <div className="flex items-center justify-between gap-2">
        <p
          className="figure text-[1.0625rem] text-ink"
          aria-label={
            revealed
              ? `${name}'s phone number: ${groups.join(" ")}`
              : "Phone number locked until unlocked"
          }
        >
          {groups.map((group, i) => (
            <Digits key={i} group={group} masked={i > 0 && !revealed} index={i} />
          ))}
        </p>

        {revealed && details ? (
          <CopyButton value={phoneE164(details.phone)} label="phone number" />
        ) : (
          <span className="flex shrink-0 items-center gap-1 text-xs font-medium text-sub">
            <Lock size={12} strokeWidth={2.2} />
            {unlocked && loadingDetails ? "Opening" : "Locked"}
          </span>
        )}
      </div>

      {revealed && details ? (
        <div className="mt-3 flex gap-2">
          {whatsapp && (
            <a
              href={whatsapp.href}
              target="_blank"
              rel="noreferrer"
              className="pressable hover-dim flex flex-1 items-center justify-center gap-2 rounded-full bg-accent py-3 text-[0.9375rem] font-semibold text-white"
            >
              <WhatsAppIcon size={17} />
              WhatsApp
            </a>
          )}
          <a
            href={`tel:${phoneE164(details.phone)}`}
            aria-label={`Call ${name} on ${formatPhone(details.phone)}`}
            className="pressable hover-dim flex flex-1 items-center justify-center gap-2 rounded-full bg-card py-3 text-[0.9375rem] font-semibold text-ink"
          >
            <PhoneCall size={16} strokeWidth={2.2} />
            Call
          </a>
        </div>
      ) : unlocked ? (
        // Paid for, details still in flight. The button is replaced rather
        // than disabled, so nothing invites a second tap on a paid action.
        <p className="caption mt-3 py-3 text-center">Opening the contact…</p>
      ) : (
        <>
          <button
            type="button"
            onClick={onUnlock}
            className="pressable hover-dim mt-3 flex w-full items-center justify-center rounded-full bg-accent py-3 text-[0.9375rem] font-semibold text-white"
          >
            Unlock contact · ₦{UNLOCK_PRICE}
          </button>
          <p className="caption mt-2 text-center">
            WhatsApp, Call, Text and more · paid once, kept forever
          </p>
        </>
      )}
    </div>
  );
}

/**
 * Masked digits render as dots at the same tabular width. On unlock, groups
 * resolve left to right with a touch of blur burning off, so the crossfade
 * reads as one number resolving rather than two overlapping.
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
          transition: `opacity 140ms var(--ease-out) ${masked ? 0 : index * 90}ms`,
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
