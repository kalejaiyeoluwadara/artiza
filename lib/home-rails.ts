/**
 * How home decides what goes in which row.
 *
 * The old arrangement asked each rail to sort the whole register on its own
 * and take the first six. That works on a Netflix-sized catalogue and falls
 * apart on a town-sized one, for two reasons this module exists to fix:
 *
 * 1. **Rails ranked on keys that were mostly zero.** Sixteen of the seventeen
 *    live artisans have no unlocks, no reviews and no rating, so every
 *    comparator returned 0, `Array.sort` kept the order it was given, and the
 *    order it was given is the API's `featured: -1` — which pinned the same
 *    four promoted artisans to the head of every single row.
 * 2. **Rails that ranked on the same key.** "Trending now" and "Top 10" both
 *    sorted on `recentUnlocks`, so trending was mathematically the first six
 *    of the top ten. Two headings, one list.
 *
 * The fix borrows the parts of Netflix's row assembly that survive a small
 * catalogue:
 *
 * - **A row has to earn its heading.** Every rail declares what makes an
 *   artisan eligible for it and how many eligible artisans it needs before it
 *   is worth printing. "Top 10 in Ilisan today" does not render over nine
 *   people who have never been unlocked — it stays dark until ten artisans
 *   have actually been unlocked, and switches itself on when they have.
 * - **Rows rank on genuinely different axes.** Top 10 is unlock volume;
 *   trending is unlock *momentum* against an artisan's own history, which is a
 *   different question and picks different people. The rails that carry the
 *   page today rank on experience, portfolio depth and reply speed — all of
 *   them real, populated fields rather than counters waiting for traffic.
 * - **Row blending.** Discovery rails claim the artisans they show, and a
 *   claimed artisan cannot fill a later discovery rail. This is the part that
 *   removes the repetition outright.
 * - **Promotion is a slot, not a multiplier.** At most one featured artisan
 *   per rail. A featured artisan the cap turns away is left unclaimed, so the
 *   next rail can take them — the cap spreads promoted artisans down the page
 *   instead of stacking them at the top of all of it.
 * - **Ties rotate.** Artisans level on a rail's own measure are ordered by a
 *   hash of their id mixed with the date, so a tied group cycles through the
 *   front of the rail across the week instead of one canonical order winning
 *   every day forever.
 *
 * Trade rails are deliberately outside all of this. They are a directory cut,
 * not a recommendation, and an artisan appearing both in "Most experienced"
 * and under their own trade is not repetition — it is the index working.
 */

import {
  Artisan,
  TRADE_LABELS,
  Trade,
  verifiedMonth,
} from "./artisans";

/**
 * Which measure a rail sorted on, for the poster to print. A name rather than
 * a rendered node so this module stays free of JSX — `NetflixHome` maps these
 * to the actual signal components.
 */
export type RailSignal =
  | "rating"
  | "unlocks"
  | "verified"
  | "years"
  | "responds"
  | "work";

export interface HomeRail {
  /** Stable across renders — the React key, and the a11y heading id. */
  id: string;
  heading: string;
  artisans: Artisan[];
  signal: RailSignal;
  /** Set on trade rails, which offer "See all" into the filtered register. */
  trade?: Trade;
}

/* ── Rotation ──────────────────────────────────────────────────────────── */

const DAY_MS = 86_400_000;

/**
 * The rotation seed: whole days since the epoch, UTC.
 *
 * Read on the server in `app/page.tsx` and handed to the client as a prop
 * rather than computed in both places. Home is a client component that also
 * server-renders, and the page is revalidated on a timer — so a render that
 * straddled UTC midnight would otherwise hash one way in the cached HTML and
 * another way on hydration, which React reports as a mismatch. One value,
 * passed down, cannot disagree with itself.
 */
export function dayIndex(now: number = Date.now()): number {
  return Math.floor(now / DAY_MS);
}

