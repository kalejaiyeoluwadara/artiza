"use client";

import { useCallback, useMemo, useState } from "react";
import { PenLine, Search, Upload, X } from "lucide-react";
import { AdminHeader, AdminPage } from "../../../components/admin/AdminShell";
import {
  EmptyState,
  ErrorState,
  RowsSkeleton,
} from "../../../components/admin/States";
import { Skeleton } from "../../../components/Skeleton";
import { ImportSheet } from "../../../components/admin/outreach/ImportSheet";
import { LeadSheet } from "../../../components/admin/outreach/LeadSheet";
import { ListButton } from "../../../components/admin/outreach/ListButton";
import { MessageButton } from "../../../components/admin/outreach/MessageButton";
import { NextUp } from "../../../components/admin/outreach/NextUp";
import {
  ApprovalTag,
  OutreachTag,
} from "../../../components/admin/outreach/StatusControls";
import { useAdminList } from "../../../lib/admin/useAdminList";
import { useApi } from "../../../lib/api/useApi";
import { ApiError } from "../../../lib/api/error";
import { toast } from "../../../lib/toast";
import {
  APPROVAL_LABELS,
  OUTREACH_LABELS,
  displayPhone,
  isDue,
  outreachQueue,
  shortDate,
  type ApprovalStatus,
  type OutreachStatus,
} from "../../../lib/outreach";
import { TRADE_LABELS, tradeName, type Trade } from "../../../lib/artisans";
import type { Api } from "../../../lib/api";
import type { OutreachLead } from "../../../lib/api/types";

type OutreachFilter = OutreachStatus | "all";
type ApprovalFilter = ApprovalStatus | "all";
type TradeFilter = Trade | "all";

/**
 * Founding Artisan Outreach.
 *
 * Artiza launches into a town, not a market — the register has to have real
 * artisans in it before a single customer arrives, and those artisans are met
 * in person and written into a spreadsheet. This screen is the whole distance
 * between that spreadsheet and a conversation: import the list, work down it,
 * and record what each person said.
 *
 * The one thing it deliberately does not do is send anything. Every message
 * goes out through a `wa.me` link that opens WhatsApp with the invitation
 * already typed, and a person reads it and presses send. That is not a
 * limitation worked around — bulk messaging strangers from an automated
 * account is how a number gets banned, and the artisans on this list were all
 * met face to face, so the message should come from a person too.
 */
