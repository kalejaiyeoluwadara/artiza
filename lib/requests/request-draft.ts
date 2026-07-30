import type { ArtisanRequestInput, ArtisanRequestSource } from "../api/types";
import { toMsisdn } from "../admin/artisan-draft";

/**
 * The "find me someone" form, as the form holds it.
 *
 * Three fields, all of them required, and that ceiling is the design. Whoever
 * fills this in has just searched for a welder and been told there isn't one —
 * they are one tap from leaving, and every field past the phone number is
 * another reason to take it. Their name and where they live are things the
 * call itself can ask for; the form's only job is to earn the call.
 */
export interface RequestDraft {
  /**
   * Who they need, in their own words.
   *
   * Plain text rather than the trade picker every other form in the app uses,
   * and the reason is what this form is for. A picker can only offer trades
   * Artiza already recognises — but this only ever opens when the register had
   * nobody, so the most valuable answer is precisely the one that isn't on the
   * list. "Someone to polish marble steps" is a better brief than `tiler`, and
   * a dropdown would round it off to the wrong word before anyone read it.
   */
  need: string;
  details: string;
  phone: string;
}

/** The API's own limits, quoted so the fields can show them. */
export const REQUEST_LIMITS = {
  need: 60,
  details: 300,
  query: 80,
} as const;

/**
 * A fresh draft, seeded from wherever the customer gave up.
 *
 * A filtered browse screen knows the trade and a failed search knows the exact
 * words — either one goes straight into `need`, so the form usually opens with
 * its first field already answered and correct.
 */
export function blankRequest({ need = "" }: { need?: string } = {}) {
  return {
    need: need.slice(0, REQUEST_LIMITS.need),
    details: "",
    phone: "",
  } satisfies RequestDraft;
}

export type RequestErrors = Partial<Record<keyof RequestDraft, string>>;

/**
 * The same rules the API enforces, checked next to the field so a submit that
 * was never going to work fails before the round trip.
 */
export function validateRequest(draft: RequestDraft): RequestErrors {
  const errors: RequestErrors = {};

  if (draft.need.trim().length < 2) errors.need = "Who are you looking for?";
  else if (draft.need.length > REQUEST_LIMITS.need)
    errors.need = "That's too long.";

  if (draft.details.trim().length < 4)
    errors.details = "A line on the job helps us find the right person.";
  else if (draft.details.length > REQUEST_LIMITS.details)
    errors.details = "That's too long.";

  if (!/^234\d{10}$/.test(toMsisdn(draft.phone)))
    errors.phone = "Ten digits after +234, e.g. 803 123 4567.";

  return errors;
}

/** The draft in the shape `POST /requests` takes. */
export function toRequestInput(
  draft: RequestDraft,
  context: { source: ArtisanRequestSource; query?: string },
): ArtisanRequestInput {
  const query = context.query?.trim().slice(0, REQUEST_LIMITS.query);

  return {
    need: draft.need.trim(),
    details: draft.details.trim(),
    phone: toMsisdn(draft.phone),
    source: context.source,
    // Dropped rather than sent empty: the API validates any key present. Kept
    // even when it duplicates `need`, because the two diverge the moment
    // somebody edits the prefill, and only this one is what they searched.
    ...(query ? { query } : {}),
  };
}
