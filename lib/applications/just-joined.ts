"use client";

import { useEffect, useMemo, useSyncExternalStore } from "react";
import type { Artisan } from "../artisans";
import type { JoinResult } from "../api/types";
import type { JoinDraft } from "./join-draft";

/**
 * The artisan who finished `/join` a moment ago, carried to home.
 *
 * Home reads a register that is cached — on the server by the framework, in
 * the browser by `useData`'s store — for good reasons that all work against
 * one person: the artisan who has just been told "you're on Artiza", taps
 * "See Artiza", and lands on a page that does not have them in it yet. For up
 * to a minute they are told they are live and then shown evidence they aren't.
 *
 * So the page carries them across itself. Everything on a fresh listing is
 * already on the device that filled the form in, and the API hands back the
 * live artisan's id, so home can put a real, tappable profile at the front of
 * "New on Artiza" straight away and let the register replace it the moment the
 * register catches up.
 */

const KEY = "artiza:just-joined";

/**
 * How long the carried profile stays interesting. Long enough to cover the
 * read that brings them into the register for real, short enough that it never
 * becomes a second, staler copy of a listing they have since had corrected.
 */
const TTL_MS = 10 * 60_000;

/** What the team fills in on the verification visit, until they have. */
const RESPONDS_IN = "Usually replies within a day";
const AVAILABILITY = "Contact for availability";

interface Stored {
  at: number;
  artisan: Artisan;
}

/** "Mar 2026" — the same stamp the API writes onto a new listing. */
function thisMonth(): string {
  return new Date().toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

/**
 * The listing the API just created, rebuilt from the form that created it.
 *
 * Not a guess: every field here is either something they typed or the same
 * default the server applies in `toArtisanInput`. The counters are zero
 * because they genuinely are — this is an artisan with no jobs, no unlocks and
 * no reviews yet, and the poster should say so rather than flatter them.
 */
export function toJustJoined(draft: JoinDraft, result: JoinResult): Artisan {
  return {
    id: result.artisanId ?? result.id,
    name: result.name,
    trade: result.trade,
    // What they call the work, when the taxonomy had no word for it — the
    // poster reads `tradeName`, so without this an "other" listing would show
    // itself the bare word "Other".
    ...(draft.trade === "other" && draft.customTrade.trim()
      ? { customTrade: draft.customTrade.trim() }
      : {}),
    location: draft.location.trim(),
    yearsExperience: Number(draft.yearsExperience) || 0,
    jobsCompleted: 0,
    recentUnlocks: 0,
    rating: 0,
    reviewCount: 0,
    photo: draft.work[0] ?? "",
    work: draft.work,
    featured: false,
    verifiedSince: thisMonth(),
    note: draft.note.trim(),
    services: draft.services,
    respondsIn: RESPONDS_IN,
    availability: AVAILABILITY,
  };
}

/**
 * Leave it for home to pick up. `sessionStorage` rather than a query param or
 * router state: the profile is four or five fields wide, it belongs to this
 * tab only, and it has to survive the artisan wandering off to Search and back
 * before the register has refreshed.
 */
export function rememberJustJoined(artisan: Artisan): void {
  try {
    const stored: Stored = { at: Date.now(), artisan };
    sessionStorage.setItem(KEY, JSON.stringify(stored));
  } catch {
    // Private mode, a full quota, a browser that says no — the artisan still
    // joined, and home is only a minute behind. Nothing here is worth an error.
  }
  announce();
}

export function clearJustJoined(): void {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    // As above.
  }
  announce();
}

// ── The store behind the hook ──────────────────────────────────────────────
//
// `sessionStorage` is an external store that doesn't exist while the page is
// being rendered on the server, which is exactly the shape `useSyncExternalStore`
// is for: it hands the server (and the hydrating client) the empty snapshot, so
// the first paint matches the HTML, then re-renders with what is really there.

const listeners = new Set<() => void>();

function announce(): void {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/* The snapshot has to be referentially stable between changes or React will
   re-render forever, and parsing JSON returns a new object every call — so the
   parse is memoised against the raw string it came from. */
let cache: { raw: string | null; artisan?: Artisan } = { raw: null };

function snapshot(): Artisan | undefined {
  let raw: string | null = null;
  try {
    raw = sessionStorage.getItem(KEY);
  } catch {
    return undefined;
  }

  if (raw !== cache.raw) cache = { raw, artisan: parse(raw) };
  return cache.artisan;
}

/** Nothing, on the server and on the render that has to match it. */
function noSnapshot(): undefined {
  return undefined;
}

/** What was left, if anything, and if it is still recent enough to show. */
function parse(raw: string | null): Artisan | undefined {
  if (!raw) return undefined;
  try {
    const stored = JSON.parse(raw) as Stored;
    if (!stored?.artisan?.id || Date.now() - stored.at > TTL_MS) return undefined;
    return stored.artisan;
  } catch {
    // Anything unreadable is something this version didn't write. Ignore it.
    return undefined;
  }
}

/**
 * The register with the just-joined artisan in front of it, and the artisan
 * themselves so a rail can pin them rather than hope the sort agrees.
 *
 * The carried profile only appears on the render after hydration, because
 * `sessionStorage` does not exist on the server and the first client render
 * has to match the HTML that arrived.
 *
 * The moment the real read comes back carrying them, the carried copy is
 * dropped and forgotten: the register's version is the true one, and holding
 * a local shadow of a record the team may already have edited is exactly the
 * bug this is meant to avoid.
 */
export function useJustJoined(artisans: Artisan[]): {
  artisans: Artisan[];
  joined?: Artisan;
} {
  const carried = useSyncExternalStore(subscribe, snapshot, noSnapshot);

  const landed =
    carried !== undefined && artisans.some((a) => a.id === carried.id);

  /* Forgetting is a write to storage, not to React state — the store then
     tells this hook, and every other one reading it, that it changed. */
  useEffect(() => {
    if (landed) clearJustJoined();
  }, [landed]);

  const joined = landed ? undefined : carried;

  return useMemo(
    () => ({
      artisans: joined ? [joined, ...artisans] : artisans,
      joined,
    }),
    [joined, artisans],
  );
}

/**
 * The just-joined artisan, first, exactly once.
 *
 * "New on Artiza" sorts by verification month, and every listing made this
 * month ties — which would leave someone who joined ninety seconds ago sitting
 * behind six people who joined in the same month. The whole promise being kept
 * here is *see yourself now*, so the rail pins them instead of sorting them.
 */
export function pinJustJoined(
  rail: Artisan[],
  joined: Artisan | undefined,
): Artisan[] {
  if (!joined) return rail;
  return [joined, ...rail.filter((a) => a.id !== joined.id)];
}
