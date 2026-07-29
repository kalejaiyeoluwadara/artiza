"use client";

import { useId, useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { Sheet } from "../../Sheet";
import { TextArea, TextField } from "../Fields";
import { TradeField } from "../../TradeField";
import { ListButton } from "./ListButton";
import { MessageButton } from "./MessageButton";
import { ApprovalChoices, OutreachChoices } from "./StatusControls";
import { useApi } from "../../../lib/api/useApi";
import { ApiError } from "../../../lib/api/error";
import { toast } from "../../../lib/toast";
import { confirm } from "../../../lib/confirm";
import {
  displayPhone,
  normalizePhone,
  greetingName,
  shortDate,
  toDateInput,
  type ApprovalStatus,
  type OutreachStatus,
} from "../../../lib/outreach";
import { tradeName, type Trade } from "../../../lib/artisans";
import type { OutreachLead } from "../../../lib/api/types";

interface Draft {
  name: string;
  phone: string;
  trade: Trade;
  customTrade: string;
  outreachStatus: OutreachStatus;
  approvalStatus: ApprovalStatus;
  notes: string;
  followUpAt: string;
}

function toDraft(lead: OutreachLead): Draft {
  return {
    name: lead.name,
    phone: lead.phone,
    trade: lead.trade,
    customTrade: lead.customTrade ?? "",
    outreachStatus: lead.outreachStatus,
    approvalStatus: lead.approvalStatus,
    notes: lead.notes,
    followUpAt: toDateInput(lead.followUpAt),
  };
}

/**
 * One lead, opened.
 *
 * This is where a conversation is recorded and where a wrong row is corrected,
 * and it is deliberately the same surface for both — coming back from WhatsApp
 * with "that's not his name, and he said call back Tuesday" is one visit here,
 * not two screens. Everything edits a draft and saves together, so a half-typed
 * note can't be written by a status button pressed next to it.
 */
export function LeadSheet({
  lead,
  onClose,
  onSaved,
  onRemoved,
  onMessaged,
}: {
  /** The open lead, or undefined when the sheet is closed. */
  lead?: OutreachLead;
  onClose: () => void;
  onSaved: (lead: OutreachLead) => void;
  onRemoved: (id: string) => void;
  onMessaged: (lead: OutreachLead) => void;
}) {
  const { api } = useApi();
  const dateId = useId();

  const [draft, setDraft] = useState<Draft | undefined>(() =>
    lead ? toDraft(lead) : undefined,
  );
  const [saving, setSaving] = useState(false);

  // Re-seed when a *different* row is opened, during render rather than in an
  // effect so no pass ever paints the previous artisan's details. Keyed on the
  // id and not the object: the row is replaced whenever anything is saved
  // against it, and re-seeding on that would throw away a note being typed.
  const [seenId, setSeenId] = useState(lead?.id);
  if (lead?.id !== seenId) {
    setSeenId(lead?.id);
    setDraft(lead ? toDraft(lead) : undefined);
  }

  // Nothing is open, so there is nothing to render. The sheet mounts with the
  // row rather than sitting in the tree waiting — one lead's draft at a time.
  if (!lead || !draft) return null;

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((current) => (current ? { ...current, [key]: value } : current));

  const normalized = normalizePhone(draft.phone);
  const followUpMissing =
    draft.outreachStatus === "follow_up" && !draft.followUpAt;

  async function save() {
    if (!draft || followUpMissing) return;

    setSaving(true);
    try {
      const saved = await api.admin.outreach.update(lead!.id, {
        name: draft.name.trim(),
        phone: draft.phone.trim(),
        trade: draft.trade,
        customTrade:
          draft.trade === "other" ? draft.customTrade.trim() : undefined,
        outreachStatus: draft.outreachStatus,
        approvalStatus: draft.approvalStatus,
        notes: draft.notes.trim(),
        // Null clears it; the API refuses a follow-up with no date, which is
        // why the button above is disabled rather than this being negotiable.
        followUpAt: draft.followUpAt
          ? new Date(`${draft.followUpAt}T09:00:00`).toISOString()
          : null,
      });

      onSaved(saved);
      toast.success(`${saved.name} saved`);
      onClose();
    } catch (cause) {
      toast.error("Couldn't save that", {
        description:
          cause instanceof ApiError ? cause.message : "Try again in a moment.",
      });
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    const ok = await confirm({
      title: `Remove ${lead!.name} from the list?`,
      body: "The lead and everything recorded about the conversation go for good. Nothing else in Artiza points at it.",
      confirmLabel: "Remove",
      cancelLabel: "Keep it",
      tone: "danger",
    });
    if (!ok) return;

    setSaving(true);
    try {
      await api.admin.outreach.remove(lead!.id);
      onRemoved(lead!.id);
      toast.success("Removed from the list");
      onClose();
    } catch (cause) {
      toast.error("Couldn't remove it", {
        description:
          cause instanceof ApiError ? cause.message : "Try again in a moment.",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Sheet open onClose={onClose} label={lead.name}>
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-5">
          <header className="flex flex-wrap items-start justify-between gap-3 pt-1">
            <div className="min-w-0">
              <h2 className="title truncate text-ink">{lead.name}</h2>
              <p className="caption mt-0.5">
                {tradeName(lead)} ·{" "}
                <span className="figure">{displayPhone(lead.phone)}</span>
              </p>
              <p className="caption mt-0.5">
                {lead.lastContactedAt
                  ? `Last messaged ${shortDate(lead.lastContactedAt).toLowerCase()}`
                  : "Never messaged"}
              </p>
            </div>
            <MessageButton
              lead={lead}
              onOpen={() => {
                onMessaged(lead);
                // The parent's write lands on `lead`, which this draft is
                // deliberately not re-seeded from — so the choice below is
                // moved by hand to match what was just recorded.
                if (draft.outreachStatus === "not_contacted") {
                  set("outreachStatus", "contacted");
                }
              }}
            />
          </header>

          {/* The step after "yes", offered where the answer was just recorded.
              It reads the *saved* lead rather than the draft, because the link
              leaves this sheet: offering it for an approval that only exists in
              an unsaved draft would throw that approval away on the way out. */}
          {draft.approvalStatus === "approved" ? (
            <div className="mt-5 rounded-2xl bg-accent-soft p-4">
              <p className="headline text-ink">They said yes</p>
              <p className="caption mt-1">
                {lead.approvalStatus === "approved"
                  ? "Their name, number and trade carry over. You add where they work, their years and their photos."
                  : "Save the list first, then the listing form can be opened with their details already in it."}
              </p>
              {lead.approvalStatus === "approved" ? (
                <div className="mt-3">
                  <ListButton lead={lead} variant="full" />
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="mt-5 space-y-5">
            <div className="rounded-2xl bg-card p-4">
              <OutreachChoices
                value={draft.outreachStatus}
                disabled={saving}
                onChange={(next) => set("outreachStatus", next)}
              />
              <div className="mt-4">
                <ApprovalChoices
                  value={draft.approvalStatus}
                  disabled={saving}
                  onChange={(next) => set("approvalStatus", next)}
                />
              </div>

              <div className="mt-4">
                <label
                  htmlFor={dateId}
                  className="caption font-semibold uppercase tracking-wider text-faint"
                >
                  Come back to them
                </label>
                <input
                  id={dateId}
                  type="date"
                  value={draft.followUpAt}
                  disabled={saving}
                  onChange={(event) => set("followUpAt", event.target.value)}
                  className={`figure mt-2 w-full rounded-2xl bg-fill px-4 py-3 text-[1.0625rem] text-ink disabled:opacity-60 ${
                    followUpMissing ? "ring-1 ring-danger" : ""
                  }`}
                />
                <p
                  className={`caption mt-1.5 px-1 ${followUpMissing ? "text-danger" : ""}`}
                >
                  {followUpMissing
                    ? "Pick the day you want to come back to them — a follow-up with no date drops out of the queue."
                    : "The day they reappear at the top of the queue."}
                </p>
              </div>
            </div>

            <TextArea
              label="Notes"
              value={draft.notes}
              onChange={(v) => set("notes", v)}
              placeholder="What they said, who introduced you, where the shop is."
              maxLength={500}
              rows={3}
              optional
            />

            <div className="border-t border-line pt-5">
              <p className="caption px-1 font-semibold uppercase tracking-wider text-faint">
                Their details
              </p>

              <div className="mt-3 space-y-5">
                <TextField
                  label="Name"
                  value={draft.name}
                  onChange={(v) => set("name", v)}
                  maxLength={80}
                  hint={`The message will open "Hello ${greetingName(draft.name)}".`}
                />

                <TextField
                  label="Phone"
                  value={draft.phone}
                  onChange={(v) => set("phone", v)}
                  type="tel"
                  inputMode="tel"
                  hint={
                    normalized
                      ? `Saves as ${displayPhone(normalized)}.`
                      : "Not a Nigerian mobile yet, so WhatsApp stays off. 0803…, 803… and +234… all work."
                  }
                />

                <TradeField
                  trade={draft.trade}
                  customTrade={draft.customTrade}
                  onChange={({ trade, customTrade }) =>
                    setDraft((current) =>
                      current ? { ...current, trade, customTrade } : current,
                    )
                  }
                  disabled={saving}
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => void remove()}
              disabled={saving}
              className="pressable inline-flex items-center gap-1.5 rounded-full bg-fill px-4 py-2 text-sm font-semibold text-danger disabled:opacity-50"
            >
              <Trash2 size={14} strokeWidth={2.2} />
              Remove from the list
            </button>
          </div>
        </div>

        <div className="chrome flex shrink-0 items-center gap-3 border-t border-line px-5 py-3">
          <p className="caption min-w-0 flex-1 truncate">
            {followUpMissing ? "Needs a follow-up date" : "Saved to the list only"}
          </p>
          <button
            type="button"
            onClick={onClose}
            className="pressable rounded-full bg-fill px-4 py-2.5 text-sm font-semibold text-ink"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void save()}
            disabled={saving || followUpMissing}
            className="pressable inline-flex items-center gap-1.5 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : "Save"}
          </button>
        </div>
      </div>
    </Sheet>
  );
}
