import type { AdminArtisan, ArtisanInput, ArtisanPatch } from "../api/types";
import { TRADE_LABELS, type Trade } from "../artisans";

/**
 * The listing form, as the form actually holds it.
 *
 * Every field is a string because that is what an `<input>` gives back, and
 * the conversion to the API's shape happens once, at submit, in `toInput`.
 * Holding `yearsExperience` as a number would mean deciding what an empty box
 * means on every keystroke — and the answer people expect ("nothing yet") is
 * not `0`, which is a real and different answer.
 */
export interface ArtisanDraft {
  name: string;
  trade: Trade;
  location: string;
  yearsExperience: string;
  phone: string;
  whatsapp: string;
  instagram: string;
  email: string;
  altPhone: string;
  respondsIn: string;
  availability: string;
  photo: string;
  work: string[];
  featured: boolean;
  verifiedMonth: string;
  verifiedYear: string;
  note: string;
  services: string[];
  jobsCompleted: string;
}

export const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
] as const;

/** The API's own limits, quoted here so the fields can show them. */
export const LIMITS = {
  name: 80,
  location: 60,
  note: 240,
  respondsIn: 80,
  availability: 80,
  instagram: 40,
  service: 40,
  services: 12,
  work: 12,
  years: 70,
} as const;

export const TRADE_OPTIONS = (
  Object.keys(TRADE_LABELS) as Trade[]
).map((trade) => ({ value: trade, label: TRADE_LABELS[trade] }));

export function blankDraft(): ArtisanDraft {
  const now = new Date();

  return {
    name: "",
    trade: "plumber",
    location: "",
    yearsExperience: "",
    phone: "",
    whatsapp: "",
    instagram: "",
    email: "",
    altPhone: "",
    // The two the team says out loud on every visit, pre-filled with what they
    // almost always say. An editor overwrites them; nobody has to invent them.
    respondsIn: "Usually replies within an hour",
    availability: "Mon–Sat, 8am–6pm",
    photo: "",
    work: [],
    featured: false,
    // Verification is what just happened, so today is the honest default.
    verifiedMonth: MONTHS[now.getMonth()],
    verifiedYear: String(now.getFullYear()),
    note: "",
    services: [],
    jobsCompleted: "",
  };
}

export function draftFrom(artisan: AdminArtisan): ArtisanDraft {
  const [month, year] = artisan.verifiedSince.split(" ");

  return {
    name: artisan.name,
    trade: artisan.trade,
    location: artisan.location,
    yearsExperience: String(artisan.yearsExperience),
    phone: nationalPart(artisan.phone),
    whatsapp: nationalPart(artisan.whatsapp ?? ""),
    instagram: artisan.instagram ?? "",
    email: artisan.email ?? "",
    altPhone: nationalPart(artisan.altPhone ?? ""),
    respondsIn: artisan.respondsIn,
    availability: artisan.availability,
    photo: artisan.photo,
    work: artisan.work,
    featured: artisan.featured,
    verifiedMonth: MONTHS.includes(month as (typeof MONTHS)[number])
      ? month
      : MONTHS[0],
    verifiedYear: /^\d{4}$/.test(year) ? year : String(new Date().getFullYear()),
    note: artisan.note,
    services: artisan.services,
    jobsCompleted: String(artisan.jobsCompleted),
  };
}

/**
 * The ten digits after the country code — what the field shows next to a fixed
 * "+234". Stored numbers are full MSISDNs, so this is what strips the code off
 * the way in; `toMsisdn` puts it back.
 */
function nationalPart(stored: string): string {
  return stored.replace(/^234/, "");
}

/**
 * Whatever was typed, as `234XXXXXXXXXX`.
 *
 * People write a Nigerian number four ways — `0803…`, `803…`, `+234 803 123
 * 4567`, `234803…` — and all four mean the same line. Rejecting three of them
 * on a form the team fills in from a scrap of paper would be pedantry, so they
 * are all accepted and normalised to the one shape the API stores.
 */
export function toMsisdn(input: string): string {
  const digits = input.replace(/\D/g, "");
  if (digits.startsWith("234")) return digits;
  if (digits.startsWith("0")) return `234${digits.slice(1)}`;
  return `234${digits}`;
}

export type DraftErrors = Partial<Record<keyof ArtisanDraft, string>>;

function badPhone(value: string): boolean {
  return !/^234\d{10}$/.test(toMsisdn(value));
}

/**
 * Checks the draft against the same rules the API enforces, so a save that was
 * never going to succeed fails here — next to the field, before the round trip,
 * and without the team wondering which of eighteen inputs the 422 meant.
 */
