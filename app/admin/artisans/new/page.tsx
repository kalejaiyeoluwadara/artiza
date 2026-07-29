"use client";

import { Suspense, useCallback, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronLeft, Loader2 } from "lucide-react";
import { AdminHeader, AdminPage } from "../../../../components/admin/AdminShell";
import { ArtisanForm } from "../../../../components/admin/ArtisanForm";
import { ErrorState } from "../../../../components/admin/States";
import { useAdminList } from "../../../../lib/admin/useAdminList";
import { blankDraft, draftFromLead } from "../../../../lib/admin/artisan-draft";
import type { Api } from "../../../../lib/api";
import type { OutreachLead } from "../../../../lib/api/types";

export default function NewArtisanPage() {
  return (
    // `useSearchParams` needs a boundary, and the fallback is the same frame
    // the seeded form waits behind — so arriving from outreach never flashes an
    // empty form that is about to be filled in.
    <Suspense fallback={<NewArtisanFrame>{null}</NewArtisanFrame>}>
      <NewArtisan />
    </Suspense>
  );
}

function NewArtisan() {
  const leadId = useSearchParams().get("lead");

  if (leadId) return <FromLead leadId={leadId} />;

  return (
    <NewArtisanFrame>
      <FreshForm />
    </NewArtisanFrame>
  );
}

function FreshForm() {
  // Seeded once. Rebuilding it every render would reset the two pre-filled
  // contact lines the moment anything else on the page changed.
  const [initial] = useState(blankDraft);
  return <ArtisanForm mode="create" initial={initial} />;
}

/**
 * The same form, opened from someone on the outreach list who said yes.
 *
 * The lead is read here rather than handed over in `sessionStorage` so the URL
 * is the whole of the state: a refresh mid-edit, or the link sent to whoever is
 * actually doing the listing, both land on the same seeded form. There is no
 * read-one route on the outreach list — it is the team's contact book and runs
 * to tens of rows, not thousands — so this reads the list and picks one out.
 */
function FromLead({ leadId }: { leadId: string }) {
  const load = useCallback(
    (client: Api, signal: AbortSignal) => client.admin.outreach.list(signal),
    [],
  );

  const { items, loading, error, message, retry } =
    useAdminList<OutreachLead>(load);

  const lead = items.find((row) => row.id === leadId);

  if (loading) {
    return (
      <NewArtisanFrame>
        <div className="flex items-center gap-2.5 rounded-2xl bg-card p-6">
          <Loader2 size={16} className="animate-spin text-sub" />
          <p className="caption">Reading their details from the outreach list…</p>
        </div>
      </NewArtisanFrame>
    );
  }

  if (error) {
    return (
      <NewArtisanFrame>
        <ErrorState
          title="Couldn't read the outreach list"
          message={message}
          onRetry={retry}
        />
      </NewArtisanFrame>
    );
  }

  // A lead that has since been removed. Better to say so than to silently open
  // a blank form — the whole reason for following this link was the prefill.
  if (!lead) {
    return (
      <NewArtisanFrame>
        <ErrorState
          title="That lead is no longer on the list"
          message="It may have been removed since the link was opened. You can still add the artisan by hand."
          onRetry={retry}
        />
        <div className="mt-3 text-center">
          <Link
            href="/admin/artisans/new"
            className="pressable inline-flex rounded-full bg-fill px-4 py-2 text-sm font-semibold text-ink"
          >
            Start a blank listing
          </Link>
        </div>
      </NewArtisanFrame>
    );
  }

  return (
    <NewArtisanFrame lead={lead}>
      <ArtisanForm
        // Remounts if the link is followed for a different lead, so the seeded
        // draft is rebuilt rather than left showing the previous artisan.
        key={lead.id}
        mode="create"
        initial={draftFromLead(lead)}
      />
    </NewArtisanFrame>
  );
}

/**
 * The page around the form. When it was opened from a lead it says so, and
 * carries the one thing the outreach list knows that the listing form has
 * nowhere to put: what the team wrote about them.
 */
function NewArtisanFrame({
  lead,
  children,
}: {
  lead?: OutreachLead;
  children: React.ReactNode;
}) {
  return (
    <AdminPage>
      <Link
        href={lead ? "/admin/outreach" : "/admin/artisans"}
        className="pressable caption -ml-1 mb-3 inline-flex items-center gap-0.5 font-semibold text-sub"
      >
        <ChevronLeft size={14} strokeWidth={2.4} />
        {lead ? "Outreach" : "Register"}
      </Link>

      <AdminHeader
        title={lead ? `List ${lead.name}` : "Add an artisan"}
        lede={
          lead
            ? "Their name, number and trade came from the outreach list. Everything else is still to fill in."
            : "Everything here except the contact block is public the moment you save."
        }
      />

      {lead?.notes ? (
        <div className="mt-5 rounded-2xl border border-dashed border-line p-4">
          <p className="caption font-semibold uppercase tracking-wider text-ink">
            Your outreach notes
          </p>
          {/* Shown, never copied into the listing: these are the team's own
              shorthand, and `note` is printed on the artisan's public card. */}
          <p className="caption mt-1.5 whitespace-pre-line">{lead.notes}</p>
        </div>
      ) : null}

      <div className="mt-6">{children}</div>
    </AdminPage>
  );
}
