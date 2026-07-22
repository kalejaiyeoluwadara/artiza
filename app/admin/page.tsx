"use client";

import { useCallback, useMemo } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ImageOff,
  ListChecks,
  MessageSquareOff,
  Plus,
  Star,
  Unlock,
  Users,
} from "lucide-react";
import { AdminHeader, AdminPage } from "../../components/admin/AdminShell";
import { ErrorState } from "../../components/admin/States";
import { Avatar } from "../../components/ArtisanCard";
import { Skeleton } from "../../components/Skeleton";
import { useAdminList } from "../../lib/admin/useAdminList";
import { TRADE_LABELS, type Trade } from "../../lib/artisans";
import type { Api } from "../../lib/api";
import type { AdminArtisan } from "../../lib/api/types";

/** Below this, a rating is a small sample rather than a reputation. */
const RATED_THRESHOLD = 15;

/**
 * The console's front page.
 *
 * It reads the whole register once and answers two questions from it: how big
 * is the register, and what in it is currently letting customers down. The
 * second is the reason this screen exists — a count of artisans is a number
 * nobody acts on, while "four listings have no work photos" is a morning's
 * work with a link on the end of it.
 */
export default function OverviewPage() {
  const load = useCallback(
    (client: Api, signal: AbortSignal) =>
      client.admin.artisans.list({ status: "all" }, signal),
    [],
  );

  const { items, loading, error, message, retry } =
    useAdminList<AdminArtisan>(load);

  const stats = useMemo(() => {
    const listed = items.filter((a) => a.isActive);
    const rated = listed.filter((a) => a.reviewCount > 0);

    return {
      listed,
      retired: items.filter((a) => !a.isActive),
      featured: listed.filter((a) => a.featured),
      unlocks: listed.reduce((sum, a) => sum + a.recentUnlocks, 0),
      reviews: listed.reduce((sum, a) => sum + a.reviewCount, 0),
      // Weighted by review count: an average of averages lets one five-star
      // review off a single job outrank fifty considered ones.
      rating:
        rated.length === 0
          ? 0
          : rated.reduce((sum, a) => sum + a.rating * a.reviewCount, 0) /
            rated.reduce((sum, a) => sum + a.reviewCount, 0),
    };
  }, [items]);

  const coverage = useMemo(() => {
    const trades = Object.keys(TRADE_LABELS) as Trade[];
    const counts = trades.map((trade) => ({
      trade,
      count: stats.listed.filter((a) => a.trade === trade).length,
    }));
    const peak = Math.max(1, ...counts.map((entry) => entry.count));
    return { counts: counts.sort((a, b) => b.count - a.count), peak };
  }, [stats.listed]);

  /** Three fixable problems, each with the artisans it applies to. */
  const attention = useMemo(() => {
    const noWork = stats.listed.filter((a) => a.work.length === 0);
    const noServices = stats.listed.filter((a) => a.services.length === 0);
    const unrated = stats.listed.filter(
      (a) => a.reviewCount === 0 && a.jobsCompleted > 0,
    );

    return [
      {
        key: "work",
        icon: ImageOff,
        title: "No work photos",
        body: "Their card falls back to a stock photo of the trade. The work is the evidence — this is the biggest single fix available.",
        artisans: noWork,
      },
      {
        key: "services",
        icon: ListChecks,
        title: "No services listed",
        body: "Services are searchable, so these artisans can't be found by what they actually do.",
        artisans: noServices,
      },
      {
        key: "reviews",
        icon: MessageSquareOff,
        title: "Unlocked but never rated",
        body: "Customers paid and nobody followed up. Every one of these is a rating the register is missing.",
        artisans: unrated,
      },
    ].filter((group) => group.artisans.length > 0);
  }, [stats.listed]);

  const recent = useMemo(
    () =>
      [...stats.listed]
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .slice(0, 5),
    [stats.listed],
  );

  if (error) {
    return (
      <AdminPage>
        <AdminHeader title="Overview" lede="The register at a glance." />
        <div className="mt-6">
          <ErrorState
            title="Couldn't read the register"
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
        title="Overview"
        lede="Ilisan, Ogun State — the whole register in one read."
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

      {/* ── The numbers ──────────────────────────────────────────────── */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          icon={Users}
          label="Listed"
          value={stats.listed.length}
          note={
            stats.retired.length > 0
              ? `${stats.retired.length} retired`
              : "Nobody retired"
          }
          loading={loading}
        />
        <StatTile
          icon={Star}
          label="Featured"
          value={stats.featured.length}
          note="Paid placement"
          loading={loading}
        />
        <StatTile
          icon={Unlock}
          label="Unlocks"
          value={stats.unlocks}
          note="Last 30 days"
          loading={loading}
        />
        <StatTile
          icon={Star}
          label="Average rating"
          value={stats.rating > 0 ? stats.rating.toFixed(2) : "—"}
          note={`${stats.reviews} ${stats.reviews === 1 ? "review" : "reviews"}`}
          loading={loading}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-6">
          {/* ── Needs attention ──────────────────────────────────────── */}
          <section>
            <h2 className="title px-1 text-ink">Worth a look</h2>
            <p className="caption mt-1 px-1">
              Nothing here is broken. It is the difference between a listing
              that works and one that sells.
            </p>

            <div className="mt-3 space-y-3">
              {loading ? (
                <>
                  <Skeleton className="h-28 w-full rounded-2xl" />
                  <Skeleton className="h-28 w-full rounded-2xl" />
                </>
              ) : attention.length === 0 ? (
                <div className="rounded-2xl bg-card p-6">
                  <p className="headline text-ink">Every listing is complete</p>
                  <p className="caption mt-1">
                    Photos, services and ratings are all in place across the
                    register.
                  </p>
                </div>
              ) : (
                attention.map(({ key, icon: Icon, title, body, artisans }) => (
                  <section
                    key={key}
                    className="rounded-2xl bg-card p-5"
                  >
                    <div className="flex items-start gap-3">
                      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-fill">
                        <Icon size={16} strokeWidth={2} className="text-sub" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <h3 className="headline flex items-center gap-2 text-ink">
                          {title}
                          <span className="figure rounded-full bg-accent-soft px-2 py-0.5 text-xs text-accent">
                            {artisans.length}
                          </span>
                        </h3>
                        <p className="caption mt-1">{body}</p>
                      </div>
                    </div>

                    <ul className="mt-3 flex flex-wrap gap-1.5">
                      {artisans.slice(0, 8).map((artisan) => (
                        <li key={artisan.id}>
                          <Link
                            href={`/admin/artisans/${artisan.id}`}
                            className="pressable flex items-center gap-2 rounded-full bg-fill py-1 pl-1 pr-3 text-sm font-medium text-ink"
                          >
                            <Avatar
                              name={artisan.name}
                              src={artisan.photo}
                              size="size-6 text-[0.625rem]"
                            />
                            {artisan.name}
                          </Link>
                        </li>
                      ))}
                      {artisans.length > 8 ? (
                        <li className="caption self-center pl-1">
                          and {artisans.length - 8} more
                        </li>
                      ) : null}
                    </ul>
                  </section>
                ))
              )}
            </div>
          </section>

          {/* ── Trade coverage ───────────────────────────────────────── */}
          <section className="rounded-2xl bg-card p-5">
            <h2 className="title text-ink">Trade coverage</h2>
            <p className="caption mt-1">
              A trade with nobody in it is a filter that returns an empty
              screen. That is the gap worth filling next.
            </p>

            <ul className="mt-4 space-y-2.5">
              {coverage.counts.map(({ trade, count }) => (
                <li key={trade} className="flex items-center gap-3">
                  <span className="w-28 shrink-0 truncate text-sm font-medium text-ink">
                    {TRADE_LABELS[trade]}
                  </span>
                  <span className="h-2 flex-1 overflow-hidden rounded-full bg-fill">
                    <span
                      className="block h-full rounded-full bg-accent transition-[width] duration-500 ease-out"
                      style={{
                        width: loading
                          ? "0%"
                          : `${(count / coverage.peak) * 100}%`,
                      }}
                    />
                  </span>
                  <span
                    className={`figure w-16 shrink-0 text-right text-sm ${
                      count === 0 ? "text-danger" : "text-ink"
                    }`}
                  >
                    {count === 0 ? "None" : count}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* ── Recently added ─────────────────────────────────────────── */}
        <aside>
          <div className="rounded-2xl bg-card p-5">
            <h2 className="title text-ink">Recently added</h2>

            {loading ? (
              <div className="mt-4 space-y-3">
                {[0, 1, 2].map((i) => (
                  <Skeleton key={i} className="h-11 w-full rounded-xl" />
                ))}
              </div>
            ) : recent.length === 0 ? (
              <p className="caption mt-2">
                Nobody on the register yet. Add the first artisan the team has
                verified.
              </p>
            ) : (
              <ul className="mt-3 -mx-2">
                {recent.map((artisan) => (
                  <li key={artisan.id}>
                    <Link
                      href={`/admin/artisans/${artisan.id}`}
                      className="pressable hover-fill flex items-center gap-3 rounded-xl px-2 py-2"
                    >
                      <Avatar
                        name={artisan.name}
                        src={artisan.photo}
                        size="size-9 text-xs"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[0.9375rem] font-medium text-ink">
                          {artisan.name}
                        </span>
                        <span className="caption block truncate">
                          {TRADE_LABELS[artisan.trade]} · {artisan.verifiedSince}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}

            <Link
              href="/admin/artisans"
              className="pressable caption mt-3 inline-flex items-center gap-1 font-semibold text-accent"
            >
              The whole register
              <ArrowRight size={13} strokeWidth={2.4} />
            </Link>
          </div>

          <div className="mt-3 rounded-2xl border border-dashed border-line p-5">
            <h3 className="headline text-ink">Rated artisans</h3>
            <p className="caption mt-1">
              {loading
                ? "Counting…"
                : `${stats.listed.filter((a) => a.reviewCount >= RATED_THRESHOLD).length} have ${RATED_THRESHOLD}+ reviews — the floor before a rating is worth ranking on, and what the Top rated rail draws from.`}
            </p>
          </div>
        </aside>
      </div>
    </AdminPage>
  );
}

/**
 * One number, the thing it counts, and one line of what it means. The value is
 * `.figure` so a column of tiles lines up and a changing digit never reflows.
 */
function StatTile({
  icon: Icon,
  label,
  value,
  note,
  loading,
}: {
  icon: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;
  label: string;
  value: number | string;
  note: string;
  loading: boolean;
}) {
  return (
    <div className="rounded-2xl bg-card p-4">
      <div className="flex items-center gap-2">
        <Icon size={14} strokeWidth={2.2} className="text-sub" />
        <p className="caption font-semibold uppercase tracking-wider">{label}</p>
      </div>

      {loading ? (
        <Skeleton className="mt-2 h-8 w-16 rounded-lg" />
      ) : (
        <p className="figure mt-1.5 text-3xl text-ink">{value}</p>
      )}

      <p className="caption mt-1">{note}</p>
    </div>
  );
}
