import type { Trade } from "./artisans";
import { TRADE_LABELS } from "./artisans";
import type { OutreachLead, OutreachLeadInput } from "./api/types";

/**
 * The founding-artisan outreach list — the team's own contact book, not a
 * customer surface.
 *
 * Artiza launches with a register that has to already have people in it, and
 * those people are met in person around Ilisan and written down. This module is
 * everything between that spreadsheet and a WhatsApp conversation: reading the
 * file, making sense of however a number was written down, and composing the
 * message. It never sends anything — see {@link whatsappLink}.
 */

// ── The two questions a lead answers ─────────────────────────────────────────

export const OUTREACH_LABELS = {
  not_contacted: "Not contacted",
  contacted: "Contacted",
  responded: "Responded",
  follow_up: "Follow-up required",
} as const satisfies Record<string, string>;

export const APPROVAL_LABELS = {
  pending: "Pending",
  approved: "Approved",
  declined: "Declined",
} as const satisfies Record<string, string>;

export type OutreachStatus = keyof typeof OUTREACH_LABELS;
export type ApprovalStatus = keyof typeof APPROVAL_LABELS;

export const OUTREACH_STATUSES = Object.keys(
  OUTREACH_LABELS,
) as OutreachStatus[];
export const APPROVAL_STATUSES = Object.keys(
  APPROVAL_LABELS,
) as ApprovalStatus[];

/**
 * How each state prints as a tag.
 *
 * `accent` is spent only on the two rows that need a person to do something
 * today — nobody has messaged them, or the day to come back has arrived.
 * Everything settled is quiet, so a filtered list reads as a to-do rather than
 * a wall of colour. Declined is amber for the same reason errors are: with a
 * red accent, a red "declined" tag next to a red button reads as an action.
 */
export const OUTREACH_TONE: Record<OutreachStatus, "accent" | "quiet" | "danger"> =
  {
    not_contacted: "accent",
    contacted: "quiet",
    responded: "quiet",
    follow_up: "accent",
  };

export const APPROVAL_TONE: Record<ApprovalStatus, "accent" | "quiet" | "danger"> =
  {
    pending: "quiet",
    approved: "accent",
    declined: "danger",
  };

// ── Phone numbers ────────────────────────────────────────────────────────────

/** The shape `wa.me` and the rest of Artiza store a number in. */
const MSISDN = /^234\d{10}$/;

/**
 * Coerces however a Nigerian number was written into the stored form.
 *
 * A list kept by hand contains all four spellings of the same line —
 * `08031234567`, `8031234567`, `+234 803 123 4567`, `234-803-123-4567` — plus
 * whatever the phone's export put around them. All four are one artisan.
 *
 * Returns `null` when the digits can't be read as a Nigerian mobile number.
 * The caller keeps the original text in that case rather than dropping the row:
 * a number that needs a human to look at it is still the only way to reach that
 * artisan. This mirrors `normalizeNigerianPhone` on the API, which has the last
 * word — the two exist separately so the console can show the normalised number
 * in the import preview, before anything is written.
 */
export function normalizePhone(input: string): string | null {
  const digits = input.replace(/\D/g, "");
  const trimmed = digits.startsWith("00") ? digits.slice(2) : digits;

  if (MSISDN.test(trimmed)) return trimmed;
  if (/^0\d{10}$/.test(trimmed)) return `234${trimmed.slice(1)}`;
  if (/^[789]\d{9}$/.test(trimmed)) return `234${trimmed}`;

  return null;
}

/** `+234 803 123 4567`, or the raw text when it never parsed. */
export function displayPhone(phone: string): string {
  if (!MSISDN.test(phone)) return phone;
  const rest = phone.slice(3);
  return `+234 ${rest.slice(0, 3)} ${rest.slice(3, 6)} ${rest.slice(6, 10)}`;
}

// ── The message ──────────────────────────────────────────────────────────────

/** Titles that belong to the name, not in front of it. */
const HONORIFICS =
  /^(mr|mrs|miss|ms|dr|engr|arc|alhaji|alhaja|chief|pastor|imam|oga|madam)\.?$/i;

/**
 * What to call someone in the greeting.
 *
 * The first name, with a title kept if the list recorded one — "Mr Kunle"
 * where the spreadsheet said "Mr Kunle Adeyemi". Greeting an artisan with
 * their full legal name reads like a bank letter, and stripping a title they
 * were introduced with reads like a stranger.
 */
export function greetingName(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "there";
  if (words.length > 1 && HONORIFICS.test(words[0])) {
    return `${words[0].replace(/\.$/, "")} ${words[1]}`;
  }
  return words[0];
}

/**
 * The founding-artisan invitation.
 *
 * One message, the same for everyone but the name. It is written out in full
 * here rather than assembled from fragments because it is the first thing an
 * artisan ever reads about Artiza, and it should be editable by reading it.
 */
