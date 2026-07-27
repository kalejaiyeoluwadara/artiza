import type { JoinInput } from "../api/types";
import {
  blankApplication,
  toApplicationInput,
  validateApplication,
  type ApplicationDraft,
} from "./application-draft";

/**
 * The `/join` form, as the form holds it.
 *
 * The in-app {@link ApplicationDraft} plus one field. Consent is a form
 * concern rather than an application one: someone applying from inside their
 * own account accepted the terms when they made it, where a founding artisan
 * opening a link from WhatsApp has agreed to nothing yet, and the box on the
 * page is the whole record of their permission.
 */
export interface JoinDraft extends ApplicationDraft {
  consent: boolean;
}

export function blankJoin(): JoinDraft {
  return { ...blankApplication(), consent: false };
}

export type JoinErrors = Partial<Record<keyof JoinDraft, string>>;

/**
 * The application's own rules, plus the tick that has to be there — said in
 * `/join`'s own words.
 *
 * The rules come from {@link validateApplication} so the two forms can never
 * accept different data, but the wording doesn't: the in-app sheet is talking
 * to someone with an account, inside an app they already understand, who can
 * ask a question from a screen they trust. `/join` is talking to an artisan on
 * a phone, from a link, with nobody to ask — so every message here has to say
 * what is wrong *and* what to type instead, and never assume the field label
 * was read. The condition is re-tested rather than the base message parsed;
 * matching on English would break the moment either sentence is rewritten.
 */
export function validateJoin(draft: JoinDraft): JoinErrors {
  const errors: JoinErrors = validateApplication(draft);

  if (errors.name) {
    errors.name =
      draft.name.trim().length < 2
        ? "Enter your full name — this is the name customers will see on your profile."
        : "That name is too long for a profile. Use the name customers call you.";
  }

  // The in-app sheet asks "Which part of Ilisan?", which is right for a form
  // shown inside an app the applicant already knows is a one-town register.
  // `/join` names no town — an artisan reading it should see a platform, not a
  // local noticeboard — so the prompt has to be as unplaced as the page is.
  if (errors.location) {
    errors.location = !draft.location.trim()
      ? "Tell us the area you work in, like Market Road — it's how customers nearby find you."
      : "That's longer than a profile shows. The area on its own is enough.";
  }

  if (errors.yearsExperience) {
    const years = Number(draft.yearsExperience);
    errors.yearsExperience =
      draft.yearsExperience === "" || !Number.isInteger(years) || years < 0
        ? "How many years have you done this work? A whole number, like 8 — round up if you're not sure."
        : "That's more years than we can list. Enter the years you've worked at this trade.";
  }

  if (errors.phone) {
    errors.phone =
      "That doesn't look like a Nigerian mobile number. Ten digits after +234, like 803 123 4567 — this is the number customers pay to reach.";
  }

  if (errors.whatsapp) {
    errors.whatsapp =
      "That doesn't look like a Nigerian mobile number. Ten digits after +234, or leave it empty if WhatsApp is on the number above.";
  }

  if (errors.note) {
    errors.note = !draft.note.trim()
      ? "Say what you do, in a line or two — this is what a customer reads before deciding to call."
      : "That's longer than a profile shows. Keep it to a line or two on the work you do.";
  }

  if (!draft.consent) {
    errors.consent =
      "Tick the box above — Artiza can't publish your name or give out your number without your permission.";
  }

  return errors;
}

/** The draft in the shape `POST /applications/join` takes. */
export function toJoinInput(draft: JoinDraft): JoinInput {
  return { ...toApplicationInput(draft), consent: true };
}
