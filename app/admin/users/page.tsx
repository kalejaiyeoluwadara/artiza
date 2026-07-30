"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Coins,
  Search,
  ShieldCheck,
  Unlock,
  X,
} from "lucide-react";
import { AdminHeader, AdminPage } from "../../../components/admin/AdminShell";
import { CreditDialog } from "../../../components/admin/CreditDialog";
import {
  EmptyState,
  ErrorState,
  RowsSkeleton,
} from "../../../components/admin/States";
import { Avatar } from "../../../components/ArtisanCard";
import { ApiError } from "../../../lib/api/error";
import { useApi } from "../../../lib/api/useApi";
import { formatPhone } from "../../../lib/artisans";
import { shortDate } from "../../../lib/outreach";
import { toast } from "../../../lib/toast";
import type {
  AdminUser,
  PageMeta,
  UserRoleFilter,
  UserSort,
} from "../../../lib/api/types";

const PAGE_SIZE = 20;

const ROLES: { value: UserRoleFilter; label: string }[] = [
  { value: "all", label: "Everyone" },
  { value: "customer", label: "Customers" },
  { value: "admin", label: "Admins" },
];

const SORTS: { value: UserSort; label: string }[] = [
  { value: "recent", label: "Newest" },
  { value: "credits", label: "Most credits" },
  { value: "name", label: "A–Z" },
];

/**
 * Everyone with an Artiza account.
 *
 * The only console list that pages and searches on the server: artisans are a
 * few dozen the team knows by name, and customers are however many sign up.
 * So the search box is the primary control here, not a filter over something
 * already on screen — a support call starts with a name or a number, and this
 * screen has to answer it in one read.
 *
 * The credits column is what makes it more than a directory. Every credit is a
 * free ₦500 unlock, so granting one is spending real money; that action lives
 * behind a dialog that says so and writes down who did it.
 */