export default function OutreachPage() {
  const { api } = useApi();

  const load = useCallback(
    (client: Api, signal: AbortSignal) => client.admin.outreach.list(signal),
    [],
  );

  const { items, loading, error, message, retry, patch } =
    useAdminList<OutreachLead>(load);

  const [search, setSearch] = useState("");
  const [trade, setTrade] = useState<TradeFilter>("all");
  const [outreach, setOutreach] = useState<OutreachFilter>("all");
  const [approval, setApproval] = useState<ApprovalFilter>("all");

  const [importing, setImporting] = useState(false);
  const [openId, setOpenId] = useState<string>();
  const [heldId, setHeldId] = useState<string>();
  const [busyId, setBusyId] = useState<string>();

  /** Writes a saved row back into the local copy — no refetch, no skeletons. */
  const replace = useCallback(
    (lead: OutreachLead) =>
      patch((current) =>
        current.map((row) => (row.id === lead.id ? lead : row)),
      ),
    [patch],
  );

  // ── The queue ──────────────────────────────────────────────────────────────

  const queue = useMemo(() => outreachQueue(items), [items]);

  /**
   * Whoever the panel is showing: the lead it was pinned to, or the front of
   * the queue when it is pinned to nobody.
   *
   * The pin is what makes the loop work. Acting on the current lead — opening
   * the message, marking an answer — takes them out of the queue, and without
   * being held the panel would jump to the next artisan the instant WhatsApp
   * opened, leaving the answer they gave nowhere to go. So the panel holds
   * whoever is being worked on until it is told to move on, and the queue is
   * only consulted for who that should be next.
   */
  const current = items.find((lead) => lead.id === heldId) ?? queue[0];

  const position = current ? Math.max(queue.indexOf(current), 0) + 1 : 1;
  const total = queue.length + (current && !queue.includes(current) ? 1 : 0);

  function advance() {
    setHeldId(queue.find((lead) => lead.id !== current?.id)?.id);
  }

  // ── Writes ─────────────────────────────────────────────────────────────────

  /**
   * Records that the message was opened. Fires alongside the link, never
   * instead of it — WhatsApp is already on its way up when this runs, and a
   * failure here must not look like the message didn't happen.
   */
  async function markContacted(lead: OutreachLead) {
    try {
      replace(await api.admin.outreach.markContacted(lead.id));
    } catch {
      toast.error("Couldn't record that", {
        description: `WhatsApp still opened. Mark ${lead.name} contacted by hand.`,
      });
    }
  }

  async function setStatus(
    lead: OutreachLead,
    changes: { outreachStatus?: OutreachStatus; approvalStatus?: ApprovalStatus },
  ) {
    // A follow-up is only a follow-up with a date on it, and the date lives in
    // the row's editor — so that is where this hands off to rather than
    // inventing a second date picker in the queue panel.
    if (changes.outreachStatus === "follow_up" && !lead.followUpAt) {
      setOpenId(lead.id);
      toast.info("Pick the day to come back to them", {
        description: "A follow-up with no date drops out of the queue.",
      });
      return;
    }

    setBusyId(lead.id);
    try {
      replace(await api.admin.outreach.update(lead.id, changes));
    } catch (cause) {
      toast.error("Couldn't save that", {
        description:
          cause instanceof ApiError ? cause.message : "Try again in a moment.",
      });
    } finally {
      setBusyId(undefined);
    }
  }

  // ── The numbers ────────────────────────────────────────────────────────────

  const stats = useMemo(
    () => ({
      total: items.length,
      not_contacted: items.filter((l) => l.outreachStatus === "not_contacted")
        .length,
      contacted: items.filter((l) => l.outreachStatus === "contacted").length,
      responded: items.filter((l) => l.outreachStatus === "responded").length,
      follow_up: items.filter((l) => l.outreachStatus === "follow_up").length,
      approved: items.filter((l) => l.approvalStatus === "approved").length,
      declined: items.filter((l) => l.approvalStatus === "declined").length,
      due: items.filter(isDue).length,
    }),
    [items],
  );

  // ── The table ──────────────────────────────────────────────────────────────

  /** Only trades actually on the list — a filter for nobody is a dead option. */
  const trades = useMemo(() => {
    const present = new Set(items.map((lead) => lead.trade));
    return (Object.keys(TRADE_LABELS) as Trade[]).filter((t) => present.has(t));
  }, [items]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    // Typed as digits, matched against digits: nobody searches for a number
    // in the same spacing the list happens to be storing it in.
    const digits = query.replace(/\D/g, "");

    return items.filter((lead) => {
      if (trade !== "all" && lead.trade !== trade) return false;
      if (outreach !== "all" && lead.outreachStatus !== outreach) return false;
      if (approval !== "all" && lead.approvalStatus !== approval) return false;
      if (!query) return true;

      return (
        lead.name.toLowerCase().includes(query) ||
        tradeName(lead).toLowerCase().includes(query) ||
        (digits.length > 2 && lead.phone.includes(digits))
      );
    });
  }, [items, search, trade, outreach, approval]);

  const filtering =
    search !== "" || trade !== "all" || outreach !== "all" || approval !== "all";

  function clearFilters() {
    setSearch("");
    setTrade("all");
    setOutreach("all");
    setApproval("all");
  }

  /** A stat tile is a filter — the count you just read is the list you want. */
  function focus(next: {
    outreach?: OutreachFilter;
    approval?: ApprovalFilter;
  }) {
    setSearch("");
    setTrade("all");
    setOutreach(next.outreach ?? "all");
    setApproval(next.approval ?? "all");
  }

  if (error) {
    return (
      <AdminPage>
        <AdminHeader
          title="Outreach"
          lede="The founding artisans, and where each conversation got to."
        />
        <div className="mt-6">
          <ErrorState
            title="Couldn't load the outreach list"
            message={message}
            onRetry={retry}
          />
        </div>
      </AdminPage>
    );
  }

  return (
    <AdminPage>
      <AdminHeader
        title="Outreach"
        lede="The founding artisans, and where each conversation got to. Nothing here is sent automatically."
        action={
          <button
            type="button"
            onClick={() => setImporting(true)}
            className="pressable inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-2.5 text-sm font-semibold text-white"
          >
            <Upload size={16} strokeWidth={2.4} />
            Import CSV
          </button>
        }
      />

      {/* ── The numbers ──────────────────────────────────────────────── */}
      <div className="mt-6 grid grid-cols-2 gap-2.5 sm:grid-cols-4 lg:grid-cols-7">
        <Tile
          label="Founding artisans"
          value={stats.total}
          loading={loading}
          active={!filtering}
          onClick={clearFilters}
        />
        <Tile
          label={OUTREACH_LABELS.not_contacted}
          value={stats.not_contacted}
          loading={loading}
          tone="accent"
          active={outreach === "not_contacted"}
          onClick={() => focus({ outreach: "not_contacted" })}
        />
        <Tile
          label={OUTREACH_LABELS.contacted}
          value={stats.contacted}
          loading={loading}
          active={outreach === "contacted"}
          onClick={() => focus({ outreach: "contacted" })}
        />
        <Tile
          label={OUTREACH_LABELS.responded}
          value={stats.responded}
          loading={loading}
          active={outreach === "responded"}
          onClick={() => focus({ outreach: "responded" })}
        />
        <Tile
          label="Follow-up"
          value={stats.follow_up}
          note={stats.due > 0 ? `${stats.due} due` : undefined}
          loading={loading}
          tone={stats.due > 0 ? "accent" : "quiet"}
          active={outreach === "follow_up"}
          onClick={() => focus({ outreach: "follow_up" })}
        />
        <Tile
          label={APPROVAL_LABELS.approved}
          value={stats.approved}
          loading={loading}
          active={approval === "approved"}
          onClick={() => focus({ approval: "approved" })}
        />
        <Tile
          label={APPROVAL_LABELS.declined}
          value={stats.declined}
          loading={loading}
          tone="danger"
          active={approval === "declined"}
          onClick={() => focus({ approval: "declined" })}
        />
      </div>

      {/* ── The queue ────────────────────────────────────────────────── */}
      <div className="mt-6">
        {loading ? (
          <Skeleton className="h-64 w-full rounded-2xl" />
        ) : items.length === 0 ? null : (
          <NextUp
            lead={current}
            position={position}
            total={total}
            busy={busyId === current?.id}
            onMessaged={(lead) => {
              // Pinning here rather than inside the write: the same handlers
              // hang off every row in the table below, and marking somebody
              // there should not drag the queue panel onto them.
              setHeldId(lead.id);
              void markContacted(lead);
            }}
            onOutreach={(lead, status) => {
              setHeldId(lead.id);
              void setStatus(lead, { outreachStatus: status });
            }}
            onApproval={(lead, status) => {
              setHeldId(lead.id);
              void setStatus(lead, { approvalStatus: status });
            }}
            onEdit={(lead) => setOpenId(lead.id)}
            onSkip={advance}
          />
        )}
      </div>

      {/* ── The list ─────────────────────────────────────────────────── */}
      <section className="mt-8">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="title mr-auto text-ink">The list</h2>
          {!loading ? (
            <p className="caption">
              <span className="figure text-ink">{filtered.length}</span> of{" "}
              <span className="figure">{items.length}</span>
            </p>
          ) : null}
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <label className="flex min-w-56 flex-1 items-center gap-2 rounded-full bg-fill px-4 py-2.5">
            <Search size={16} strokeWidth={2.2} className="shrink-0 text-sub" />
            <span className="sr-only">Search by name, phone or trade</span>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Name, phone or trade"
              className="min-w-0 flex-1 bg-transparent text-[0.9375rem] text-ink placeholder:text-faint"
            />
          </label>

          <Filter
            label="Trade"
            value={trade}
            onChange={setTrade}
            options={[
              { value: "all", label: "Every trade" },
              ...trades.map((t) => ({ value: t, label: TRADE_LABELS[t] })),
            ]}
          />
          <Filter
            label="Outreach"
            value={outreach}
            onChange={setOutreach}
            options={[
              { value: "all", label: "Any outreach" },
              ...(Object.keys(OUTREACH_LABELS) as OutreachStatus[]).map((s) => ({
                value: s,
                label: OUTREACH_LABELS[s],
              })),
            ]}
          />
          <Filter
            label="Approval"
            value={approval}
            onChange={setApproval}
            options={[
              { value: "all", label: "Any answer" },
              ...(Object.keys(APPROVAL_LABELS) as ApprovalStatus[]).map((s) => ({
                value: s,
                label: APPROVAL_LABELS[s],
              })),
            ]}
          />

          {filtering ? (
            <button
              type="button"
              onClick={clearFilters}
              className="pressable inline-flex items-center gap-1.5 rounded-full bg-fill px-3.5 py-2.5 text-sm font-semibold text-sub"
            >
              <X size={14} strokeWidth={2.4} />
              Clear
            </button>
          ) : null}
        </div>

        <div className="mt-3">
          {loading ? (
            <RowsSkeleton />
          ) : items.length === 0 ? (
            <EmptyState
              title="No founding artisans yet"
              body="Import the CSV of artisans the team has met. Name and phone are the only two columns it needs."
              action={
                <button
                  type="button"
                  onClick={() => setImporting(true)}
                  className="pressable inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-2.5 text-sm font-semibold text-white"
                >
                  <Upload size={16} strokeWidth={2.4} />
                  Import CSV
                </button>
              }
            />
          ) : filtered.length === 0 ? (
            <EmptyState
              title="Nobody matches that"
              body="Widen the filters, or clear them to see the whole list again."
              action={
                <button
                  type="button"
                  onClick={clearFilters}
                  className="pressable rounded-full bg-fill px-4 py-2.5 text-sm font-semibold text-ink"
                >
                  Clear filters
                </button>
              }
            />
          ) : (
            <ul className="overflow-hidden rounded-2xl bg-card">
              {filtered.map((lead) => (
                <li
                  key={lead.id}
                  className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-line px-4 py-3.5 last:border-b-0 sm:px-5"
                >
                  <div className="min-w-40 flex-1">
                    <p className="headline truncate text-ink">{lead.name}</p>
                    <p className="caption truncate">
                      {tradeName(lead)} ·{" "}
                      <span className="figure">{displayPhone(lead.phone)}</span>
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-1.5">
                    <OutreachTag status={lead.outreachStatus} />
                    <ApprovalTag status={lead.approvalStatus} />
                  </div>

                  <p className="caption hidden w-24 shrink-0 text-right lg:block">
                    {lead.outreachStatus === "follow_up" && lead.followUpAt
                      ? `Due ${shortDate(lead.followUpAt)}`
                      : shortDate(lead.lastContactedAt)}
                  </p>

                  <div className="flex shrink-0 items-center gap-1.5">
                    <MessageButton
                      lead={lead}
                      onOpen={() => void markContacted(lead)}
                    />
                    <ListButton lead={lead} />
                    <button
                      type="button"
                      onClick={() => setOpenId(lead.id)}
                      aria-label={`Edit ${lead.name}`}
                      className="pressable hover-fill grid size-9 place-items-center rounded-full bg-fill text-sub"
                    >
                      <PenLine size={15} strokeWidth={2.2} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <ImportSheet
        open={importing}
        onClose={() => setImporting(false)}
        onImported={(leads) => patch(leads)}
      />

      <LeadSheet
        lead={items.find((lead) => lead.id === openId)}
        onClose={() => setOpenId(undefined)}
        onSaved={replace}
        onRemoved={(id) =>
          patch((current) => current.filter((lead) => lead.id !== id))
        }
        onMessaged={(lead) => void markContacted(lead)}
      />
    </AdminPage>
  );
}

/**
 * One number and the slice of the list it counts — and a button, because the
 * next thing anyone does after reading "6 follow-up required" is go and look
 * at those six.
 */
function Tile({
  label,
  value,
  note,
  loading,
  tone = "quiet",
  active,
  onClick,
}: {
  label: string;
  value: number;
  note?: string;
  loading: boolean;
  tone?: "quiet" | "accent" | "danger";
  active: boolean;
  onClick: () => void;
}) {
  const colour =
    value === 0
      ? "text-faint"
      : tone === "accent"
        ? "text-accent"
        : tone === "danger"
          ? "text-danger"
          : "text-ink";

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`pressable rounded-2xl bg-card p-3.5 text-left transition-colors duration-200 ease-out ${
        active ? "ring-1 ring-ink" : ""
      }`}
    >
      <p className="caption truncate font-semibold uppercase tracking-wider">
        {label}
      </p>
      {loading ? (
        <Skeleton className="mt-2 h-7 w-10 rounded-lg" />
      ) : (
        <p className={`figure mt-1 text-2xl ${colour}`}>{value}</p>
      )}
      <p className="caption mt-0.5 truncate">{note ?? " "}</p>
    </button>
  );
}

/** A filter that names itself when it is doing something. */
function Filter<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: T;
  onChange: (next: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <label
      className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2.5 text-sm font-semibold ${
        value === "all" ? "bg-fill text-sub" : "bg-ink text-canvas"
      }`}
    >
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as T)}
        // The dropdown itself is the OS's, and it paints on its own surface —
        // without this the options inherit the pill's inverted colours and
        // render white on white the moment a filter is active.
        className="bg-transparent font-semibold outline-none [&>option]:bg-card [&>option]:text-ink"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
