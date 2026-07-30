"use client";

import { ArrowRight, PenLine, SkipForward } from "lucide-react";
import { MessageButton } from "./MessageButton";
import { ApprovalChoices, OutreachChoices, StatusTag } from "./StatusControls";
import {
  displayPhone,
  isDue,
  outreachMessage,
  shortDate,
  type ApprovalStatus,
  type OutreachStatus,
} from "../../../lib/outreach";
import { tradeName } from "../../../lib/artisans";
import type { OutreachLead } from "../../../lib/api/types";

/**
 * The campaign, one artisan at a time.
 *
 * The table below is for finding somebody; this is for working through the
 * list, and it is the difference between a dashboard and a CRM. It answers the
 * only question that matters on a Tuesday afternoon — who is next — and puts
 * the message that will be sent, the button that opens it, and the four
 * answers you might come back with in a single frame, so a whole conversation
 * costs one glance and two taps.
 *
 * The message is shown in full rather than summarised. It is going out under
 * the founder's name to someone they met in person, and a preview you have to
 * open WhatsApp to read is a preview that never gets read.
 */
export function NextUp({
  lead,
  position,
  total,
  busy,
  onMessaged,
  onOutreach,
  onApproval,
  onEdit,
  onSkip,
}: {
  lead?: OutreachLead;
  /** 1-based place in the queue, for the counter. */
  position: number;
  total: number;
  busy: boolean;
  onMessaged: (lead: OutreachLead) => void;
  onOutreach: (lead: OutreachLead, status: OutreachStatus) => void;
  onApproval: (lead: OutreachLead, status: ApprovalStatus) => void;
  onEdit: (lead: OutreachLead) => void;
  onSkip: () => void;
}) {
  if (!lead) {
    return (
      <section className="rounded-2xl border border-dashed border-line bg-card/60 p-8 text-center">
        <p className="headline text-ink">Everyone has been reached</p>
        <p className="caption mx-auto mt-1 max-w-sm">
          Nobody is waiting on a first message and no follow-up is due today.
          Import more of the list, or mark a follow-up date on anyone still
          thinking about it.
        </p>
      </section>
    );
  }

  const messaged = Boolean(lead.lastContactedAt);

  return (
    <section className="overflow-hidden rounded-2xl bg-card">
      <div className="flex items-center gap-2 border-b border-line px-5 py-3">
        <h2 className="headline text-ink">Next up</h2>
        {isDue(lead) ? <StatusTag label="Follow-up due" tone="accent" /> : null}
        <p className="caption figure ml-auto">
          {position} of {total}
        </p>
      </div>

      <div className="grid gap-5 p-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
        {/* ── Who, and what goes out ─────────────────────────────────── */}
        <div className="min-w-0">
          <p className="title-lg truncate text-ink">{lead.name}</p>
          <p className="caption mt-1">
            {tradeName(lead)} ·{" "}
            <span className="figure text-ink">{displayPhone(lead.phone)}</span>
          </p>
          <p className="caption mt-0.5">
            {messaged
              ? `Messaged ${shortDate(lead.lastContactedAt).toLowerCase()}`
              : "Never messaged"}
          </p>

          {lead.notes ? (
            <p className="mt-3 rounded-2xl bg-fill px-4 py-3 text-[0.9375rem] text-sub">
              {lead.notes}
            </p>
          ) : null}

          <p className="caption mt-4 font-semibold uppercase tracking-wider text-faint">
            What they&apos;ll receive
          </p>
          <p className="mt-2 max-h-56 overflow-y-auto whitespace-pre-line rounded-2xl bg-fill px-4 py-3 text-[0.9375rem] leading-relaxed text-sub">
            {outreachMessage(lead.name)}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <MessageButton
              lead={lead}
              onOpen={() => onMessaged(lead)}
              size="large"
            />
            <button
              type="button"
              onClick={() => onEdit(lead)}
              className="pressable inline-flex items-center gap-1.5 rounded-full bg-fill px-4 py-3 text-sm font-semibold text-ink"
            >
              <PenLine size={15} strokeWidth={2.2} />
              Edit details
            </button>
          </div>

          <p className="caption mt-2.5">
            WhatsApp opens with the message written in it. Read it over and send
            it yourself — Artiza never sends anything on your behalf.
          </p>
        </div>

        {/* ── What came back ─────────────────────────────────────────── */}
        <div className="min-w-0 rounded-2xl bg-fill p-4 lg:self-start">
          <p className="headline text-ink">
            {messaged ? "How did it go?" : "When you get back"}
          </p>
          <p className="caption mt-1">
            {messaged
              ? "Mark where the conversation got to, then move on."
              : "Send the message first — this is what you mark on your return."}
          </p>

          <div className="mt-4 space-y-4">
            <OutreachChoices
              value={lead.outreachStatus}
              disabled={busy}
              onChange={(next) => onOutreach(lead, next)}
            />
            <ApprovalChoices
              value={lead.approvalStatus}
              disabled={busy}
              onChange={(next) => onApproval(lead, next)}
            />
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onSkip}
              disabled={busy || total < 2}
              className="pressable inline-flex items-center gap-1.5 rounded-full bg-card px-4 py-2 text-sm font-semibold text-ink disabled:opacity-50"
            >
              {messaged ? (
                <>
                  Next artisan
                  <ArrowRight size={14} strokeWidth={2.4} />
                </>
              ) : (
                <>
                  <SkipForward size={14} strokeWidth={2.4} />
                  Skip for now
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
