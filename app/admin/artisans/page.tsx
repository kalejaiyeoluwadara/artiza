"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import {
  ImageOff,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Star,
  Trash2,
} from "lucide-react";
import { AdminHeader, AdminPage } from "../../../components/admin/AdminShell";
import {
  EmptyState,
  ErrorState,
  RowsSkeleton,
} from "../../../components/admin/States";
import { Avatar } from "../../../components/ArtisanCard";
import { useAdminList } from "../../../lib/admin/useAdminList";
import { useApi } from "../../../lib/api/useApi";
import { ApiError } from "../../../lib/api/error";
import { toast } from "../../../lib/toast";
import { confirm } from "../../../lib/confirm";
import { TRADE_LABELS, formatPhone, type Trade } from "../../../lib/artisans";
import type { AdminArtisan, RegisterStatus } from "../../../lib/api/types";

const STATUSES: { value: RegisterStatus; label: string }[] = [
  { value: "active", label: "Listed" },
  { value: "retired", label: "Retired" },
  { value: "all", label: "Everyone" },
];

type SortKey = "featured" | "name" | "rating" | "jobs" | "newest";

const SORTS: { value: SortKey; label: string }[] = [
  { value: "featured", label: "Featured first" },
  { value: "newest", label: "Recently added" },
  { value: "name", label: "Name" },
  { value: "rating", label: "Rating" },
  { value: "jobs", label: "Jobs" },
];

function sortRegister(list: AdminArtisan[], key: SortKey): AdminArtisan[] {
  const copy = [...list];

  switch (key) {
    case "name":
      return copy.sort((a, b) => a.name.localeCompare(b.name));
    case "rating":
      return copy.sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
    case "jobs":
      return copy.sort((a, b) => b.jobsCompleted - a.jobsCompleted);
    case "newest":
      return copy.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    case "featured":
      return copy.sort((a, b) => {
        if (a.featured !== b.featured) return a.featured ? -1 : 1;
        return b.jobsCompleted - a.jobsCompleted;
      });
  }
}

/**
 * The register, as the team manages it.
 *
 * Filtering happens in memory over one read, the same way the browse screen
 * does it and for the same reason: Ilisan is one town, the list fits, and a
 * search box that drops the whole table into skeletons on every keystroke is
 * worse at finding one artisan than the table itself. Only `status` goes back
 * to the API, because retired artisans genuinely aren't in the response.
 */
