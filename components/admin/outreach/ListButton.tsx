"use client";

import Link from "next/link";
import { UserPlus } from "lucide-react";
import type { OutreachLead } from "../../../lib/api/types";

/**
 * The step after "yes": open the listing form with this lead already in it.
 *
 * It is a link, not a button that saves something, and that distinction is the
 * whole design. An outreach lead holds three of the fifteen things a listing
 * needs — no location, no years, no photos — so a one-tap "add to the register"
 * would publish a profile with nothing on it worth reading, which is worse for
 * the artisan than not being listed. This carries the three certain answers
 * over and leaves the editor in front of the rest.
 *
 * Shown only for an approved lead. Someone who hasn't answered yet has not
 * agreed to be on Artiza, and the register is public.
 */
export function ListButton({
  lead,
  variant = "icon",
}: {
  lead: OutreachLead;
  /** `icon` for the crowded table row, `full` where there is room to say it. */
  variant?: "icon" | "full";
}) {
  if (lead.approvalStatus !== "approved") return null;

  const href = `/admin/artisans/new?lead=${encodeURIComponent(lead.id)}`;

  if (variant === "icon") {
    return (
      <Link
        href={href}
        aria-label={`List ${lead.name} on Artiza`}
        title={`List ${lead.name} on Artiza`}
        className="pressable grid size-9 place-items-center rounded-full bg-accent-soft text-accent"
      >
        <UserPlus size={15} strokeWidth={2.2} />
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className="pressable inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-2.5 text-sm font-semibold text-white"
    >
      <UserPlus size={15} strokeWidth={2.2} />
      List on Artiza
    </Link>
  );
}
