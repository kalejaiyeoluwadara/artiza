"use client";

import { useState } from "react";
import { Search, SlidersHorizontal, Star } from "lucide-react";
import {
  Filters,
  NO_FILTERS,
  RATING_FLOORS,
  TRADE_LABELS,
  Trade,
  activeFilterCount,
  filterArtisans,
} from "../lib/artisans";
import { useArtisans } from "../lib/useData";
import { Sheet } from "./Sheet";

const TRADES = Object.keys(TRADE_LABELS) as Trade[];

/**
 * Marketplace search grammar: the bar summarises the current query and
 * every part of it opens the same one sheet. Mobile collapses the whole
 * thing to a single pill — three segments do not survive 360px — while
 * `sm` and up splits it into the segments the summary was made of.
 */
export function SearchBar({
  filters,
  onChange,
}: {
  filters: Filters;
  onChange: (next: Filters) => void;
}) {
  const [open, setOpen] = useState(false);
  const count = activeFilterCount(filters);

  const tradeLabel = filters.trade ? TRADE_LABELS[filters.trade] : "Any trade";
  const ratingLabel = filters.minRating
    ? `${filters.minRating.toFixed(1)}+`
    : "Any rating";

  return (
    <>
      <div className="mt-4">
        {/* Mobile: one pill, the whole thing is the control. */}
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="pressable flex w-full items-center gap-3 rounded-full bg-card py-2.5 pr-2.5 pl-4 text-left sm:hidden"
        >
          <Search size={18} strokeWidth={2.2} className="shrink-0 text-ink" />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[0.9375rem] font-semibold text-ink">
              {tradeLabel}
            </span>
            <span className="caption block truncate">
              Trade · {ratingLabel}
            </span>
          </span>
          <FilterGlyph count={count} />
        </button>

        {/* sm+: the same query, opened out into its parts. */}
        <div className="hidden items-center rounded-full bg-card p-1.5 sm:flex">
          <Segment label="Trade" value={tradeLabel} onClick={() => setOpen(true)} />
          <Divider />
          <Segment
            label="Rating"
            value={ratingLabel}
            onClick={() => setOpen(true)}
          />
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open filters"
            className="pressable hover-dim ml-1 flex size-11 shrink-0 items-center justify-center rounded-full bg-accent text-white"
          >
            <Search size={18} strokeWidth={2.4} />
          </button>
        </div>
      </div>

      <FilterSheet
        open={open}
        onClose={() => setOpen(false)}
        filters={filters}
        onChange={onChange}
      />
    </>
  );
}

/** A count badge rather than a second control — the pill is the control. */
function FilterGlyph({ count }: { count: number }) {
  return (
    <span className="relative flex size-9 shrink-0 items-center justify-center rounded-full bg-fill">
      <SlidersHorizontal size={16} strokeWidth={2.2} className="text-ink" />
      {count > 0 && (
        <span className="figure absolute -top-0.5 -right-0.5 flex size-4.5 items-center justify-center rounded-full bg-accent text-[0.625rem] text-white">
          {count}
        </span>
      )}
    </span>
  );
}

function Segment({
  label,
  value,
  onClick,
}: {
  label: string;
  value: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="hover-fill min-w-0 flex-1 rounded-full px-5 py-1.5 text-left transition-colors"
    >
      <span className="caption block">{label}</span>
      <span className="block truncate text-[0.9375rem] font-semibold text-ink">
        {value}
      </span>
    </button>
  );
}

function Divider() {
  return <span aria-hidden className="h-8 w-px shrink-0 bg-line" />;
}

/**
 * Filters land the moment they are tapped — the footer button only closes
 * the sheet, and it carries the result count so the effect of a choice is
 * visible before you commit to leaving.
 */
/** Exported so other entry points into the same query reuse this one sheet. */
export function FilterSheet({
  open,
  onClose,
  filters,
  onChange,
}: {
  open: boolean;
  onClose: () => void;
  filters: Filters;
  onChange: (next: Filters) => void;
}) {
  // The same read the register itself renders from. Counting the register
  // instead would promise "Show 8 artisans" while the list behind the
  // sheet was still a skeleton, or had failed to load entirely.
  const { artisans, loading } = useArtisans();
  const results = filterArtisans(artisans, filters).length;
  const count = activeFilterCount(filters);

  return (
    <Sheet open={open} onClose={onClose} label="Filters">
      <div className="flex items-center justify-between px-5 pt-1 pb-3">
        <h2 className="title text-ink">Filters</h2>
        <button
          type="button"
          onClick={() => onChange(NO_FILTERS)}
          disabled={count === 0}
          className="pressable text-sm font-semibold text-accent disabled:text-faint"
        >
          Reset
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-4">
        <Group title="Trade">
          <Option
            active={filters.trade === null}
            onClick={() => onChange({ ...filters, trade: null })}
          >
            Any trade
          </Option>
          {TRADES.map((t) => (
            <Option
              key={t}
              active={filters.trade === t}
              onClick={() => onChange({ ...filters, trade: t })}
            >
              {TRADE_LABELS[t]}
            </Option>
          ))}
        </Group>

        <Group title="Rating">
          <Option
            active={filters.minRating === null}
            onClick={() => onChange({ ...filters, minRating: null })}
          >
            Any rating
          </Option>
          {RATING_FLOORS.map((floor) => (
            <Option
              key={floor}
              active={filters.minRating === floor}
              onClick={() => onChange({ ...filters, minRating: floor })}
            >
              <Star size={13} strokeWidth={2.2} fill="currentColor" aria-hidden />
              <span className="figure">{floor.toFixed(1)}+</span>
            </Option>
          ))}
        </Group>
      </div>

      <div className="chrome shrink-0 border-t border-line px-5 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <button
          type="button"
          onClick={onClose}
          className="pressable hover-dim w-full rounded-full bg-accent py-3.5 text-[0.9375rem] font-semibold text-white"
        >
          {loading
            ? "Show artisans"
            : results === 0
              ? "No artisans match"
              : `Show ${results} ${results === 1 ? "artisan" : "artisans"}`}
        </button>
      </div>
    </Sheet>
  );
}

function Group({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-4 first:mt-0">
      <h3 className="headline text-ink">{title}</h3>
      <div className="mt-2.5 flex flex-wrap gap-2">{children}</div>
    </section>
  );
}

function Option({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`pressable flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium ${
        active ? "bg-ink text-canvas" : "hover-fill bg-card text-ink"
      }`}
    >
      {children}
    </button>
  );
}
