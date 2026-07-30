"use client";

import Link from "next/link";
import { UserPlus } from "lucide-react";
import type { OutreachLead } from "../../../lib/api/types";

/**
 * The third row action, after Message and Edit: open the listing form with
 * whatever this lead already tells us filled in.
 *
 * It is a link, not a button that saves something, and that distinction is the
 * whole design. A lead holds three of the fifteen things a listing needs — no
 * location, no years, no photos — so a one-tap "add to the register" would
 * publish a profile with nothing on it worth reading. This carries the three
 * certain answers over and leaves the editor in front of the rest.
 *
 * On every lead, not only approved ones. The register is public, so what a
 * lead has agreed to matters — but that is a question about pressing Save on
 * the listing form, not about opening it. Half of listing an artisan is
 * gathering the details, and that work starts before the yes.
 */
export function ListButton({ lead }: { lead: OutreachLead }) {
  return (
    <Link
      href={`/admin/artisans/new?lead=${encodeURIComponent(lead.id)}`}
      aria-label={`List ${lead.name} on Artiza`}
      title={`List ${lead.name} on Artiza`}
      className="pressable hover-fill grid size-9 place-items-center rounded-full bg-fill text-sub"
    >
      <UserPlus size={15} strokeWidth={2.2} />
    </Link>
  );
}