export function outreachMessage(name: string): string {
  return [
    `Hello ${greetingName(name)}, my name is Dara, founder of Artiza.`,
    "We're building Artiza, a platform that helps people discover trusted artisans and connect with them for their services.",
    "We'd love to invite you to become one of our Founding Artisans.",
    "Your profile would be listed on Artiza so potential customers can discover your work and contact you.",
    "There is no cost to join.",
    "Would you be interested in being listed?",
  ].join("\n\n");
}

/**
 * A `wa.me` link with the message already typed into the box.
 *
 * This is the whole of Artiza's WhatsApp integration, deliberately. Opening a
 * chat with a draft in it is something a person then reads and sends
 * themselves — there is no API key, no queue, and no way for this screen to
 * message anybody on its own. `wa.me` also means the number never has to be
 * saved to the phone first, which is the entire reason this dashboard exists.
 *
 * Returns `null` for a number that never normalised, since a malformed
 * `wa.me` link opens WhatsApp on an error rather than a conversation.
 */
export function whatsappLink(lead: {
  name: string;
  phone: string;
  whatsappReady: boolean;
}): string | null {
  if (!lead.whatsappReady) return null;
  return `https://wa.me/${lead.phone}?text=${encodeURIComponent(
    outreachMessage(lead.name),
  )}`;
}

// ── Reading the file ─────────────────────────────────────────────────────────

/**
 * A CSV row, split on commas that aren't inside quotes.
 *
 * Hand-written enough to be read: names carry commas ("Kunle Adeyemi, Jnr")
 * and notes carry them constantly, so a `split(",")` loses a column halfway
 * down the file. Quoted fields, doubled quotes inside them, and both line
 * endings are the whole of the format that a phone's contact export or a
 * Google Sheet actually produces.
 */
function splitRows(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;

  // A BOM from Excel would otherwise become part of the first header name.
  const source = text.replace(/^﻿/, "");

  for (let i = 0; i < source.length; i += 1) {
    const char = source[i];

    if (quoted) {
      if (char === '"') {
        if (source[i + 1] === '"') {
          field += '"';
          i += 1;
        } else quoted = false;
      } else field += char;
      continue;
    }

    if (char === '"') quoted = true;
    else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && source[i + 1] === "\n") i += 1;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else field += char;
  }

  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }

  return rows.filter((entry) => entry.some((cell) => cell.trim() !== ""));
}

/** Header text, reduced to something two spreadsheets can agree on. */
function key(header: string): string {
  return header.trim().toLowerCase().replace(/[^a-z]/g, "");
}

/**
 * Which column is which. Several spellings each, because the list has been
 * kept in more than one place and "Phone", "Phone Number" and "WhatsApp" are
 * all the same column.
 */
const COLUMNS: Record<string, string[]> = {
  name: ["name", "fullname", "artisan", "artisanname", "contactname"],
  phone: ["phone", "phonenumber", "number", "mobile", "whatsapp", "whatsappnumber", "tel"],
  trade: ["trade", "skill", "craft", "job", "profession", "category", "service"],
  outreach: ["outreachstatus", "outreach", "status", "contactstatus", "progress"],
  approval: ["approvalstatus", "approval", "decision", "approved"],
  notes: ["notes", "note", "comment", "comments", "remarks", "remark"],
};

function columnIndexes(headers: string[]): Record<string, number> {
  const found: Record<string, number> = {};

  headers.forEach((header, index) => {
    const cell = key(header);
    for (const [field, aliases] of Object.entries(COLUMNS)) {
      if (found[field] === undefined && aliases.includes(cell)) {
        found[field] = index;
      }
    }
  });

  return found;
}

/**
 * Trade text → a trade Artiza lists.
 *
 * Matches on the label or the key with everything but letters stripped, so
 * "POP installer", "pop installer" and "pop-installer" are all one trade.
 */
function toTrade(text: string): { trade: Trade; customTrade?: string } {
  const wanted = text.trim();
  if (!wanted) return { trade: "other" };

  const flat = wanted.toLowerCase().replace(/[^a-z]/g, "");

  for (const trade of Object.keys(TRADE_LABELS) as Trade[]) {
    const label = TRADE_LABELS[trade].toLowerCase().replace(/[^a-z]/g, "");
    if (flat === label || flat === trade.replace(/[^a-z]/g, "")) {
      return trade === "other"
        ? { trade: "other" }
        : { trade };
    }
  }

  // Not a trade Artiza lists. Kept verbatim under `other` rather than dropped:
  // the taxonomy is the customer's filter, but this is the team's own note of
  // what the artisan actually said they do.
  return { trade: "other", customTrade: wanted.slice(0, 40) };
}

/** Everything anyone writes in a status column, mapped onto the four states. */
function toOutreachStatus(text: string): OutreachStatus | undefined {
  const flat = key(text);
  if (!flat) return undefined;
  if (["notcontacted", "pending", "new", "todo", "notyet", "none"].includes(flat)) {
    return "not_contacted";
  }
  if (["contacted", "messaged", "sent", "reachedout", "called"].includes(flat)) {
    return "contacted";
  }
  if (["responded", "replied", "response", "answered"].includes(flat)) {
    return "responded";
  }
  if (["followup", "followuprequired", "follow", "callback", "revisit"].includes(flat)) {
    return "follow_up";
  }
  return undefined;
}

