import { ApiError } from "../api/error";
import type { JoinDraft, JoinErrors } from "./join-draft";

/**
 * What went wrong on `/join`, said in words the artisan can act on.
 *
 * The API's own sentences are written for whoever is reading the logs:
 * class-validator hands back `"name must be longer than or equal to 2
 * characters"`, and a 500 arrives as `"Something went wrong."` with no hint
 * that the form is still filled in and safe. Someone on a phone, on paid data,
 * who was told this takes two minutes, needs three things from every failure:
 * what happened, whether their answers survived, and what to do next. This
 * module is where those three things are written down, once.
 *
 * It is join-scoped on purpose. The in-app `ApplySheet` speaks to a signed-in
 * applicant who can retry from a screen they already trust; `/join` is a
 * stranger's single shot at getting listed, so its copy carries more.
 */

export interface JoinFailure {
  /** The sentence shown above the button. Always says what to do next. */
  message: string;
  /** Anything the API blamed on a field we render, so it lands on the field. */
  fields: JoinErrors;
}

/** Field names as the form's own labels say them, for messages that name one. */
const FIELD_LABELS: Record<keyof JoinDraft, string> = {
  name: "full name",
  trade: "trade",
  location: "where you work",
  yearsExperience: "years of experience",
  phone: "phone number",
  whatsapp: "WhatsApp number",
  note: "description of your work",
  services: "services",
  work: "photos",
  consent: "permission",
};

/** Lowercased property name → the draft key it belongs to. */
const FIELD_BY_NAME = new Map<string, keyof JoinDraft>(
  (Object.keys(FIELD_LABELS) as (keyof JoinDraft)[]).map((key) => [
    key.toLowerCase(),
    key,
  ]),
);

/**
 * Which field a server validation sentence is about.
 *
 * class-validator always opens with the property name — `"phone must look
 * like…"`, `"yearsExperience must be an integer"` — so the first word carries
 * it. The custom messages that don't (consent's, which is written as a
 * sentence) are found by the words they do use.
 */
function fieldOf(message: string): keyof JoinDraft | undefined {
  const first = message.trim().split(/[\s.]+/)[0]?.toLowerCase() ?? "";
  const named = FIELD_BY_NAME.get(first);
  if (named) return named;

  if (/permission|consent/i.test(message)) return "consent";
  return undefined;
}

/**
 * A server validation sentence, rewritten for the person who typed the answer.
 *
 * Rewriting rather than passing through: `"name must be longer than or equal
 * to 2 characters"` tells an artisan nothing about what to type, and every one
 * of these rules is one the form already knows. The raw text is only consulted
 * to tell "too short" from "too long" — never shown.
 */
function rewrite(field: keyof JoinDraft, raw: string): string {
  const tooLong = /longer than|maximal|max length|shorter than or equal/i.test(
    raw,
  );

  switch (field) {
    case "name":
      return tooLong
        ? "That name is too long for a profile. Use the name customers call you."
        : "Enter your full name, at least two letters — this is what customers will see.";
    case "trade":
      return "Pick your trade from the list so customers can find you under it.";
    case "location":
      return tooLong
        ? "That's longer than we can print on a profile. Just the area is enough, like Babcock Road."
        : "Tell us the area you work in, like Babcock Road — customers search by area.";
    case "yearsExperience":
      return "Years of experience has to be a whole number of years, like 8. Round up if you're not sure.";
    case "phone":
      return "That phone number isn't a Nigerian mobile number. Ten digits after +234, like 803 123 4567.";
    case "whatsapp":
      return "That WhatsApp number isn't a Nigerian mobile number. Ten digits after +234, or leave it empty to use your phone number.";
    case "note":
      return tooLong
        ? "That's longer than a profile shows. Keep it to a line or two on the work you do."
        : "Write a line or two on the work you do — it's what a customer reads before calling.";
    case "services":
      return "One of your services was too long or there were too many. Keep each to a few words and remove any extras.";
    case "work":
      return "One of your photos didn't save. Remove it and add it again.";
    case "consent":
      return "Tick the box giving Artiza permission to list you — we can't publish a profile without it.";
  }
}

/** "Quote 8f2c… if you call" — only when the API actually sent an id. */
function reference(error: ApiError): string {
  return error.requestId
    ? ` If it keeps failing, call the Artiza team and quote reference ${error.requestId}.`
    : " If it keeps failing, call the Artiza team and we'll take your details over the phone.";
}

/** Every message that follows promises this, so it is written once. */
const KEPT = "Nothing you typed was lost — it's all still on this page.";

/**
 * Turns whatever `submit` caught into the sentence above the button, plus any
 * field-level errors worth moving up next to the input that caused them.
 */
