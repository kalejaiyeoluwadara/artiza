"use client";

import { useDeferredValue, useMemo, useRef, useState } from "react";
import { BadgeCheck, ChevronRight, Clock, Search, Star, X } from "lucide-react";
import { Artisan, TRADE_LABELS } from "../lib/artisans";
import { MatchField, highlight, searchArtisans, searchSuggestions } from "../lib/search";
import { useArtisans } from "../lib/useData";
import { useRecentSearches } from "../lib/useRecentSearches";
import { useUnlocks } from "../lib/useUnlocks";
import { Avatar } from "./ArtisanCard";
import { ArtisanSheet } from "./ArtisanSheet";


/**
 * The typed way in. Browse answers "show me tilers"; this answers "who
 * does marble?", so it reads names, trades, services and areas at once
 * and each result says which of them it matched.
 *
 * Results land on the keystroke — the register is already in memory, so
 * there is nothing to submit to. Enter only dismisses the keyboard and
 * files the query in recents.
 */
export function SearchScreen() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Artisan | null>(null);
  const field = useRef<HTMLInputElement>(null);

  const { artisans, loading, error, retry } = useArtisans();
  const { isUnlocked, unlock } = useUnlocks();
  const { queries: recents, remember, forget, clear } = useRecentSearches();

  /* Typing stays responsive while the list re-scores: React keeps painting
     the old results until the new pass is ready rather than blocking the
     caret. */
  const deferred = useDeferredValue(query);
  const term = deferred.trim();

  const hits = useMemo(
    () => searchArtisans(artisans, term),
    [artisans, term]
  );
  const suggestions = useMemo(() => searchSuggestions(artisans), [artisans]);

  /* A query is only worth remembering once it has taken someone somewhere.
     Opening a result is the strongest signal; pressing enter is the
     weaker one, and both go through here. */
  function file() {
    if (term) remember(term);
  }

  function open(artisan: Artisan) {
    file();
    setSelected(artisan);
  }

  function run(next: string) {
    setQuery(next);
    field.current?.focus();
  }

  return (
    <>
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          file();
          // The results are already on screen, so the keyboard has nothing
          // left to do.
          field.current?.blur();
        }}
        className="mt-4"
      >
        <div className="flex items-center gap-3 rounded-full bg-card py-3 pr-3 pl-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)] focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-accent">
          <Search
            size={18}
            strokeWidth={2.2}
            aria-hidden
            className="shrink-0 text-ink"
          />
          <input
            ref={field}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            enterKeyHint="search"
            autoComplete="off"
            aria-label="Search artisans by name, trade, service or area"
            placeholder="Marble, burst pipe, Babcock Road…"
            /* The browser's own clear affordance is a second, differently
               styled X — ours is the one that matches the app. */
            className="min-w-0 flex-1 bg-transparent text-[0.9375rem] font-medium text-ink outline-none placeholder:font-normal placeholder:text-faint [&::-webkit-search-cancel-button]:appearance-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => run("")}
              aria-label="Clear search"
              className="pressable hover-fill grid size-7 shrink-0 place-items-center rounded-full bg-fill text-sub"
            >
              <X size={14} strokeWidth={2.6} />
            </button>
          )}
        </div>
      </form>

      {!term ? (
        <Idle
          recents={recents}
          suggestions={suggestions}
          onPick={run}
          onForget={forget}
          onClear={clear}
        />
      ) : error ? (
        <Notice
          body="The register didn't load, so there's nothing to search yet."
          action="Try again"
          onAction={retry}
        />
      ) : loading ? (
        <p className="caption mt-8 text-center text-sub">Searching…</p>
      ) : hits.length === 0 ? (
        <Notice
          body={`Nobody matches “${term}”. Try a trade, a job — marble, burst pipe, ironing — or an area like Babcock Road.`}
          action="Clear search"
          onAction={() => run("")}
        />
      ) : (
        <section aria-label="Search results" className="mt-6">
          <p className="caption" role="status" aria-live="polite">
            {hits.length} {hits.length === 1 ? "artisan" : "artisans"} for “
            {term}”
          </p>

          {/* One grouped list, not a grid of cards: search is scanning, and
              a row that fits four to a screen is easier to scan than a
              photo you have to admire. */}
          <ul className="mt-3 divide-y divide-line overflow-hidden rounded-2xl bg-card shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
            {hits.map(({ artisan, field: matched, value }) => (
              <li key={artisan.id}>
                <ResultRow
                  artisan={artisan}
                  matched={matched}
                  value={value}
                  query={term}
                  onOpen={() => open(artisan)}
                />
              </li>
            ))}
          </ul>
        </section>
      )}

      <ArtisanSheet
        artisan={selected}
        onClose={() => setSelected(null)}
        unlocked={selected ? isUnlocked(selected.id) : false}
        onUnlock={() => selected && unlock(selected.id)}
      />
    </>
  );
}

/**
 * Before anything is typed. An empty search screen is the one place a
 * blank slate is inexcusable — the field can't tell you what the register
 * knows, so these do.
 */
