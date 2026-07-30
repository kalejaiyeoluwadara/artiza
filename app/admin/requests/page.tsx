"use client";

import { useCallback, useMemo, useState } from "react";
import { PhoneCall, Search, Trash2 } from "lucide-react";
import { AdminHeader, AdminPage } from "../../../components/admin/AdminShell";
import {
  EmptyState,
  ErrorState,
  RowsSkeleton,
} from "../../../components/admin/States";
import { useAdminList } from "../../../lib/admin/useAdminList";
import { useApi } from "../../../lib/api/useApi";
import { ApiError } from "../../../lib/api/error";
import { toast } from "../../../lib/toast";
import { confirm } from "../../../lib/confirm";
import { formatPhone, phoneE164 } from "../../../lib/artisans";
import { shortDate } from "../../../lib/outreach";
import type {
  AdminArtisanRequest,
  ArtisanRequestStatus,
} from "../../../lib/api/types";

const STATUS_LABELS: Record<ArtisanRequestStatus, string> = {
  open: "Open",
  sourcing: "Sourcing",
  matched: "Matched",
  closed: "Closed",
};

const STATUSES = Object.keys(STATUS_LABELS) as ArtisanRequestStatus[];

/**
 * Which rows still need a person to do something today.
 *
 * The same reasoning as the outreach tags: accent is spent only on the states
 * that are a job, so a filtered list reads as a to-do rather than a wall of
 * colour. Closed is amber because with a red accent, a red "closed" tag beside
 * a red button reads as an action rather than an ending.
 */
const STATUS_TONE: Record<ArtisanRequestStatus, "accent" | "quiet" | "danger"> =
  {
    open: "accent",
    sourcing: "accent",
    matched: "quiet",
    closed: "danger",
  };

type Filter = ArtisanRequestStatus | "all";

const FILTERS: { value: Filter; label: string }[] = [
  { value: "open", label: "Open" },
  { value: "sourcing", label: "Sourcing" },
  { value: "matched", label: "Matched" },
  { value: "closed", label: "Closed" },
  { value: "all", label: "Everything" },
];

/**
 * Demand the register couldn't answer.
 *
 * The mirror of the outreach list, and read together they are the whole
 * strategy: outreach is who the team is chasing, this is who customers have
 * actually asked for. A trade that shows up here three times is a hiring brief
 * with evidence attached, which is worth more than a hunch about what Ilisan
 * needs.
 *
 * Every row is a person waiting on a call, so the row's loudest control is the
 * call itself — a `tel:` link, not a status dropdown. The status is what you
 * set *after* you have picked up the phone.
 */