export function describeJoinFailure(cause: unknown): JoinFailure {
  if (!(cause instanceof ApiError)) {
    // A bug in our own code rather than a rejected submission. Say that it
    // never left the phone, because "try again" is useless advice otherwise.
    return {
      message: `Something on this page broke before your details could be sent, so nothing reached Artiza. ${KEPT} Reload the page and try once more, or call the Artiza team and we'll fill this in for you.`,
      fields: {},
    };
  }

  if (cause.isOffline) {
    return {
      message: `Your phone couldn't reach Artiza — usually that means the data connection dropped for a moment. Nothing was sent. ${KEPT} Check your connection and press the button again.`,
      fields: {},
    };
  }

  // Deduped by phone: the number is already live, so this is the one failure
  // that is not a mistake — it means they're already on Artiza.
  if (cause.status === 409) {
    return {
      message: `${cause.message} You don't need to fill this in again — call the Artiza team and we'll update the listing that's already there.`,
      fields: {
        phone: "This number is already listed on Artiza.",
      },
    };
  }

  if (cause.status === 429) {
    return {
      message: `Artiza has paused submissions from this phone for a minute — it looks like the button was pressed several times in a row. ${KEPT} Wait a minute, then press it once more.`,
      fields: {},
    };
  }

  if (cause.status === 400 || cause.status === 422) {
    const fields: JoinErrors = {};
    const unplaced: string[] = [];

    for (const messages of Object.values(cause.details ?? {})) {
      for (const raw of messages) {
        const field = fieldOf(raw);
        // First one wins: a field with two broken rules gets the first fix,
        // and the second surfaces after that one is corrected.
        if (field && !fields[field]) fields[field] = rewrite(field, raw);
        else if (!field) unplaced.push(raw);
      }
    }

    const named = (Object.keys(fields) as (keyof JoinDraft)[]).map(
      (key) => FIELD_LABELS[key],
    );

    if (named.length > 0) {
      return {
        message: `Artiza couldn't accept ${list(named)}. ${KEPT} Fix what's marked below and press the button again.`,
        fields,
      };
    }

    // Rejected on a rule we don't render a field for. Passing the server's own
    // sentence through is worse than useless here, so it's said plainly and
    // the team is offered as the way out.
    return {
      message: `Artiza couldn't accept these details${unplaced.length ? `: ${unplaced[0].toLowerCase()}` : ""}. ${KEPT} Check your answers and try again, or call the Artiza team and we'll enter them for you.`,
      fields,
    };
  }

  if (cause.status >= 500) {
    return {
      message: `Artiza's server had a problem saving this — that's our fault, not yours, and nothing on your side is wrong. ${KEPT} Wait a moment and press the button again.${reference(cause)}`,
      fields: {},
    };
  }

  // Anything left: the status is quoted because it is the only thing that
  // makes an unknown failure reportable.
  return {
    message: `${cause.message} (error ${cause.status}). ${KEPT}${reference(cause)}`,
    fields: {},
  };
}

/**
 * The photo picker's failures. Uploads run on their own, before the form is
 * submitted, so they say what happened to *the photos* and never imply the
 * whole form is lost.
 */
export function describeUploadFailure(cause: unknown, count: number): string {
  const subject = count === 1 ? "That photo" : "Those photos";

  if (!(cause instanceof ApiError)) {
    return `${subject} couldn't be added — something on this page broke. Your answers are safe. Reload the page and add the photos again, or finish without them and we'll add them for you.`;
  }

  if (cause.isOffline) {
    return `${subject} didn't reach Artiza — the connection dropped part-way through the upload. Nothing was added, and your answers are safe. Try again when you have signal, or finish without photos.`;
  }

  if (cause.status === 413) {
    return `${subject} ${count === 1 ? "is" : "are"} too large for Artiza to accept. The limit is 8 MB per photo — take a new one at a lower quality, or pick a different one.`;
  }

  if (cause.status === 429) {
    return `Artiza has paused uploads from this phone for a minute — too many in a row. Wait a minute and add ${count === 1 ? "the photo" : "the photos"} again. Your answers are safe.`;
  }

  if (cause.status === 400) {
    // The upload pipe's own messages are already written for a person
    // ("Image must be a JPEG, PNG, WebP or HEIC."), so they're kept.
    return `${cause.message} ${subject === "That photo" ? "Pick another photo" : "Pick different photos"} and try again — the rest of your form is safe.`;
  }

  if (cause.status >= 500) {
    return `Artiza couldn't save ${count === 1 ? "that photo" : "those photos"} — the problem is on our side. Your answers are safe. Try again in a moment, or finish without photos and the team will add them.`;
  }

  return `${cause.message} (error ${cause.status}). Your answers are safe — try again, or finish without photos.`;
}

/** "your phone number and your trade" — a list a person would read out. */
function list(items: string[]): string {
  if (items.length === 1) return `your ${items[0]}`;
  const named = items.map((item) => `your ${item}`);
  return `${named.slice(0, -1).join(", ")} and ${named[named.length - 1]}`;
}
