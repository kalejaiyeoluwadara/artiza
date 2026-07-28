"use client";

import { AlertTriangle } from "lucide-react";
import { WhatsAppIcon } from "../../BrandIcons";
import { whatsappLink } from "../../../lib/outreach";
import type { OutreachLead } from "../../../lib/api/types";

/**
 * The one control this whole dashboard exists for.
 *
 * It is an ordinary link. Tapping it opens WhatsApp on a chat with that number
 * and the invitation already in the compose box — nothing is sent, and nothing
 * can be: the draft sits there until a person reads it and presses send
 * themselves. `wa.me` is also why the number never has to be saved to the phone
 * as a contact first, which is the thing that made messaging forty artisans a
 * day's work instead of an afternoon's.
 *
 * `onOpen` fires alongside the navigation, not instead of it. What it records
 * is honest about what happened: the message was *opened* for this person.
 * Whether they answered is the separate thing marked on the way back.
 */
export function MessageButton({
  lead,
  onOpen,
  size = "small",
}: {
  lead: OutreachLead;
  onOpen: () => void;
  size?: "small" | "large";
}) {
  const href = whatsappLink(lead);

  // A number that never normalised would open WhatsApp on an error screen,
  // which reads as the app being broken rather than the row being wrong. Say
  // which it is, and leave the fix one tap away in the row's editor.
  if (!href) {
    return (
      <span
        className={`inline-flex shrink-0 items-center gap-1.5 rounded-full bg-danger/15 font-semibold text-danger ${
          size === "large" ? "px-5 py-3 text-base" : "px-3 py-1.5 text-sm"
        }`}
      >
        <AlertTriangle size={size === "large" ? 17 : 14} strokeWidth={2.2} />
        Fix the number
      </span>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onOpen}
      className={`pressable inline-flex shrink-0 items-center gap-2 rounded-full bg-accent font-semibold text-white ${
        size === "large" ? "px-5 py-3 text-base" : "px-3 py-1.5 text-sm"
      }`}
    >
      <WhatsAppIcon size={size === "large" ? 19 : 15} />
      {size === "large" ? "Message on WhatsApp" : "Message"}
    </a>
  );
}