export default function RegisterPage() {
  const { api } = useApi();
  const [status, setStatus] = useState<RegisterStatus>("active");
  const [query, setQuery] = useState("");
  const [trade, setTrade] = useState<Trade | "all">("all");
  const [sort, setSort] = useState<SortKey>("featured");
  const [busyId, setBusyId] = useState<string>();

  const load = useCallback(
    (client: typeof api, signal: AbortSignal) =>
      client.admin.artisans.list({ status }, signal),
    [status],
  );

  const { items, loading, error, message, retry, patch } =
    useAdminList<AdminArtisan>(load);

  const shown = useMemo(() => {
    const term = query.trim().toLowerCase();

    const filtered = items.filter((artisan) => {
      if (trade !== "all" && artisan.trade !== trade) return false;
      if (!term) return true;
      return (
        artisan.name.toLowerCase().includes(term) ||
        artisan.location.toLowerCase().includes(term) ||
        TRADE_LABELS[artisan.trade].toLowerCase().includes(term) ||
        artisan.phone.includes(term.replace(/\D/g, "")) ||
        artisan.services.some((s) => s.toLowerCase().includes(term))
      );
    });

    return sortRegister(filtered, sort);
  }, [items, query, trade, sort]);

  /** Applies a mutation locally once the server has confirmed it. */
  const replace = (id: string, changes: Partial<AdminArtisan>) => {
    patch((current) =>
      current.map((artisan) =>
        artisan.id === id ? { ...artisan, ...changes } : artisan,
      ),
    );
  };

  async function toggleFeatured(artisan: AdminArtisan) {
    const next = !artisan.featured;
    setBusyId(artisan.id);

    try {
      await api.admin.artisans.setFeatured(artisan.id, next);
      replace(artisan.id, { featured: next });
      toast.success(
        next
          ? `${artisan.name} is featured`
          : `${artisan.name} is no longer featured`,
      );
    } catch (cause) {
      toast.error("Couldn't change the placement", {
        description:
          cause instanceof ApiError ? cause.message : "Try again in a moment.",
      });
    } finally {
      setBusyId(undefined);
    }
  }

  async function retire(artisan: AdminArtisan) {
    const ok = await confirm({
      title: `Retire ${artisan.name}?`,
      body: "They come off the browse screen and out of search. Customers who already paid keep the contact they bought, and you can list them again later.",
      confirmLabel: "Retire",
      cancelLabel: "Keep listed",
      tone: "danger",
    });
    if (!ok) return;

    setBusyId(artisan.id);
    try {
      await api.admin.artisans.retire(artisan.id);
      // Retired artisans aren't in the "Listed" read, so the row leaves rather
      // than changing colour — anything else would claim a state this filter
      // does not show.
      if (status === "active") {
        patch((current) => current.filter((row) => row.id !== artisan.id));
      } else {
        replace(artisan.id, { isActive: false });
      }
      toast.success(`${artisan.name} retired`);
    } catch (cause) {
      toast.error("Couldn't retire them", {
        description:
          cause instanceof ApiError ? cause.message : "Try again in a moment.",
      });
    } finally {
      setBusyId(undefined);
    }
  }

  async function restore(artisan: AdminArtisan) {
    setBusyId(artisan.id);
    try {
      await api.admin.artisans.update(artisan.id, { isActive: true });
      if (status === "retired") {
        patch((current) => current.filter((row) => row.id !== artisan.id));
      } else {
        replace(artisan.id, { isActive: true });
      }
      toast.success(`${artisan.name} is back on the register`);
    } catch (cause) {
      toast.error("Couldn't list them again", {
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
        title="Register"
        lede="Every artisan Artiza has visited and verified."
        action={
          <Link
            href="/admin/artisans/new"
            className="pressable inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-2.5 text-sm font-semibold text-white"
          >
            <Plus size={16} strokeWidth={2.4} />
            Add artisan
          </Link>
        }
      />

      {/* ── Controls ─────────────────────────────────────────────────── */}
      <div className="mt-6 flex flex-wrap items-center gap-2">
        <div className="relative min-w-56 flex-1">
          <Search
            size={16}
            strokeWidth={2.2}
            aria-hidden
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sub"
          />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Name, area, trade, service or number"
            aria-label="Search the register"
            className="w-full rounded-full bg-card py-2.5 pl-10 pr-4 text-[0.9375rem] text-ink placeholder:text-faint"
          />
        </div>

        <select
          value={trade}
          onChange={(event) => setTrade(event.target.value as Trade | "all")}
          aria-label="Filter by trade"
          className="rounded-full bg-card px-4 py-2.5 text-[0.9375rem] font-medium text-ink"
        >
          <option value="all">All trades</option>
          {(Object.keys(TRADE_LABELS) as Trade[]).map((value) => (
            <option key={value} value={value}>
              {TRADE_LABELS[value]}
            </option>
          ))}
        </select>

        <select
          value={sort}
          onChange={(event) => setSort(event.target.value as SortKey)}
          aria-label="Sort the register"
          className="rounded-full bg-card px-4 py-2.5 text-[0.9375rem] font-medium text-ink"
        >
          {SORTS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <div role="group" aria-label="Listing status" className="flex gap-1">
          {STATUSES.map((option) => {
            const active = status === option.value;
            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={active}
                onClick={() => setStatus(option.value)}
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
            <span className="figure text-ink">{shown.length}</span>
            {shown.length === items.length
              ? ` ${shown.length === 1 ? "artisan" : "artisans"}`
              : ` of ${items.length}`}
          </p>
        ) : null}
      </div>

      {/* ── The list ─────────────────────────────────────────────────── */}
      <div className="mt-4">
        {loading ? (
          <RowsSkeleton />
        ) : error ? (
          <ErrorState
            title="Couldn't load the register"
            message={message}
            onRetry={retry}
          />
        ) : shown.length === 0 ? (
          items.length === 0 ? (
            <EmptyState
              title={
                status === "retired"
                  ? "Nobody has been retired"
                  : "The register is empty"
              }
              body={
                status === "retired"
                  ? "Retiring an artisan keeps their record and their customers' receipts — they'll show up here when it happens."
                  : "Add the first artisan the team has visited and verified."
              }
              action={
                status === "retired" ? null : (
                  <Link
                    href="/admin/artisans/new"
                    className="pressable inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white"
                  >
                    <Plus size={15} strokeWidth={2.4} />
                    Add artisan
                  </Link>
                )
              }
            />
          ) : (
            <EmptyState
              title="Nothing matches that"
              body="Try a different spelling, or clear the trade filter."
              action={
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setTrade("all");
                  }}
                  className="pressable rounded-full bg-fill px-4 py-2 text-sm font-semibold text-ink"
                >
                  Clear the filters
                </button>
              }
            />
          )
        ) : (
          <ul className="overflow-hidden rounded-2xl bg-card">
            {shown.map((artisan) => (
              <RegisterRow
                key={artisan.id}
                artisan={artisan}
                busy={busyId === artisan.id}
                onToggleFeatured={() => void toggleFeatured(artisan)}
                onRetire={() => void retire(artisan)}
                onRestore={() => void restore(artisan)}
              />
            ))}
          </ul>
        )}
      </div>
    </AdminPage>
  );
}

/**
 * One artisan.
 *
 * The three numbers on the right are the ones a decision gets made on —
 * rating, jobs, unlocks this month — set in `.figure` so a column of them
 * lines up and a change of digit doesn't shuffle the row.
 */
function RegisterRow({
  artisan,
  busy,
  onToggleFeatured,
  onRetire,
  onRestore,
}: {
  artisan: AdminArtisan;
  busy: boolean;
  onToggleFeatured: () => void;
  onRetire: () => void;
  onRestore: () => void;
}) {
  const thin = artisan.work.length === 0;

  return (
    <li
      className={`flex flex-wrap items-center gap-x-3 gap-y-3 border-b border-line px-4 py-3.5 last:border-b-0 sm:flex-nowrap sm:px-5 ${
        busy ? "opacity-60" : ""
      } ${artisan.isActive ? "" : "bg-fill/40"}`}
    >
      <Avatar name={artisan.name} src={artisan.photo} size="size-11 text-sm" />

      <div className="min-w-0 flex-1 basis-40">
        <p className="headline flex items-center gap-1.5 text-ink">
          <span className="truncate">{artisan.name}</span>
          {artisan.featured ? (
            <span className="caption shrink-0 rounded-full bg-accent-soft px-2 py-0.5 font-semibold text-accent">
              Featured
            </span>
          ) : null}
          {artisan.isActive ? null : (
            <span className="caption shrink-0 rounded-full bg-fill px-2 py-0.5 font-semibold text-sub">
              Retired
            </span>
          )}
        </p>
        <p className="caption mt-0.5 truncate">
          {TRADE_LABELS[artisan.trade]} · {artisan.location} ·{" "}
          <span className="figure">{formatPhone(artisan.phone)}</span>
        </p>
      </div>

      {/* A listing with no portfolio falls back to a stock photo of the trade.
          It still works, but it is the single biggest thing the team can fix,
          so the row says so instead of leaving it to be noticed. */}
      {thin ? (
        <span
          className="caption inline-flex shrink-0 items-center gap-1 rounded-full bg-fill px-2 py-1 font-medium"
          title="Falls back to a stock photo of the trade"
        >
          <ImageOff size={12} strokeWidth={2.2} />
          No work photos
        </span>
      ) : null}

      <div className="figure hidden shrink-0 items-center gap-5 text-sm text-ink lg:flex">
        <span className="flex w-14 items-center gap-1" title="Rating">
          <Star size={12} strokeWidth={2.2} fill="currentColor" className="text-accent" />
          {artisan.rating > 0 ? artisan.rating.toFixed(1) : "—"}
          <span className="font-normal text-faint">({artisan.reviewCount})</span>
        </span>
        <span className="w-16 text-right" title="Jobs completed">
          {artisan.jobsCompleted}
          <span className="ml-1 font-normal text-sub">jobs</span>
        </span>
        <span className="w-24 text-right" title="Unlocks in the last 30 days">
          {artisan.recentUnlocks}
          <span className="ml-1 font-normal text-sub">this month</span>
        </span>
      </div>

      <div className="ml-auto flex shrink-0 items-center gap-1">
        <button
          type="button"
          disabled={busy || !artisan.isActive}
          onClick={onToggleFeatured}
          aria-pressed={artisan.featured}
          title={artisan.featured ? "Remove from featured" : "Feature them"}
          className={`pressable grid size-9 place-items-center rounded-full disabled:opacity-40 ${
            artisan.featured ? "bg-accent-soft text-accent" : "hover-fill text-sub"
          }`}
        >
          <Star
            size={16}
            strokeWidth={2.1}
            fill={artisan.featured ? "currentColor" : "none"}
          />
          <span className="sr-only">
            {artisan.featured ? "Remove featured from" : "Feature"} {artisan.name}
          </span>
        </button>

        <Link
          href={`/admin/artisans/${artisan.id}`}
          title="Edit"
          className="pressable hover-fill grid size-9 place-items-center rounded-full text-sub"
        >
          <Pencil size={15} strokeWidth={2.1} />
          <span className="sr-only">Edit {artisan.name}</span>
        </Link>

        {artisan.isActive ? (
          <button
            type="button"
            disabled={busy}
            onClick={onRetire}
            title="Retire"
            className="pressable hover-fill grid size-9 place-items-center rounded-full text-sub disabled:opacity-40"
          >
            <Trash2 size={15} strokeWidth={2.1} />
            <span className="sr-only">Retire {artisan.name}</span>
          </button>
        ) : (
          <button
            type="button"
            disabled={busy}
            onClick={onRestore}
            title="List them again"
            className="pressable hover-fill grid size-9 place-items-center rounded-full text-accent disabled:opacity-40"
          >
            <RotateCcw size={15} strokeWidth={2.1} />
            <span className="sr-only">List {artisan.name} again</span>
          </button>
        )}
      </div>
    </li>
  );
}
