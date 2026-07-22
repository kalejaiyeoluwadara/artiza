import { Artisan, TRADE_LABELS, Trade } from "./artisans";

/**
 * Free-text search over the register.
 *
 * The browse screen answers "show me tilers"; this answers "who does
 * marble?" — so it reads the whole profile, not just the trade. Ilisan is
 * one town and the register fits in memory, which is what makes a plain
 * scored scan the right tool: no index to keep in sync, and results land
 * on the keystroke rather than a round trip later.
 */

/** Which part of the profile a query landed on. */
export type MatchField = "name" | "trade" | "service" | "location" | "note";

export interface SearchHit {
  artisan: Artisan;
  /** The strongest single match, so the row can say why it's here. */
  field: MatchField;
  /** The text that matched — the service, the area, the trade. */
  value: string;
}

interface Field {
  field: MatchField;
  value: string;
  /** Score when the term opens the field, and when it merely appears in it. */
  lead: number;
  mid: number;
}

/**
 * What a query is allowed to match, and what each match is worth. The
 * order is the order someone means it: a name beats a trade beats a
 * service beats an area, and the note is a last resort — it's prose, so a
 * hit there is weak evidence.
 */
function fieldsOf(artisan: Artisan): Field[] {
  return [
    { field: "name", value: artisan.name, lead: 100, mid: 62 },
    { field: "trade", value: TRADE_LABELS[artisan.trade], lead: 90, mid: 56 },
    ...artisan.services.map((value) => ({
      field: "service" as const,
      value,
      lead: 72,
      mid: 46,
    })),
    { field: "location", value: artisan.location, lead: 60, mid: 38 },
    { field: "note", value: artisan.note, lead: 24, mid: 18 },
  ];
}

/** Case- and accent-insensitive, so "Bisi" and "bisi" are one query. */
function normalise(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

/**
 * A term scores highest opening the field, nearly as high opening any word
 * inside it, and lowest buried mid-word — "tile" should rank "Tiler" above
 * "Ceramic tiles", and both above a chance hit inside another word.
 */
function score(field: Field, term: string): number {
  const value = normalise(field.value);
  if (value.startsWith(term)) return field.lead;
  if (value.includes(` ${term}`)) return field.lead - 8;
  if (value.includes(term)) return field.mid;
  return 0;
}

/**
 * Every term has to land somewhere — "solar ilisan" narrows rather than
 * widens, which is what a second word is for. Ranking is the sum of each
 * term's best hit, so an artisan who satisfies both fields properly
 * outranks one who scrapes past on a note.
 */
export function searchArtisans(list: Artisan[], query: string): SearchHit[] {
  const terms = normalise(query).split(/\s+/).filter(Boolean);
  if (terms.length === 0) return [];

  const hits: (SearchHit & { total: number })[] = [];

  for (const artisan of list) {
    const fields = fieldsOf(artisan);
    let total = 0;
    let best: { points: number; field: Field } | null = null;
    let matchedEveryTerm = true;

    for (const term of terms) {
      let points = 0;
      let from: Field | null = null;

      for (const field of fields) {
        const value = score(field, term);
        if (value > points) {
          points = value;
          from = field;
        }
      }

      if (!from) {
        matchedEveryTerm = false;
        break;
      }

      total += points;
      if (!best || points > best.points) best = { points, field: from };
    }

    if (matchedEveryTerm && best) {
      hits.push({
        artisan,
        field: best.field.field,
        value: best.field.value,
        total,
      });
    }
  }

  // Relevance first; then the register's own order breaks ties, so a paid
  // slot never outranks a better answer but does win a coin toss.
  return hits
    .sort(
      (a, b) =>
        b.total - a.total ||
        Number(b.artisan.featured) - Number(a.artisan.featured) ||
        b.artisan.jobsCompleted - a.artisan.jobsCompleted
    )
    .map(({ artisan, field, value }) => ({ artisan, field, value }));
}

/**
 * Splits text into matched and unmatched runs so a row can show which
 * part of it the query hit. Matching runs on the raw text rather than the
 * normalised copy — folding accents would shift the indices off the
 * characters they belong to.
 */
export function highlight(
  text: string,
  query: string
): { text: string; hit: boolean }[] {
  const terms = query
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));

  if (terms.length === 0) return [{ text, hit: false }];

  return text
    .split(new RegExp(`(${terms.join("|")})`, "ig"))
    .filter(Boolean)
    .map((part) => ({
      text: part,
      hit: terms.some((term) => new RegExp(`^${term}$`, "i").test(part)),
    }));
}

/**
 * The trades the register can actually answer for, biggest first, each
 * with its depth. A trade nobody is listed under is left out rather than
 * offered as a tile that searches to nothing.
 *
 * The count is the point: it's the one thing the browse screen's rail
 * can't tell you, and it's what makes this a way in rather than a
 * second copy of the filter.
 */
export function tradeCounts(list: Artisan[]): { trade: Trade; count: number }[] {
  const counts = new Map<Trade, number>();
  for (const artisan of list) {
    counts.set(artisan.trade, (counts.get(artisan.trade) ?? 0) + 1);
  }

  return [...counts]
    .map(([trade, count]) => ({ trade, count }))
    .sort((a, b) => b.count - a.count || TRADE_LABELS[a.trade].localeCompare(TRADE_LABELS[b.trade]));
}

/**
 * The jobs people arrive with the words for — "marble", "burst pipes",
 * "inverter sizing". Trades are covered by their own tiles, so offering
 * them here as well would just be the same list twice.
 */
export function serviceSuggestions(list: Artisan[]): string[] {
  const services = [...new Set(list.flatMap((a) => a.services))];

  // Spread across the register rather than all taken off whoever happens
  // to be listed first.
  return services.filter((_, i) => i % 3 === 0).slice(0, 8);
}
