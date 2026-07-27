import type { ApplicationInput } from "../api/types";
import type { Trade } from "../artisans";
import { toHandle, toMsisdn } from "../admin/artisan-draft";

/**
 * The application form, as the form holds it. Every field is a string because
 * that is what an `<input>` returns; the conversion to the API's shape happens
 * once, at submit, in {@link toApplicationInput}.
 *
 * Lighter than the admin `ArtisanDraft`: an applicant fills in who they are and
 * what they do, and the team supplies the rest (portrait, reply window,
 * verification) at approval.
 */
export interface ApplicationDraft {
  name: string;
  trade: Trade;
  /** Their own words, when `trade` is `other`. Empty otherwise. */
  customTrade: string;
  location: string;
  yearsExperience: string;
  phone: string;
  whatsapp: string;
  instagram: string;
  facebook: string;
  snapchat: string;
  note: string;
  services: string[];
  work: string[];
}

/** The API's own limits, quoted so the fields can show them. */
export const APPLICATION_LIMITS = {
  name: 80,
  location: 60,
  customTrade: 40,
  note: 240,
  instagram: 40,
  facebook: 60,
  snapchat: 40,
  service: 40,
  services: 12,
  work: 4,
  years: 70,
} as const;

export function blankApplication(name = ""): ApplicationDraft {
  return {
    name,
    trade: "plumber",
    customTrade: "",
    location: "",
    yearsExperience: "",
    phone: "",
    whatsapp: "",
    instagram: "",
    facebook: "",
    snapchat: "",
    note: "",
    services: [],
    work: [],
  };
}

export type ApplicationErrors = Partial<
  Record<keyof ApplicationDraft, string>
>;

function badPhone(value: string): boolean {
  return !/^234\d{10}$/.test(toMsisdn(value));
}

/**
 * Checks the draft against the same rules the API enforces, so a submit that
 * was never going to succeed fails here — next to the field, before the round
 * trip.
 */
export function validateApplication(
  draft: ApplicationDraft,
): ApplicationErrors {
  const errors: ApplicationErrors = {};

  if (draft.name.trim().length < 2) errors.name = "Enter your full name.";
  else if (draft.name.length > APPLICATION_LIMITS.name)
    errors.name = "That's too long.";

  if (draft.trade === "other" && !draft.customTrade.trim())
    errors.customTrade = "Tell us what your trade is called.";
  else if (draft.customTrade.length > APPLICATION_LIMITS.customTrade)
    errors.customTrade = "That's too long.";

  if (!draft.location.trim()) errors.location = "Which part of Ilisan?";
  else if (draft.location.length > APPLICATION_LIMITS.location)
    errors.location = "That's too long.";

  const years = Number(draft.yearsExperience);
  if (draft.yearsExperience === "" || !Number.isInteger(years) || years < 0)
    errors.yearsExperience = "A whole number of years.";
  else if (years > APPLICATION_LIMITS.years)
    errors.yearsExperience = `${APPLICATION_LIMITS.years} is the most we'll take.`;

  if (badPhone(draft.phone))
    errors.phone = "Ten digits after +234, e.g. 803 123 4567.";

  if (draft.whatsapp && badPhone(draft.whatsapp))
    errors.whatsapp = "Ten digits after +234, or leave it empty.";

  if (!draft.note.trim())
    errors.note = "One or two lines on the work you do.";
  else if (draft.note.length > APPLICATION_LIMITS.note)
    errors.note = "That's too long.";

  return errors;
}

/** The draft in the shape `POST /applications` takes. */
export function toApplicationInput(
  draft: ApplicationDraft,
): ApplicationInput {
  return {
    name: draft.name.trim(),
    trade: draft.trade,
    ...(draft.trade === "other"
      ? { customTrade: draft.customTrade.trim() }
      : {}),
    location: draft.location.trim(),
    yearsExperience: Number(draft.yearsExperience),
    phone: toMsisdn(draft.phone),
    // Dropped rather than sent empty: the API validates any key present.
    ...(draft.whatsapp ? { whatsapp: toMsisdn(draft.whatsapp) } : {}),
    ...socials(draft),
    note: draft.note.trim(),
    ...(draft.services.length ? { services: draft.services } : {}),
    ...(draft.work.length ? { work: draft.work } : {}),
  };
}

/**
 * The optional social handles, normalised and stripped of the empty ones.
 *
 * Pulled out of `toApplicationInput` because a pasted profile URL is the norm
 * rather than the exception — see {@link toHandle} — and three near-identical
 * ternaries inline would bury that.
 */
function socials(
  draft: Pick<ApplicationDraft, "instagram" | "facebook" | "snapchat">,
): Pick<ApplicationInput, "instagram" | "facebook" | "snapchat"> {
  const instagram = toHandle(draft.instagram);
  const facebook = toHandle(draft.facebook);
  const snapchat = toHandle(draft.snapchat);

  return {
    ...(instagram ? { instagram } : {}),
    ...(facebook ? { facebook } : {}),
    ...(snapchat ? { snapchat } : {}),
  };
}
