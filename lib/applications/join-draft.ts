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

/** The application's own rules, plus the tick that has to be there. */
export function validateJoin(draft: JoinDraft): JoinErrors {
  const errors: JoinErrors = validateApplication(draft);

  if (!draft.consent) {
    errors.consent = "We need your permission before we can list you.";
  }

  return errors;
}

/** The draft in the shape `POST /applications/join` takes. */
export function toJoinInput(draft: JoinDraft): JoinInput {
  return { ...toApplicationInput(draft), consent: true };
}