export default function UsersPage() {
  const { api, loading: sessionLoading } = useApi();

  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [role, setRole] = useState<UserRoleFilter>("all");
  const [sort, setSort] = useState<UserSort>("recent");
  const [page, setPage] = useState(1);

  const [items, setItems] = useState<AdminUser[]>([]);
  const [meta, setMeta] = useState<PageMeta>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [editing, setEditing] = useState<AdminUser | null>(null);

  /**
   * Every control that changes what is being read puts the list into its
   * loading state itself, rather than the fetch effect doing it on the way
   * past. An effect that sets state in its own body re-renders the tree twice
   * for one intent; this way the skeleton appears on the click that caused it.
   */
  function reload(change: () => void) {
    setLoading(true);
    change();
  }

  // Typing is not a request. A pause is — 300ms is long enough that a name
  // typed at speed costs one read rather than nine.
  useEffect(() => {
    const timer = setTimeout(() => {
      const next = search.trim();
      // Typing and deleting back to the same words is not a new question.
      if (next === query) return;
      setLoading(true);
      setQuery(next);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, query]);

  useEffect(() => {
    // Every route here 401s without a token, so the read waits for the session
    // rather than failing once and offering a pointless retry.
    if (sessionLoading) return;

    const controller = new AbortController();

    api.admin.users
      .list(
        { search: query || undefined, role, sort, page, limit: PAGE_SIZE },
        controller.signal,
      )
      .then((result) => {
        if (controller.signal.aborted) return;
        setItems(result.items);
        setMeta(result.meta);
        setError(null);
        setLoading(false);
      })
      .catch((cause: unknown) => {
        if (controller.signal.aborted) return;
        if (cause instanceof ApiError && cause.isAborted) return;
        setError(
          cause instanceof ApiError
            ? cause.message
            : "The request didn't get through.",
        );
        setLoading(false);
      });

    return () => controller.abort();
  }, [api, sessionLoading, query, role, sort, page, attempt]);

  const retry = useCallback(() => {
    setLoading(true);
    setAttempt((n) => n + 1);
  }, []);

  const total = meta?.total ?? 0;
  const totalPages = meta?.totalPages ?? 1;

  return (
    <AdminPage>
      <AdminHeader
        title="Customers"
        lede="Everyone with an Artiza account — what they've unlocked, and what they've got left to spend."
      />

      {/* ── Find one ──────────────────────────────────────────────────── */}
      <div className="mt-6 flex flex-wrap items-center gap-2">
        <div className="relative min-w-56 flex-1">
          <Search
            size={16}
            strokeWidth={2.2}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-faint"
            aria-hidden
          />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Name, email or phone"
            aria-label="Search accounts"
            className="w-full rounded-full bg-fill py-2.5 pl-11 pr-10 text-[0.9375rem] text-ink placeholder:text-faint"
          />
          {search ? (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="pressable absolute right-3 top-1/2 grid size-6 -translate-y-1/2 place-items-center rounded-full text-sub"
            >
              <X size={14} strokeWidth={2.4} />
              <span className="sr-only">Clear the search</span>
            </button>
          ) : null}
        </div>

        <div role="group" aria-label="Account type" className="flex gap-1">
          {ROLES.map((option) => {
            const active = role === option.value;
            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={active}
                onClick={() =>
                  reload(() => {
                    setRole(option.value);
                    setPage(1);
                  })
                }
                className={`pressable rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors duration-200 ease-out ${
                  active ? "bg-ink text-canvas" : "bg-fill text-sub"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <div role="group" aria-label="Order" className="flex gap-1">
          {SORTS.map((option) => {
            const active = sort === option.value;
            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={active}
                onClick={() =>
                  reload(() => {
                    setSort(option.value);
                    setPage(1);
                  })
                }
                className={`pressable rounded-full px-3 py-1 text-sm font-medium transition-colors duration-200 ease-out ${
                  active ? "bg-accent-soft text-accent" : "text-sub hover-fill"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>

        {!loading && !error ? (
          <p className="caption ml-auto">
            <span className="figure text-ink">{total}</span>{" "}
            {total === 1 ? "account" : "accounts"}
            {query ? ` matching “${query}”` : ""}
          </p>
        ) : null}
      </div>

      <div className="mt-4">
        {loading ? (
          <RowsSkeleton />
        ) : error ? (
          <ErrorState
            title="Couldn't load the accounts"
            message={error}
            onRetry={retry}
          />
        ) : items.length === 0 ? (
          <EmptyState
            title={query ? "Nobody by that name" : "No accounts yet"}
            body={
              query
                ? "Try part of an email or the phone number instead — the search matches all three."
                : "Accounts appear here the moment someone signs up in the app."
            }
          />
        ) : (
          <ul className="overflow-hidden rounded-2xl bg-card">
            {items.map((user) => (
              <UserRow
                key={user.id}
                user={user}
                onAdjust={() => setEditing(user)}
              />
            ))}
          </ul>
        )}
      </div>

      {/* ── Paging ────────────────────────────────────────────────────── */}
      {!loading && !error && totalPages > 1 ? (
        <nav
          aria-label="Pages"
          className="mt-4 flex items-center justify-center gap-2"
        >
          <button
            type="button"
            disabled={!meta?.hasPrev}
            onClick={() =>
              reload(() => setPage((current) => Math.max(1, current - 1)))
            }
            className="pressable hover-fill grid size-9 place-items-center rounded-full text-sub disabled:opacity-30"
          >
            <ChevronLeft size={17} strokeWidth={2.2} />
            <span className="sr-only">Previous page</span>
          </button>

          <p className="caption figure">
            {page} of {totalPages}
          </p>

          <button
            type="button"
            disabled={!meta?.hasNext}
            onClick={() => reload(() => setPage((current) => current + 1))}
            className="pressable hover-fill grid size-9 place-items-center rounded-full text-sub disabled:opacity-30"
          >
            <ChevronRight size={17} strokeWidth={2.2} />
            <span className="sr-only">Next page</span>
          </button>
        </nav>
      ) : null}

      <CreditDialog
        user={editing}
        onClose={() => setEditing(null)}
        onSaved={({ user, grant }) => {
          setItems((current) =>
            current.map((row) => (row.id === user.id ? user : row)),
          );
          toast.success(
            grant.amount > 0
              ? `Gave ${user.name} ${grant.amount} ${
                  grant.amount === 1 ? "credit" : "credits"
                }`
              : `Took back ${Math.abs(grant.amount)} from ${user.name}`,
            { description: `They now have ${user.credits}.` },
          );
        }}
      />
    </AdminPage>
  );
}

/**
 * One account. The three numbers that matter — credits, unlocks, and when they
 * were last seen — sit on the row, so deciding whether a complaint is worth a
 * free unlock never needs a second screen.
 */
function UserRow({
  user,
  onAdjust,
}: {
  user: AdminUser;
  onAdjust: () => void;
}) {
  return (
    <li className="flex flex-wrap items-center gap-3 border-b border-line px-4 py-3.5 last:border-b-0 sm:px-5">
      <Avatar name={user.name} size="size-11 text-sm" />

      <div className="min-w-0 flex-1 basis-44">
        <p className="flex items-center gap-1.5 text-[0.9375rem] font-medium text-ink">
          <span className="truncate">{user.name}</span>
          {user.role === "admin" ? (
            <ShieldCheck
              size={14}
              strokeWidth={2.2}
              className="shrink-0 text-accent"
              aria-label="Admin"
            />
          ) : null}
          {!user.isActive ? (
            <span className="caption shrink-0 rounded-full bg-fill px-2 py-0.5 text-danger">
              Disabled
            </span>
          ) : null}
        </p>
        <p className="caption truncate">
          {user.email}
          {user.phone ? ` · ${formatPhone(user.phone)}` : ""}
        </p>
      </div>

      {/* What they've bought, and what they still hold. */}
      <div className="flex shrink-0 items-center gap-4">
        <p
          className="caption flex items-center gap-1.5"
          title={`${user.unlocks} artisans unlocked`}
        >
          <Unlock size={13} strokeWidth={2.2} aria-hidden />
          <span className="figure text-ink">{user.unlocks}</span>
        </p>

        <p
          className={`caption flex items-center gap-1.5 ${
            user.credits > 0 ? "text-accent" : ""
          }`}
          title={`${user.credits} unspent credits`}
        >
          <Coins size={13} strokeWidth={2.2} aria-hidden />
          <span className="figure">{user.credits}</span>
        </p>
      </div>

      <p className="caption hidden w-24 shrink-0 text-right sm:block">
        {user.lastLoginAt ? shortDate(user.lastLoginAt) : "Never signed in"}
      </p>

      <button
        type="button"
        onClick={onAdjust}
        className="pressable shrink-0 rounded-full bg-fill px-3.5 py-1.5 text-sm font-semibold text-ink"
      >
        Credits
      </button>
    </li>
  );
}