/**
 * FNV-1a over the artisan's id, seeded by the day and finished with murmur3's
 * avalanche. Cheap, well spread, and — the only property that actually matters
 * here — identical on the server and in the browser for the same two inputs.
 *
 * The day seeds the hash rather than being appended to the id, and the
 * finalizer is not optional. Hashing `${id}:${day}` looks equivalent and is
 * not: FNV mixes left to right, so trailing characters get one multiply before
 * the hash is read, and rolling the date over moved every key by the same
 * `charDelta * 0x01000193`. The relative order survived almost intact and the
 * rotation quietly did nothing. Seeding at the front puts the day through
 * every multiply in the loop, and the avalanche spreads the last character's
 * influence across all 32 bits.
 */
function rotationKey(id: string, day: number): number {
  let hash = Math.imul(0x811c9dc5 ^ day, 0x01000193);
  for (let i = 0; i < id.length; i++) {
    hash ^= id.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  hash ^= hash >>> 16;
  hash = Math.imul(hash, 0x85ebca6b);
  hash ^= hash >>> 13;
  hash = Math.imul(hash, 0xc2b2ae35);
  hash ^= hash >>> 16;
  return hash >>> 0;
}

/**
 * The last word in every comparator below. Two artisans a rail cannot tell
 * apart are ordered by the day's rotation instead of by whatever order the
 * API happened to return — which is the single change that stops promoted
 * artisans leading rows they did not win on merit.
 */
function byRotation(day: number) {
  return (a: Artisan, b: Artisan) =>
    rotationKey(a.id, day) - rotationKey(b.id, day);
}

/** Chains a rail's own measure in front of the rotation tie-break. */
function ordered(
  measure: (a: Artisan, b: Artisan) => number,
  day: number,
): (a: Artisan, b: Artisan) => number {
  const rotate = byRotation(day);
  return (a, b) => measure(a, b) || rotate(a, b);
}

/* ── Promotion ─────────────────────────────────────────────────────────── */

/** How many featured artisans any one row may carry. */
const FEATURED_PER_RAIL = 1;

/**
 * Thins a rail down to one promoted artisan, keeping the order it arrived in.
 *
 * The survivor keeps whatever position it earned, so a featured artisan that
 * genuinely tops the measure still leads the row — the cap only stops the
 * second, third and fourth from stacking underneath. Because this runs before
 * the rail claims anybody, the ones it turns away stay available to the rails
 * below, which is what spreads promotion down the page rather than removing it.
 */
export function capFeatured(
  list: Artisan[],
  max: number = FEATURED_PER_RAIL,
): Artisan[] {
  let used = 0;
  return list.filter((artisan) => {
    if (!artisan.featured) return true;
    if (used >= max) return false;
    used += 1;
    return true;
  });
}

/* ── Rail specifications ───────────────────────────────────────────────── */

/** How many posters a discovery rail carries when it has the artisans. */
const RAIL_SIZE = 6;

/**
 * Below this many posters a rail is not a row, it's a leftover — so it doesn't
 * print. This is what a rail starved by the rails above it does: it disappears,
 * rather than showing two artisans under a confident heading.
 */
const MIN_POSTERS = 3;

/** Reviews before a rating means anything. A 5.0 off two jobs is a sample. */
const RATED_THRESHOLD = 15;

/** Months an artisan counts as newly verified for. */
const NEW_WINDOW = 4;

interface RailSpec {
  id: string;
  heading: string;
  signal: RailSignal;
  /** Who this rail is even allowed to show. The rail's claim, as a predicate. */
  qualify: (artisan: Artisan) => boolean;
  /** Ranks qualifiers. The rotation tie-break is appended by the composer. */
  measure: (a: Artisan, b: Artisan) => number;
  /**
   * Qualifiers required — counted before dedup — or the rail does not render.
   * This is the evidence gate: it is what keeps a heading from making a claim
   * the register cannot back up yet.
   */
  min: number;
  size?: number;
}

/**
 * The discovery rails, in the order they pick.
 *
 * Order is priority: an earlier rail gets first refusal on the register, so
 * the rails making the most specific claims come first and the ones that could
 * be said of almost anybody come last. "New on Artiza" is last precisely
 * because every live artisan was verified this month — it is the least
 * discriminating heading on the page, so it mops up rather than leading.
 */
const RAILS: RailSpec[] = [
  {
    /* Netflix's Top 10 is a strict count, not a window — it is always ten and
       the rank is the entire point, which is exactly why it cannot run short.
       Nine unlocked artisans and a filler is not a top ten. */
    id: "top-ten",
    heading: "Top 10 in Ilisan today",
    signal: "unlocks",
    qualify: (a) => a.recentUnlocks > 0,
    measure: (a, b) => b.recentUnlocks - a.recentUnlocks,
    min: 10,
    size: 10,
  },
  {
    /* Volume is already the chart above. Trending is the other question:
       who is busier this month than their own history would predict. A
       long-established artisan having a normal month scores low here even
       though their raw count is high, and a newer one with a sudden run of
       unlocks scores high — which is what "trending" is supposed to mean, and
       it picks a visibly different set to the row above. */
    id: "trending",
    heading: "Trending now",
    signal: "unlocks",
    qualify: (a) => a.recentUnlocks > 0,
    measure: (a, b) => momentum(b) - momentum(a),
    min: 4,
  },
  {
    id: "top-rated",
    heading: "Top rated",
    signal: "rating",
    qualify: (a) => a.reviewCount >= RATED_THRESHOLD,
    measure: (a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount,
    min: 4,
  },
  {
    /* Years on the job is the one credibility signal every artisan arrives
       with — it does not have to be earned through traffic the way ratings and
       unlocks do. On a register this young it is carrying the page. */
    id: "experience",
    heading: "Longest on the job",
    signal: "years",
    qualify: (a) => a.yearsExperience >= 5,
    measure: (a, b) => b.yearsExperience - a.yearsExperience,
    min: 4,
  },
  {
    id: "portfolio",
    heading: "See their work",
    signal: "work",
    qualify: (a) => a.work.length >= 3,
    measure: (a, b) => b.work.length - a.work.length,
    min: 4,
  },
  {
    id: "responds",
    heading: "Quick to reply",
    signal: "responds",
    qualify: (a) => replyRank(a) < REPLY_SLOW,
    measure: (a, b) => replyRank(a) - replyRank(b),
    min: 4,
  },
  {
    id: "arrivals",
    heading: "New on Artiza",
    signal: "verified",
    qualify: () => true, // narrowed to the window in `composeHome`, which
    // needs the whole register to know what "recent" currently means.
    measure: (a, b) => verifiedMonth(b) - verifiedMonth(a),
    min: MIN_POSTERS,
  },
];

/**
 * Unlocks this month as a share of the artisan's whole record. Guarded at one
 * job so a brand-new artisan's first unlock doesn't divide by zero into a
 * score nobody can beat.
 */
function momentum(artisan: Artisan): number {
  return artisan.recentUnlocks / Math.max(artisan.jobsCompleted, 1);
}

/** Anything at or past this is not a "quick" reply. */
const REPLY_SLOW = 3;

/**
 * `respondsIn` is prose written by the team at verification, not an enum, so
 * it gets read rather than compared. Unrecognised wording sorts slow — a rail
 * about reply speed should never promote an artisan on a phrase it failed to
 * understand.
 */
function replyRank(artisan: Artisan): number {
  const text = artisan.respondsIn.toLowerCase();
  if (text.includes("minute")) return 0;
  if (text.includes("hour")) return text.includes("hours") ? 2 : 1;
  return REPLY_SLOW;
}

/* ── Trade rails ───────────────────────────────────────────────────────── */

/** Artisans a trade needs before it is worth a row of its own. */
const TRADE_RAIL_MIN = 3;

/**
 * The families thin trades fall back into, mirroring the groups
 * `TRADE_LABELS` is already written in.
 *
 * A town register fragments: one welder, one roofer, one surveyor. Under the
 * old rule none of them reached three and every trade rail vanished, which is
 * why home had nothing below the discovery rows. Netflix's answer to a genre
 * too thin to fill a row is a broader genre, not a shorter row — so a trade
 * that can't stand alone is browsed under the job it belongs to.
 */
const TRADE_FAMILIES: { label: string; trades: Trade[] }[] = [
  {
    label: "For your build",
    trades: [
      "plumber",
      "electrician",
      "carpenter",
      "tiler",
      "painter",
      "bricklayer",
      "welder",
      "roofer",
      "pop-installer",
      "aluminium-fabricator",
      "borehole-driller",
      "builder",
      "iron-bender",
    ],
  },
  {
    label: "Power and cooling",
    trades: [
      "solar-installer",
      "generator-technician",
      "ac-technician",
      "cctv-installer",
      "satellite-installer",
      "appliance-repair",
    ],
  },
  {
    label: "Devices and design",
    trades: ["phone-repair", "computer-repair", "graphic-artist"],
  },
  {
    label: "For your vehicle",
    trades: [
      "auto-mechanic",
      "auto-electrician",
      "panel-beater",
      "vulcanizer",
      "transporter",
    ],
  },
  {
    label: "Around the house",
    trades: [
      "laundry",
      "cleaner",
      "fumigator",
      "gardener",
      "upholsterer",
      "interior-decorator",
      "tailor",
      "hairstylist",
      "barber",
      "caterer",
      "event-decorator",
      "photographer",
    ],
  },
  {
    label: "Building supplies",
    trades: ["building-materials", "cement-distributor", "sawmiller"],
  },
  {
    label: "Before you build",
    trades: ["architect", "surveyor", "estate-agent", "lawyer"],
  },
];

/* ── Composition ───────────────────────────────────────────────────────── */

/**
 * Builds every row on home, in order, in one pass.
 *
 * `claimed` is the row-blending state: a discovery rail claims what it shows,
 * and no later discovery rail may show it again. Trade rails run afterwards
 * against the untouched register, because a directory is allowed to restate.
 */
export function composeHome(artisans: Artisan[], day: number): HomeRail[] {
  const rails: HomeRail[] = [];
  const claimed = new Set<string>();
  /* Which rail each artisan could legitimately have gone in, whether or not it
     took them — the promotion sweep at the bottom needs this to place a
     featured artisan under a heading that is still true of them. */
  const eligibleFor = new Map<string, string[]>();

  /* What "recently verified" currently means. Anchored to the newest artisan
     on the register rather than to today, so a quiet month empties the rail
     out instead of calling a January listing new. */
  const newest =
    artisans.length > 0 ? Math.max(...artisans.map(verifiedMonth)) : 0;

  for (const spec of RAILS) {
    const qualifies = (a: Artisan) =>
      spec.id === "arrivals"
        ? newest - verifiedMonth(a) < NEW_WINDOW
        : spec.qualify(a);

    /* The evidence gate, counted across the whole register and before dedup.
       A rail is either supportable or it isn't — that must not depend on what
       the rails above it happened to take. */
    const eligible = artisans.filter(qualifies);
    if (eligible.length < spec.min) continue;

    for (const a of eligible) {
      eligibleFor.set(a.id, [...(eligibleFor.get(a.id) ?? []), spec.id]);
    }

    const picked = capFeatured(
      eligible
        .filter((a) => !claimed.has(a.id))
        .sort(ordered(spec.measure, day)),
    ).slice(0, spec.size ?? RAIL_SIZE);

    // Starved by the rails above it. A short row under a confident heading
    // reads as a bug, so it doesn't print.
    if (picked.length < MIN_POSTERS) continue;

    for (const artisan of picked) claimed.add(artisan.id);
    rails.push({
      id: spec.id,
      heading: spec.heading,
      artisans: picked,
      signal: spec.signal,
    });
  }

  const composed = [...rails, ...tradeRails(artisans, day)];
  deliverPromotions(artisans, composed, eligibleFor);
  return composed;
}

/**
 * The safety net under the one-featured-per-rail cap.
 *
 * The cap turns away extra promoted artisans so the next rail can take them,
 * which works until there are more featured artisans than rails willing to
 * carry one — then the last of them falls off the page entirely. That is a
 * paid placement quietly not being delivered, so it can't be left to chance:
 * anyone promoted who ended up on no rail at all is added to the last rail
 * they genuinely qualified for.
 *
 * They go on the **end** of it, not the front. The cap exists to stop promoted
 * artisans stacking at the top of every row, and appending doesn't touch that
 * — the lead slot is still won once and only once.
 */
function deliverPromotions(
  artisans: Artisan[],
  composed: HomeRail[],
  eligibleFor: Map<string, string[]>,
): void {
  const surfaced = new Set(composed.flatMap((r) => r.artisans.map((a) => a.id)));

  for (const artisan of artisans) {
    if (!artisan.featured || surfaced.has(artisan.id)) continue;

    const eligible = eligibleFor.get(artisan.id) ?? [];
    const home = [...composed]
      .reverse()
      .find((rail) => eligible.includes(rail.id));

    // No rail on the page can honestly describe them — better absent from
    // home than sitting under a heading that isn't true.
    if (!home) continue;

    home.artisans = [...home.artisans, artisan];
    surfaced.add(artisan.id);
  }
}

/**
 * The directory half of the page: a row per trade that can fill one, then a
 * row per family for everything left over.
 */
function tradeRails(artisans: Artisan[], day: number): HomeRail[] {
  const byTrade = new Map<Trade, Artisan[]>();
  for (const artisan of artisans) {
    byTrade.set(artisan.trade, [...(byTrade.get(artisan.trade) ?? []), artisan]);
  }

  const own = [...byTrade.entries()]
    .filter(([, list]) => list.length >= TRADE_RAIL_MIN)
    .sort((a, b) => b[1].length - a[1].length);

  const rails: HomeRail[] = own.map(([trade, list]) => ({
    id: `trade-${trade}`,
    heading: `${TRADE_LABELS[trade]}s in Ilisan`,
    artisans: rankArtisans(list, day),
    signal: "years" as const,
    trade,
  }));

  // Only trades that couldn't carry a row of their own fall back to a family
  // row — otherwise a trade would be listed twice, once under each heading.
  const spent = new Set(own.map(([trade]) => trade));
  for (const family of TRADE_FAMILIES) {
    const list = family.trades
      .filter((trade) => !spent.has(trade))
      .flatMap((trade) => byTrade.get(trade) ?? []);
    if (list.length < TRADE_RAIL_MIN) continue;
    rails.push({
      id: `family-${family.label.replace(/\W+/g, "-").toLowerCase()}`,
      heading: family.label,
      artisans: rankArtisans(list, day),
      signal: "years",
    });
  }

  return rails;
}

/**
 * The browse order, used by trade rails and by filtered results.
 *
 * Was "featured first, then jobs completed", which on a register where almost
 * every artisan has zero completed jobs meant "featured first, then whatever
 * the API said" — the promoted block at the top of every list. Now promotion
 * buys one lead slot, the rest is record, and artisans level on record rotate.
 */
export function rankArtisans(list: Artisan[], day: number = 0): Artisan[] {
  const ranked = [...list].sort(
    ordered((a, b) => b.jobsCompleted - a.jobsCompleted, day),
  );

  /* One promoted artisan is lifted to the front; every other featured artisan
     keeps whatever position their record earned. Nobody is demoted — the
     difference from the old rule is only that promotion stops compounding. */
  const lead = ranked.findIndex((a) => a.featured);
  if (lead <= 0) return ranked;
  return [ranked[lead], ...ranked.slice(0, lead), ...ranked.slice(lead + 1)];
}