export function validateDraft(draft: ArtisanDraft): DraftErrors {
  const errors: DraftErrors = {};

  if (draft.name.trim().length < 2) errors.name = "Give their full name.";
  else if (draft.name.length > LIMITS.name) errors.name = "That's too long.";

  if (!draft.location.trim()) errors.location = "Which part of Ilisan?";
  else if (draft.location.length > LIMITS.location)
    errors.location = "That's too long.";

  const years = Number(draft.yearsExperience);
  if (draft.yearsExperience === "" || !Number.isInteger(years) || years < 0)
    errors.yearsExperience = "A whole number of years.";
  else if (years > LIMITS.years)
    errors.yearsExperience = `${LIMITS.years} is the most we'll take.`;

  if (badPhone(draft.phone))
    errors.phone = "Ten digits after +234, e.g. 803 123 4567.";

  if (draft.whatsapp && badPhone(draft.whatsapp))
    errors.whatsapp = "Ten digits after +234, or leave it empty.";

  if (draft.altPhone && badPhone(draft.altPhone))
    errors.altPhone = "Ten digits after +234, or leave it empty.";

  if (draft.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email))
    errors.email = "That doesn't look like an email address.";

  if (!draft.respondsIn.trim())
    errors.respondsIn = "Say how fast they usually reply.";

  if (!draft.availability.trim())
    errors.availability = "Say which days and hours they work.";

  if (!draft.photo) errors.photo = "A portrait is required.";

  if (!draft.note.trim()) errors.note = "One or two lines on how they work.";
  else if (draft.note.length > LIMITS.note) errors.note = "That's too long.";

  if (!/^\d{4}$/.test(draft.verifiedYear))
    errors.verifiedYear = "A four-digit year.";

  const jobs = Number(draft.jobsCompleted);
  if (draft.jobsCompleted !== "" && (!Number.isInteger(jobs) || jobs < 0))
    errors.jobsCompleted = "A whole number, or leave it empty.";

  return errors;
}

/** A new listing, in the shape `POST /admin/artisans` takes. */
export function toInput(draft: ArtisanDraft): ArtisanInput {
  const instagram = draft.instagram.trim().replace(/^@/, "");

  return {
    name: draft.name.trim(),
    trade: draft.trade,
    location: draft.location.trim(),
    yearsExperience: Number(draft.yearsExperience),
    phone: toMsisdn(draft.phone),
    contact: {
      // The optional channels are dropped rather than sent empty: the API
      // validates any key that is present, and "" is not a valid handle.
      ...(draft.whatsapp ? { whatsapp: toMsisdn(draft.whatsapp) } : {}),
      ...(instagram ? { instagram } : {}),
      ...(draft.email.trim() ? { email: draft.email.trim() } : {}),
      ...(draft.altPhone ? { altPhone: toMsisdn(draft.altPhone) } : {}),
      respondsIn: draft.respondsIn.trim(),
      availability: draft.availability.trim(),
    },
    photo: draft.photo,
    work: draft.work,
    featured: draft.featured,
    verifiedSince: `${draft.verifiedMonth} ${draft.verifiedYear}`,
    note: draft.note.trim(),
    services: draft.services,
    ...(draft.jobsCompleted ? { jobsCompleted: Number(draft.jobsCompleted) } : {}),
  };
}

/**
 * An edit, as a partial.
 *
 * `contact` is nested and the API replaces it wholesale, so it goes only when
 * something inside it moved — otherwise a name correction would quietly wipe
 * an Instagram handle nobody touched. `jobsCompleted` is left out entirely:
 * it is an import field, and the count is earned after that.
 */
export function toPatch(
  draft: ArtisanDraft,
  original: ArtisanDraft,
): ArtisanPatch {
  const next = toInput(draft);
  const before = toInput(original);
  const patch: ArtisanPatch = {};

  const scalars = [
    "name",
    "trade",
    "location",
    "yearsExperience",
    "phone",
    "photo",
    "featured",
    "verifiedSince",
    "note",
  ] as const;

  for (const key of scalars) {
    if (next[key] !== before[key]) {
      Object.assign(patch, { [key]: next[key] });
    }
  }

  if (JSON.stringify(next.work) !== JSON.stringify(before.work))
    patch.work = next.work;

  if (JSON.stringify(next.services) !== JSON.stringify(before.services))
    patch.services = next.services;

  if (JSON.stringify(next.contact) !== JSON.stringify(before.contact))
    patch.contact = next.contact;

  return patch;
}

/** Nothing to save is worth knowing: it turns the button off rather than firing. */
export function isUnchanged(patch: ArtisanPatch): boolean {
  return Object.keys(patch).length === 0;
}