function toApprovalStatus(text: string): ApprovalStatus | undefined {
  const flat = key(text);
  if (!flat) return undefined;
  if (["approved", "yes", "accepted", "joined", "agreed"].includes(flat)) {
    return "approved";
  }
  if (["declined", "no", "rejected", "refused", "notinterested"].includes(flat)) {
    return "declined";
  }
  if (["pending", "undecided", "maybe", "thinking", "waiting"].includes(flat)) {
    return "pending";
  }
  return undefined;
}

export interface ParsedRow extends OutreachLeadInput {
  /** The number exactly as the file had it, when it could not be read. */
  rawPhone: string;
  /** True when `phone` is a number WhatsApp will take. */
  ready: boolean;
}

export interface ParsedCsv {
  rows: ParsedRow[];
  /** Which of the six columns were recognised, for the preview to report. */
  columns: string[];
  /** Rows with no name or no number — nothing to message. */
  skipped: number;
  /** Set when the file has no name or phone column at all. */
  problem?: string;
}

/**
 * Turn a CSV file into rows ready for the import endpoint.
 *
 * Everything about this is forgiving on purpose: the file is one person's
 * notes, not an export from a system, and the alternative to guessing at a
 * column header is making them re-type forty numbers. What it will not guess
 * at is a missing name or phone column — that is a file that was never the
 * outreach list, and importing it would fill the dashboard with rubbish.
 */
export function parseOutreachCsv(text: string): ParsedCsv {
  const rows = splitRows(text);
  if (rows.length === 0) {
    return { rows: [], columns: [], skipped: 0, problem: "That file is empty." };
  }

  const [headers, ...body] = rows;
  const at = columnIndexes(headers);

  if (at.name === undefined || at.phone === undefined) {
    return {
      rows: [],
      columns: [],
      skipped: 0,
      problem:
        "Couldn't find a name and a phone column. The first row of the file has to be the headers.",
    };
  }

  const cell = (row: string[], index?: number) =>
    index === undefined ? "" : (row[index] ?? "").trim();

  const parsed: ParsedRow[] = [];
  let skipped = 0;

  for (const row of body) {
    const name = cell(row, at.name);
    const rawPhone = cell(row, at.phone);

    if (!name || !rawPhone) {
      skipped += 1;
      continue;
    }

    const normalized = normalizePhone(rawPhone);

    parsed.push({
      name: name.slice(0, 80),
      phone: normalized ?? rawPhone.slice(0, 40),
      rawPhone,
      ready: normalized !== null,
      ...toTrade(cell(row, at.trade)),
      outreachStatus: toOutreachStatus(cell(row, at.outreach)),
      approvalStatus: toApprovalStatus(cell(row, at.approval)),
      notes: cell(row, at.notes).slice(0, 500) || undefined,
    });
  }

  return {
    rows: parsed,
    columns: Object.keys(at),
    skipped,
  };
}

// ── Reading the list back ────────────────────────────────────────────────────

/** Midnight tonight — anything dated before it is due. */
function endOfToday(): number {
  const date = new Date();
  date.setHours(23, 59, 59, 999);
  return date.getTime();
}

/** Whole days between two moments, counted as calendar days rather than 24s. */
function daysAgo(iso: string): number {
  const then = new Date(iso);
  then.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((today.getTime() - then.getTime()) / 86_400_000);
}

/** A follow-up whose date has arrived. */
export function isDue(lead: OutreachLead): boolean {
  return (
    lead.outreachStatus === "follow_up" &&
    lead.followUpAt !== undefined &&
    new Date(lead.followUpAt).getTime() <= endOfToday()
  );
}

/** "3 Aug", or "Today" / "Yesterday" for the two that get read most. */
export function shortDate(iso?: string): string {
  if (!iso) return "—";

  const days = daysAgo(iso);

  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days > 1 && days < 7) return `${days} days ago`;

  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}

/** A date the `<input type="date">` will accept, in local time. */
export function toDateInput(iso?: string): string {
  if (!iso) return "";
  const date = new Date(iso);
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

/**
 * The queue the "Next artisan" panel walks, in the order it walks it.
 *
 * Follow-ups that have come due go first — a promise to come back on Tuesday
 * is the only thing on this list with a date attached, and missing it costs
 * more than a lead nobody has started yet. Then everyone never contacted,
 * oldest first, so the list is worked from the top rather than the middle.
 */
export function outreachQueue(leads: OutreachLead[]): OutreachLead[] {
  const due = leads
    .filter(isDue)
    .sort((a, b) => (a.followUpAt ?? "").localeCompare(b.followUpAt ?? ""));

  const fresh = leads
    .filter((lead) => lead.outreachStatus === "not_contacted")
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  return [...due, ...fresh];
}
