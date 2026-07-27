"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, ImageUp, Loader2, Trash2 } from "lucide-react";
import {
  FormSection,
  SelectField,
  TagField,
  TextArea,
  TextField,
} from "../admin/Fields";
import { PlaceMark } from "../PageHeader";
import { publicApi } from "../../lib/api";
import { ApiError } from "../../lib/api/error";
import { TRADE_OPTIONS } from "../../lib/admin/artisan-draft";
import { APPLICATION_LIMITS } from "../../lib/applications/application-draft";
import {
  blankJoin,
  toJoinInput,
  validateJoin,
  type JoinDraft,
  type JoinErrors,
} from "../../lib/applications/join-draft";
import { TRADE_LABELS, type Trade } from "../../lib/artisans";
import type { JoinResult } from "../../lib/api/types";

/** What the upload path accepts, said out loud so the copy and the picker agree. */
const ACCEPT = "image/jpeg,image/png,image/webp,image/heic,image/heif";
const MAX_BYTES = 8 * 1024 * 1024;

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

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (submitting) return;
    setFailure(undefined);

    const found = validateJoin(draft);
    if (Object.keys(found).length > 0) {
      setErrors(found);
      form.current
        ?.querySelector('[aria-invalid="true"]')
        ?.scrollIntoView({ block: "center", behavior: "smooth" });
      return;
    }

    setSubmitting(true);
    try {
      setResult(await publicApi.applications.join(toJoinInput(draft)));
      window.scrollTo({ top: 0 });
    } catch (cause) {
      setSubmitting(false);

      if (cause instanceof ApiError) {
        // A field the API rejected lands back on its own field where we have
        // one; anything else is said once, above the button.
        const mapped: JoinErrors = {};
        for (const [field, messages] of Object.entries(cause.details ?? {})) {
          const key = field.split(".").pop() as keyof JoinDraft;
          if (key in draft) mapped[key] = messages[0];
        }
        if (Object.keys(mapped).length > 0) setErrors(mapped);

        setFailure(cause.message);
        return;
      }

      setFailure(
        "That didn't send. Check your connection and try again — nothing was lost.",
      );
    }
  }

  if (result) return <JoinDone result={result} />;

  return (
    <div className="mx-auto w-full max-w-xl px-4 pb-24 pt-8 md:px-6 md:pb-20 md:pt-14">
      <Brand />

      <header className="mt-8">
        <p className="caption flex items-center gap-1.5">
          <PlaceMark />
          Ilisan, Ogun State
        </p>
        <h1 className="title-lg mt-1.5 text-ink">
          Get found by people who need your work
        </h1>
        <p className="mt-3 text-[0.9375rem] leading-relaxed text-pretty text-sub">
          Artiza is where customers around Ilisan look for artisans they can
          trust. Confirm your details below and your profile goes live. It takes
          about two minutes.
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

          <SelectField<Trade>
            label="Trade"
            value={draft.trade}
            onChange={(v) => set("trade", v)}
            options={TRADE_OPTIONS}
            hint="The work customers will find you under."
            disabled={submitting}
          />

          <TextField
            label="Area of Ilisan"
            value={draft.location}
            onChange={(v) => set("location", v)}
            placeholder="Babcock Road"
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

        {failure ? (
          <p role="alert" className="caption px-1 text-danger">
            {failure}
          </p>
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

    const picked = Array.from(files).slice(0, room);
    const oversized = picked.find((file) => file.size > MAX_BYTES);
    if (oversized) {
      setError(`"${oversized.name}" is over 8 MB. Pick a smaller photo.`);
      return;
    }

    setBusy(true);
    try {
      const results = await publicApi.applications.joinPhotos(picked);
      onChange([...values, ...results.map((r) => r.url)].slice(0, max));
    } catch (cause) {
      setError(
        cause instanceof ApiError
          ? cause.message
          : "The upload didn't go through. Try again.",
      );
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
        <p className="caption mt-2 px-1 text-danger">{error}</p>
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
  const trade = TRADE_LABELS[result.trade].toLowerCase();

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
            ? `Your profile is live. Anyone looking for a ${trade} around Ilisan can now find you and pay to unlock your number.`
            : "We have your details. The Artiza team will have your profile live shortly and will call you if anything is missing."}
        </p>
      </div>

      <section className="mt-8 rounded-2xl bg-card p-5 sm:p-6">
        <h2 className="title text-ink">What happens next</h2>
        <ol className="mt-4 space-y-4">
          {[
            {
              title: "A customer finds you",
              body: `They browse artisans in Ilisan and read your profile — your work, your years, what you take on.`,
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