export default function RequestsPage() {
  const { api } = useApi();
  const [filter, setFilter] = useState<Filter>("open");
  const [busyId, setBusyId] = useState<string>();

  const load = useCallback(
    (client: typeof api, signal: AbortSignal) =>
      client.admin.requests.list(
        filter === "all" ? undefined : filter,
        signal,
      ),
    [filter],
  );

  const { items, loading, error, message, retry, patch } =
    useAdminList<AdminArtisanRequest>(load);

  /**
   * What has been asked for most, across whatever is on screen.
   *
   * The single most useful thing this page can say. One request is a phone
   * call; the same words six times is the next artisan to go and sign.
   *
   * Grouped on the customer's own wording, case-folded and nothing more — no
   * mapping onto the trade taxonomy, because a request that fits the taxonomy
   * would not have been filed in the first place. The label shown is the first
   * spelling seen, so the row reads as something a person wrote.
   */
  const demand = useMemo(() => {
    const counts = new Map<string, { label: string; count: number }>();
    for (const row of items) {
      const key = row.need.toLowerCase();
      const seen = counts.get(key);
      counts.set(key, {
        label: seen?.label ?? row.need,
        count: (seen?.count ?? 0) + 1,
      });
    }
    return [...counts.values()]
      .map(({ label, count }) => [label, count] as const)
      .filter(([, count]) => count > 1)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);
  }, [items]);

  const replace = (id: string, changes: Partial<AdminArtisanRequest>) =>
    patch((current) =>
      current.map((row) => (row.id === id ? { ...row, ...changes } : row)),
    );

  async function setStatus(
    row: AdminArtisanRequest,
    status: ArtisanRequestStatus,
  ) {
    setBusyId(row.id);
    try {
      const saved = await api.admin.requests.update(row.id, { status });
      // A row that no longer belongs in the current filter leaves it.
      if (filter !== "all" && saved.status !== filter) {
        patch((current) => current.filter((item) => item.id !== row.id));
      } else {
        replace(row.id, saved);
      }
      toast.success(`Marked ${STATUS_LABELS[status].toLowerCase()}`);
    } catch (cause) {
      toast.error("Couldn't save that", {
        description:
          cause instanceof ApiError ? cause.message : "Try again in a moment.",
      });
    } finally {
      setBusyId(undefined);
    }
  }

  async function remove(row: AdminArtisanRequest) {
    const ok = await confirm({
      title: "Delete this request?",
      body: "The record is gone for good, including the number that asked. Close it instead if you just want it out of the queue.",
      confirmLabel: "Delete",
      cancelLabel: "Keep it",
      tone: "danger",
    });
    if (!ok) return;

    setBusyId(row.id);
    try {
      await api.admin.requests.remove(row.id);
      patch((current) => current.filter((item) => item.id !== row.id));
      toast.success("Request deleted");
    } catch (cause) {
      toast.error("Couldn't delete it", {
        description:
          cause instanceof ApiError ? cause.message : "Try again in a moment.",
      });
    } finally {
      setBusyId(undefined);
    }
  }

  return (
    <AdminPage>
      <AdminHeader
        title="Requests"
        lede="Artisans customers asked for and Artiza didn't have. Every row is somebody waiting on a call back."
      />

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <div role="group" aria-label="Request status" className="flex flex-wrap gap-1">
          {FILTERS.map((option) => {
            const active = filter === option.value;
            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={active}
                onClick={() => setFilter(option.value)}
                className={`pressable rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors duration-200 ease-out ${
                  active ? "bg-ink text-canvas" : "bg-fill text-sub"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>

        {!loading && !error ? (
          <p className="caption ml-auto">
            <span className="figure text-ink">{items.length}</span>{" "}
            {items.length === 1 ? "request" : "requests"}
          </p>
        ) : null}
      </div>

      {demand.length > 0 ? (
        <section
          aria-label="Most asked for"
          className="mt-4 rounded-2xl bg-card p-4"
        >
          <h2 className="caption font-semibold text-ink">Most asked for</h2>
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {demand.map(([label, count]) => (
              <li
                key={label}
                className="rounded-full bg-fill px-3 py-1 text-sm text-ink"
              >
                {label}{" "}
                <span className="figure font-semibold text-accent">
                  ×{count}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <div className="mt-4">
        {loading ? (
          <RowsSkeleton />
        ) : error ? (
          <ErrorState
            title="Couldn't load the requests"
            message={message}
            onRetry={retry}
          />
        ) : items.length === 0 ? (
          <EmptyState
            title={filter === "open" ? "Nobody waiting" : "Nothing here"}
            body={
              filter === "open"
                ? "When a customer searches for a trade Artiza doesn't have, their ask lands here."
                : "No requests in this state."
            }
          />
        ) : (
          <ul className="space-y-3">
            {items.map((row) => (
              <RequestCard
                key={row.id}
                row={row}
                busy={busyId === row.id}
                onStatus={(status) => void setStatus(row, status)}
                onDelete={() => void remove(row)}
              />
            ))}
          </ul>
        )}
      </div>
    </AdminPage>
  );
}

/**
 * One request. Everything needed to make the call is on the card — what they
 * want, where, in their words, and the number — so picking up the phone never
 * needs a second screen.
 */
function RequestCard({
  row,
  busy,
  onStatus,
  onDelete,
}: {
  row: AdminArtisanRequest;
  busy: boolean;
  onStatus: (status: ArtisanRequestStatus) => void;
  onDelete: () => void;
}) {
  const tone = STATUS_TONE[row.status];

  return (
    <li className={`rounded-2xl bg-card p-4 sm:p-5 ${busy ? "opacity-60" : ""}`}>
      <div className="flex flex-wrap items-start gap-3">
        <div className="min-w-0 flex-1 basis-48">
          <p className="headline flex flex-wrap items-center gap-1.5 text-ink">
            <span className="truncate">{row.need}</span>
            <span
              className={`caption shrink-0 rounded-full px-2 py-0.5 font-semibold ${
                tone === "accent"
                  ? "bg-accent-soft text-accent"
                  : tone === "danger"
                    ? "bg-fill text-danger"
                    : "bg-fill text-sub"
              }`}
            >
              {STATUS_LABELS[row.status]}
            </span>
          </p>
          <p className="caption mt-0.5">
            {shortDate(row.createdAt)} ·{" "}
            {row.source === "search" ? "via search" : "via browse"}
          </p>
        </div>

        {/* The loudest thing on the row, because the promise made on the form
            was a phone call and nothing else here keeps it. */}
        <a
          href={`tel:${phoneE164(row.phone)}`}
          className="pressable inline-flex shrink-0 items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white"
        >
          <PhoneCall size={14} strokeWidth={2.4} aria-hidden />
          <span className="figure">{formatPhone(row.phone)}</span>
        </a>
      </div>

      <p className="mt-3 text-[0.9375rem] leading-relaxed text-sub">
        {row.details}
      </p>

      {/* The words that found nobody. The one column a trade dropdown can't
          reproduce — nine people typing "marble polisher" is a hiring brief. */}
      {row.query ? (
        <p className="caption mt-2 inline-flex items-center gap-1.5 rounded-full bg-fill px-3 py-1">
          <Search size={12} strokeWidth={2.4} aria-hidden />
          searched &ldquo;{row.query}&rdquo;
        </p>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {STATUSES.filter((status) => status !== row.status).map((status) => (
          <button
            key={status}
            type="button"
            disabled={busy}
            onClick={() => onStatus(status)}
            className="pressable hover-fill rounded-full bg-fill px-3.5 py-1.5 text-sm font-semibold text-ink disabled:opacity-50"
          >
            {STATUS_LABELS[status]}
          </button>
        ))}

        <button
          type="button"
          disabled={busy}
          onClick={onDelete}
          title="Delete request"
          className="pressable hover-fill ml-auto grid size-9 place-items-center rounded-full text-sub disabled:opacity-40"
        >
          <Trash2 size={15} strokeWidth={2.1} />
          <span className="sr-only">Delete this request</span>
        </button>
      </div>
    </li>
  );
}
