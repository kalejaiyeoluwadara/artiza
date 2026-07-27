"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, ImageUp, Loader2, Trash2, TriangleAlert } from "lucide-react";
import {
  FormSection,
  TagField,
  TextArea,
  TextField,
} from "../admin/Fields";
import { TradeField } from "../TradeField";
import { publicApi } from "../../lib/api";
import {} from "../../lib/admin/artisan-draft";
import { APPLICATION_LIMITS } from "../../lib/applications/application-draft";
import {
  blankJoin,
  toJoinInput,
  validateJoin,
  type JoinDraft,
  type JoinErrors,
} from "../../lib/applications/join-draft";
import {
  describeJoinFailure,
  describeUploadFailure,
} from "../../lib/applications/join-errors";
import {
  rememberJustJoined,
  toJustJoined,
} from "../../lib/applications/just-joined";
import { tradeName } from "../../lib/artisans";
import type { JoinResult } from "../../lib/api/types";

/** What the upload path accepts, said out loud so the copy and the picker agree. */
const ACCEPT = "image/jpeg,image/png,image/webp,image/heic,image/heif";
const ACCEPTED_TYPES = new Set(ACCEPT.split(","));
const MAX_BYTES = 8 * 1024 * 1024;

/** "12.4 MB" — so an oversized photo can be told how far over it is. */
function megabytes(bytes: number): string {
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/**
 * The claim form behind `artizahq.com/join`.
 *
 * A cousin of `ApplySheet`, and deliberately not a reuse of it. The sheet is a
 * signed-in stranger asking to be considered, so it is a modal over the app and
 * it promises a verification visit. This is a full page for someone who has
 * never seen Artiza, arriving from a WhatsApp message, whose vetting already
 * happened in person — so it has to introduce the product before it asks for
 * anything, and it promises the opposite: that they are live when they finish.
 */
export function JoinForm() {
  const [draft, setDraft] = useState<JoinDraft>(blankJoin);
  const [errors, setErrors] = useState<JoinErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [failure, setFailure] = useState<string>();
  const [result, setResult] = useState<JoinResult>();
  const form = useRef<HTMLFormElement>(null);

  const set = <K extends keyof JoinDraft>(key: K, value: JoinDraft[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
    // Clearing on edit rather than on the next submit: an error that outlives
    // the fix reads as the field still being wrong.
    setErrors((current) =>
      key in current ? { ...current, [key]: undefined } : current,
    );
  };

  /** Moves the eye to the first thing that needs fixing, after React paints. */
  const showFirstError = () => {
    requestAnimationFrame(() => {
      const field = form.current?.querySelector<HTMLElement>(
        '[aria-invalid="true"]',
      );
      field?.scrollIntoView({ block: "center", behavior: "smooth" });
      // Focus as well as scroll: a screen reader user is told which field, and
      // the keyboard reopens on the answer that has to change.
      field?.focus({ preventScroll: true });
    });
  };

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (submitting) return;
    setFailure(undefined);

    const found = validateJoin(draft);
    const count = Object.keys(found).length;
    if (count > 0) {
      setErrors(found);
      // The banner exists because the broken field is often off-screen: on a
      // phone, a silent scroll from the button reads as the button not working.
      setFailure(
        count === 1
          ? "One answer still needs fixing before we can list you — it's marked in red below."
          : `${count} answers still need fixing before we can list you — they're marked in red below.`,
      );
      showFirstError();
      return;
    }

    setSubmitting(true);
    try {
      const joined = await publicApi.applications.join(toJoinInput(draft));
      setResult(joined);
      window.scrollTo({ top: 0 });

      // Home reads a cached register, so tapping "See Artiza" in a few seconds
      // would land them on a page they aren't in yet — after being told they
      // are live. Their own profile is entirely on this device already, so it
      // travels with them and sits at the front of "New on Artiza" until the
      // real register catches up. Only when it actually published: an artisan
      // still waiting on the team must not see themselves listed.
      if (joined.published) rememberJustJoined(toJustJoined(draft, joined));
    } catch (cause) {
      setSubmitting(false);

      // Every failure — rejected field, duplicate number, dropped connection,
      // our own bug — is translated in one place, so none of the API's
      // internal wording ever reaches an artisan. See `join-errors.ts`.
      const { message, fields } = describeJoinFailure(cause);
      setFailure(message);

      if (Object.keys(fields).length > 0) {
        setErrors(fields);
        showFirstError();
      }
    }
  }

  if (result) return <JoinDone result={result} />;

  return (
    <div className="mx-auto w-full max-w-xl px-4 pb-24 pt-8 md:px-6 md:pb-20 md:pt-14">
      <Brand />

      <header className="mt-8">
        <h1 className="title-lg mt-1.5 text-ink">
          Get found by people who need your work
        </h1>
        {/* No town named. Artiza is starting in one place, but an artisan
            reading this should see a platform they are joining, not a local
            noticeboard — and the copy shouldn't need rewriting the week a
            second town opens. Where they work is a field, not the pitch. */}
        <p className="mt-3 text-[0.9375rem] leading-relaxed text-pretty text-sub">
          Artiza is where customers find artisans they can trust, and pay to
          reach them directly. Confirm your details below and your profile goes
          live. It takes about two minutes.
        </p>
      </header>

      {/* The three things an artisan wants answered before they type a single
          letter, answered before the first field rather than in a footer. */}
      <ul className="mt-6 grid gap-2 sm:grid-cols-3">
        {[
          {
            title: "Listing is free",
            body: "No fee to be on Artiza, now or later.",
          },
          {
            title: "No cut of your job",
            body: "You agree the price with the customer yourself.",
          },
          {
            title: "They call you",
            body: "Customers get your number and reach you directly.",
          },
        ].map((fact) => (
          <li key={fact.title} className="rounded-2xl bg-card p-4">
            <p className="headline text-ink">{fact.title}</p>
            <p className="caption mt-1">{fact.body}</p>
          </li>
        ))}
      </ul>

      <form ref={form} onSubmit={submit} noValidate className="mt-6 space-y-4">
        <FormSection title="About you">
          <TextField
            label="Full name"
            value={draft.name}
            onChange={(v) => set("name", v)}
            placeholder="Tunde Bakare"
            autoComplete="name"
            maxLength={APPLICATION_LIMITS.name}
            error={errors.name}
            disabled={submitting}
          />

          <TradeField
            trade={draft.trade}
            customTrade={draft.customTrade}
            onChange={(next) =>
              setDraft((current) => ({ ...current, ...next }))
            }
            error={errors.customTrade}
            disabled={submitting}
          />

          <TextField
            label="Where you work"
            value={draft.location}
            onChange={(v) => set("location", v)}
            placeholder="Babcock Road, Ilisan"
            hint="The area customers will see on your profile."
            maxLength={APPLICATION_LIMITS.location}
            error={errors.location}
            disabled={submitting}
          />

          <TextField
            label="Years of experience"
            type="number"
            inputMode="numeric"
            value={draft.yearsExperience}
            onChange={(v) => set("yearsExperience", v)}
            placeholder="8"
            error={errors.yearsExperience}
            disabled={submitting}
          />
        </FormSection>

        <FormSection
          title="How customers reach you"
          note="Shown only to a customer who has paid to unlock your contact."
        >
          <TextField
            label="Phone"
            type="tel"
            inputMode="tel"
            prefix="+234"
            autoComplete="tel-national"
            value={draft.phone}
            onChange={(v) => set("phone", v)}
            placeholder="803 123 4567"
            error={errors.phone}
            disabled={submitting}
          />

          <TextField
            label="WhatsApp"
            type="tel"
            inputMode="tel"
            prefix="+234"
            value={draft.whatsapp}
            onChange={(v) => set("whatsapp", v)}
            placeholder="Same as phone"
            optional
            error={errors.whatsapp}
            hint="Only if your WhatsApp is on a different line."
            disabled={submitting}
          />
        </FormSection>

        {/* Every one optional, and grouped away from the phone so the form
            never reads as "you must have an Instagram". For the artisans who
            do keep a page of finished jobs, it is often more persuasive than
            the call — so it is offered, not required. */}
        <FormSection
          title="Your pages"
          note="If you post your work anywhere, add it. All optional, and unlocked along with your number."
        >
          <TextField
            label="Instagram"
            value={draft.instagram}
            onChange={(v) => set("instagram", v)}
            placeholder="tundetiles_ilisan"
            optional
            maxLength={APPLICATION_LIMITS.instagram}
            hint="Your handle, or paste the link to your page."
            disabled={submitting}
          />

          <TextField
            label="Facebook"
            value={draft.facebook}
            onChange={(v) => set("facebook", v)}
            placeholder="tunde.tiles.ilisan"
            optional
            maxLength={APPLICATION_LIMITS.facebook}
            hint="Your page name, or paste the link."
            disabled={submitting}
          />

          <TextField
            label="Snapchat"
            value={draft.snapchat}
            onChange={(v) => set("snapchat", v)}
            placeholder="tundetiles"
            optional
            maxLength={APPLICATION_LIMITS.snapchat}
            disabled={submitting}
          />
        </FormSection>

        <FormSection
          title="Your work"
          note="This is what a customer reads before deciding to call."
        >
          <TextArea
            label="What you do"
            value={draft.note}
            onChange={(v) => set("note", v)}
            placeholder="Floor, wall and marble. I work clean and clear the site after."
            maxLength={APPLICATION_LIMITS.note}
            rows={3}
            error={errors.note}
            hint="A line or two, in your own words."
            disabled={submitting}
          />

          <TagField
            label="Services"
            values={draft.services}
            onChange={(v) => set("services", v)}
            placeholder="Floor tiling, Marble, Grout repair"
            max={APPLICATION_LIMITS.services}
            maxLength={APPLICATION_LIMITS.service}
            hint="Enter or a comma adds one."
          />

          <PhotoField
            values={draft.work}
            onChange={(v) => set("work", v)}
            disabled={submitting}
          />
        </FormSection>

        <ConsentField
          checked={draft.consent}
          onChange={(v) => set("consent", v)}
          error={errors.consent}
          disabled={submitting}
        />

        {/* A failure here can be three sentences — what happened, that the
            form survived, what to do — so it gets a surface of its own rather
            than a caption line the eye slides off. Amber, never red: a red
            message directly above a red button reads as a second action. */}
        {failure ? (
          <div
            role="alert"
            aria-live="assertive"
            className="flex items-start gap-3 rounded-2xl bg-card p-4 ring-1 ring-danger"
          >
            <TriangleAlert
              size={18}
              strokeWidth={2}
              className="mt-0.5 shrink-0 text-danger"
              aria-hidden
            />
            <p className="min-w-0 text-[0.9375rem] leading-relaxed text-pretty text-ink">
              {failure}
            </p>
          </div>
        ) : null}

        <button
          type="submit"
          disabled={submitting}
          className="pressable w-full rounded-full bg-accent py-3.5 text-[1.0625rem] font-semibold text-white disabled:opacity-50"
        >
          {submitting ? (
            <Loader2 size={20} className="mx-auto block animate-spin" />
          ) : (
            "Put me on Artiza"
          )}
        </button>

        <p className="caption px-1 text-center">
          Something wrong or missing? Call the Artiza team and we&apos;ll fix it
          for you.
        </p>
      </form>
    </div>
  );
}

/**
 * The page's own brand mark.
 *
 * `/join` stands the app's navigation down — a tab bar offering Browse,
 * Unlocked and Account to an artisan mid-form is four wrong answers — which
 * leaves the page with nothing saying whose form this is. For someone who has
 * only ever seen the word "Artiza" in a WhatsApp message, that is the one thing
 * that cannot be missing.
 */
function Brand() {
  return (
    <Link
      href="/"
      className="pressable inline-flex items-center gap-2.5 text-lg font-extrabold tracking-tight text-ink"
    >
      <span
        className="block size-9 shrink-0"
        style={{
          backgroundColor: "currentColor",
          WebkitMaskImage: "url(/logo-mark.png)",
          maskImage: "url(/logo-mark.png)",
          WebkitMaskSize: "contain",
          maskSize: "contain",
          WebkitMaskRepeat: "no-repeat",
          maskRepeat: "no-repeat",
          WebkitMaskPosition: "center",
          maskPosition: "center",
          maskMode: "luminance",
        }}
        aria-hidden
      />
      <span>
        Artiza<span className="text-accent">.</span>
      </span>
    </Link>
  );
}

/**
 * The permission, written as the sentence it actually is.
 *
 * A bare "I agree to the terms" would be the wrong control here: there are no
 * terms to read, and the thing being agreed to — your name and number going on
 * a public site where strangers pay to see them — is short enough to say in
 * full. Real checkbox semantics rather than the console's `ToggleField`
 * switch, because this is consent, not a setting.
 */
function ConsentField({
  checked,
  onChange,
  error,
  disabled,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  error?: string;
  disabled?: boolean;
}) {
  return (
    <div>
      <label
        className={`pressable flex w-full cursor-pointer items-start gap-3 rounded-2xl bg-card p-4 text-left ${
          error ? "ring-1 ring-danger" : ""
        } ${disabled ? "opacity-60" : ""}`}
      >
        <input
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(event) => onChange(event.target.checked)}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? "consent-error" : undefined}
          className="peer sr-only"
        />
        <span
          aria-hidden
          className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-md bg-fill ring-1 ring-line transition-colors duration-200 ease-out peer-checked:bg-accent peer-checked:text-white peer-checked:ring-0"
        >
          {checked ? <Check size={13} strokeWidth={3} /> : null}
        </span>
        <span className="min-w-0 text-[0.9375rem] leading-relaxed text-sub">
          I agree to Artiza listing my name, trade, area and photos publicly,
          and giving my phone number to customers who pay to unlock it.
        </span>
      </label>

      {error ? (
        <p id="consent-error" className="caption mt-1.5 px-1 text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}

/**
 * The optional work photos.
 *
 * A twin of the one in `ApplySheet`, pointed at the anonymous upload route.
 * It stays optional and says so plainly: a founding artisan who has nothing on
 * their phone right now should still finish the form, and the team can add
 * photos to the listing afterwards.
 */
function PhotoField({
  values,
  onChange,
  disabled,
}: {
  values: string[];
  onChange: (urls: string[]) => void;
  disabled?: boolean;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();

  const max = APPLICATION_LIMITS.work;
  const room = max - values.length;

  const add = async (files: FileList | null) => {
    if (!files?.length) return;
    setError(undefined);

    const chosen = Array.from(files);

    // Checked before the upload rather than after: on a metered connection,
    // sending 12 MB only to be told it was too big costs the artisan money.
    const oversized = chosen.find((file) => file.size > MAX_BYTES);
    if (oversized) {
      setError(
        `"${oversized.name}" is ${megabytes(oversized.size)}. Artiza takes photos up to 8 MB — pick a different one, or retake it at a lower quality in your camera settings.`,
      );
      return;
    }

    // The picker's `accept` is a filter, not a rule — a file dragged in, or
    // picked through "All files", arrives regardless. The server rejects these
    // too, but it can only do so after the whole file has been sent.
    const wrongType = chosen.find(
      (file) => file.type && !ACCEPTED_TYPES.has(file.type),
    );
    if (wrongType) {
      setError(
        `"${wrongType.name}" isn't a photo Artiza can use. Pick a JPEG, PNG, WebP or HEIC — a photo straight from your phone's camera roll will work.`,
      );
      return;
    }

    // Anything past the cap is dropped here, so the message can say so. The
    // silent `.slice` this replaces looked like photos vanishing.
    const picked = chosen.slice(0, room);
    const dropped = chosen.length - picked.length;

    if (picked.length === 0) {
      setError(
        `A profile shows ${max} photos, and you already have ${max}. Remove one above to add a different photo.`,
      );
      return;
    }

    setBusy(true);
    try {
      const results = await publicApi.applications.joinPhotos(picked);
      onChange([...values, ...results.map((r) => r.url)].slice(0, max));

      if (dropped > 0) {
        setError(
          `Artiza shows ${max} photos on a profile, so ${picked.length === 1 ? "the first one was" : `the first ${picked.length} were`} added and ${dropped === 1 ? "the last one wasn't" : `the last ${dropped} weren't`}. Remove one above if you'd rather use a different photo.`,
        );
      }
    } catch (cause) {
      setError(describeUploadFailure(cause, picked.length));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <div className="flex items-baseline gap-2 px-1">
        <span className="caption font-semibold text-ink">
          Photos of your work
        </span>
        <span className="caption text-faint">Optional</span>
        <span className="figure ml-auto text-xs text-faint">
          {values.length}/{max}
        </span>
      </div>

      <ul className="mt-1.5 grid grid-cols-3 gap-2 sm:grid-cols-4">
        {values.map((url, index) => (
          <li
            key={url}
            className="relative aspect-3/2 overflow-hidden rounded-xl bg-fill"
          >
            <Image src={url} alt="" fill sizes="120px" className="object-cover" />
            <button
              type="button"
              onClick={() => onChange(values.filter((v) => v !== url))}
              className="pressable chrome absolute right-1.5 top-1.5 grid size-6 place-items-center rounded-full text-danger"
            >
              <Trash2 size={12} strokeWidth={2.2} />
              <span className="sr-only">Remove photo {index + 1}</span>
            </button>
          </li>
        ))}

        {room > 0 ? (
          <li>
            <button
              type="button"
              disabled={busy || disabled}
              onClick={() => input.current?.click()}
              className="pressable flex aspect-3/2 w-full flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-line bg-fill text-sub disabled:opacity-60"
            >
              {busy ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  <ImageUp size={18} strokeWidth={1.8} />
                  <span className="caption font-semibold">Add photo</span>
                </>
              )}
            </button>
          </li>
        ) : null}
      </ul>

      <input
        ref={input}
        type="file"
        accept={ACCEPT}
        multiple
        className="sr-only"
        onChange={(event) => {
          void add(event.target.files);
          event.target.value = "";
        }}
      />

      {error ? (
        <p role="alert" className="caption mt-2 px-1 leading-relaxed text-danger">
          {error}
        </p>
      ) : (
        <p className="caption mt-2 px-1">
          A photo of finished work is the single thing most likely to win a job.
          You can add them later.
        </p>
      )}
    </div>
  );
}

/**
 * What they see when it's done.
 *
 * Two endings, because the server decides whether a submission publishes on the
 * spot. Neither claims the other's outcome: the whole point of `published`
 * coming back from the API is that this screen never has to guess.
 */
function JoinDone({ result }: { result: JoinResult }) {
  const firstName = result.name.trim().split(/\s+/)[0];
  const trade = tradeName(result).toLowerCase();

  return (
    <div className="mx-auto w-full max-w-xl px-4 pb-24 pt-8 md:px-6 md:pb-20 md:pt-14">
      <Brand />

      <div className="mt-10">
        <span
          aria-hidden
          className="grid size-12 place-items-center rounded-full bg-accent text-white"
        >
          <Check size={24} strokeWidth={2.6} />
        </span>

        <h1 className="title-lg mt-5 text-ink">
          {result.published
            ? `You're on Artiza, ${firstName}`
            : `Thank you, ${firstName}`}
        </h1>

        <p className="mt-3 text-[0.9375rem] leading-relaxed text-pretty text-sub">
          {result.published
            ? `Your profile is live. Someone looking for a ${trade} in your area can now find you and pay to unlock your number.`
            : "We have your details. The Artiza team will have your profile live shortly and will call you if anything is missing."}
        </p>
      </div>

      <section className="mt-8 rounded-2xl bg-card p-5 sm:p-6">
        <h2 className="title text-ink">What happens next</h2>
        <ol className="mt-4 space-y-4">
          {[
            {
              title: "A customer finds you",
              body: "They browse artisans near them and read your profile — your work, your years, what you take on.",
            },
            {
              title: "They pay to unlock your number",
              body: "That fee is how Artiza runs. It comes from the customer, never from you.",
            },
            {
              title: "They call you directly",
              body: "You agree the job and the price yourselves, exactly as you do now. Artiza takes nothing.",
            },
            {
              title: "They rate you afterwards",
              body: "Good ratings move you up the list, so the next customer sees you sooner.",
            },
          ].map((step, index) => (
            <li key={step.title} className="flex gap-3">
              <span
                aria-hidden
                className="figure grid size-7 shrink-0 place-items-center rounded-full bg-fill text-sm text-ink"
              >
                {index + 1}
              </span>
              <div className="min-w-0">
                <p className="headline text-ink">{step.title}</p>
                <p className="caption mt-0.5 leading-relaxed">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <Link
        href="/"
        className="pressable mt-6 block w-full rounded-full bg-accent py-3.5 text-center text-[1.0625rem] font-semibold text-white"
      >
        See Artiza
      </Link>

      <p className="caption mt-4 px-1 text-center">
        Need to change something? Call the Artiza team and we&apos;ll update it.
      </p>
    </div>
  );
}