function Idle({
  recents,
  suggestions,
  onPick,
  onForget,
  onClear,
}: {
  recents: string[];
  suggestions: string[];
  onPick: (query: string) => void;
  onForget: (query: string) => void;
  onClear: () => void;
}) {
  return (
    <>
      {recents.length > 0 && (
        <section aria-labelledby="recent-heading" className="mt-6">
          <div className="flex items-baseline justify-between gap-3">
            <h2 id="recent-heading" className="headline text-ink">
              Recent
            </h2>
            <button
              type="button"
              onClick={onClear}
              className="pressable shrink-0 text-[0.8125rem] font-semibold text-accent"
            >
              Clear
            </button>
          </div>

          <ul className="mt-2.5 divide-y divide-line overflow-hidden rounded-2xl bg-card shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
            {recents.map((query) => (
              <li key={query} className="flex items-center">
                <button
                  type="button"
                  onClick={() => onPick(query)}
                  className="hover-fill flex min-w-0 flex-1 items-center gap-3 py-3 pl-4 text-left transition-colors active:bg-fill"
                >
                  <Clock
                    size={16}
                    strokeWidth={2.2}
                    aria-hidden
                    className="shrink-0 text-faint"
                  />
                  <span className="truncate text-[0.9375rem] text-ink">
                    {query}
                  </span>
                </button>
                {/* Removing one is a different action from running it, so
                    it gets its own target rather than a swipe nobody will
                    discover on the web. */}
                <button
                  type="button"
                  onClick={() => onForget(query)}
                  aria-label={`Remove ${query} from recent searches`}
                  className="pressable grid size-11 shrink-0 place-items-center text-faint"
                >
                  <X size={15} strokeWidth={2.4} />
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="try-heading" className="mt-6">
        <h2 id="try-heading" className="headline text-ink">
          Try searching for
        </h2>
        <ul className="mt-2.5 flex flex-wrap gap-2">
          {suggestions.map((suggestion) => (
            <li key={suggestion}>
              <button
                type="button"
                onClick={() => onPick(suggestion)}
                className="pressable hover-fill rounded-full bg-card px-4 py-2 text-sm font-medium text-ink shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
              >
                {suggestion}
              </button>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

/** One result. Dense enough to scan, and it says why it's in the list. */
function ResultRow({
  artisan,
  matched,
  value,
  query,
  onOpen,
}: {
  artisan: Artisan;
  matched: MatchField;
  value: string;
  query: string;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      /* Grouped-list feedback: the row lights up rather than shrinking.
         A single row scaling inside a divided list reads as a glitch. */
      className="hover-fill flex w-full items-center gap-3 p-3.5 text-left transition-colors active:bg-fill"
    >
      <Avatar name={artisan.name} src={artisan.photo} size="size-12" />

      <span className="min-w-0 flex-1">
        <span className="headline flex items-center gap-1.5 text-ink">
          <span className="truncate">{artisan.name}</span>
          <BadgeCheck
            size={15}
            strokeWidth={2.2}
            className="shrink-0 text-accent"
            aria-label="Verified"
          />
        </span>
        <span className="caption mt-0.5 block truncate">
          <Marked text={TRADE_LABELS[artisan.trade]} query={query} /> ·{" "}
          <Marked text={artisan.location} query={query} />
        </span>
        <Reason matched={matched} value={value} query={query} />
      </span>

      <span className="figure flex shrink-0 items-center gap-1 text-sm text-ink">
        <Star
          size={13}
          strokeWidth={2.2}
          fill="currentColor"
          aria-hidden
          className="text-accent"
        />
        {artisan.rating.toFixed(1)}
      </span>
      <ChevronRight
        size={16}
        strokeWidth={2.2}
        aria-hidden
        className="shrink-0 text-faint"
      />
    </button>
  );
}

/**
 * Says why a row is here when the row wouldn't otherwise show it. A name,
 * trade or area match is already visible above, so repeating it would be
 * noise — a service or a line in the note is not.
 */
function Reason({
  matched,
  value,
  query,
}: {
  matched: MatchField;
  value: string;
  query: string;
}) {
  if (matched === "service") {
    return (
      <span className="caption mt-1 block truncate">
        Does <Marked text={value} query={query} />
      </span>
    );
  }

  if (matched === "note") {
    return (
      <span className="caption mt-1 block truncate">
        <Marked text={value} query={query} />
      </span>
    );
  }

  return null;
}

/**
 * The matched run, in ink against the caption's grey. Weight and colour
 * do the work — a highlight fill would be a second accent, and the app
 * only has one.
 */
function Marked({ text, query }: { text: string; query: string }) {
  return (
    <>
      {highlight(text, query).map((part, i) =>
        part.hit ? (
          <mark key={i} className="bg-transparent font-semibold text-ink">
            {part.text}
          </mark>
        ) : (
          <span key={i}>{part.text}</span>
        )
      )}
    </>
  );
}

/** Nothing found, or nothing loaded. Both say what to do next. */
function Notice({
  body,
  action,
  onAction,
}: {
  body: string;
  action: string;
  onAction: () => void;
}) {
  return (
    <div className="mt-6 rounded-2xl bg-card p-8 text-center">
      <p className="text-sm text-sub">{body}</p>
      <button
        type="button"
        onClick={onAction}
        className="pressable hover-fill mt-4 rounded-full bg-fill px-4 py-2 text-sm font-semibold text-ink"
      >
        {action}
      </button>
    </div>
  );
}
