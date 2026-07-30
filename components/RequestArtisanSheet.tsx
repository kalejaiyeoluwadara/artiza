"use client";

import { useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Check, Loader2, PhoneCall } from "lucide-react";
import { Sheet } from "./Sheet";
import { TextArea, TextField } from "./admin/Fields";
import { useApi } from "../lib/api/useApi";
import { ApiError } from "../lib/api/error";
import { formatPhone } from "../lib/artisans";
import { toMsisdn } from "../lib/admin/artisan-draft";
import {
  REQUEST_LIMITS,
  blankRequest,
  toRequestInput,
  validateRequest,
  type RequestDraft,
  type RequestErrors,
} from "../lib/requests/request-draft";
import type { ArtisanRequestSource } from "../lib/api/types";

/**
 * The form for when the register had nobody.
 *
 * Every other write path in the customer app is optional — you can browse
 * forever without one. This one is the opposite: it only ever opens on a dead
 * end, which makes it the most fragile moment in the product. Someone has
 * searched for a welder, been told there isn't one, and is a tap from leaving.
 *
 * Three things follow from that, and they are the whole design:
 *
 *  - **Three fields, and one of them is the point.** Who they need, a line on
 *    the job, and the number to call. Nothing else is asked — a name and an
 *    area are things the call itself can collect, and every field here is
 *    another reason to close the tab.
 *  - **It opens with the first field already answered.** The words come from
 *    what they filtered or searched on, so the usual job is confirming rather
 *    than typing.
 *  - **It promises a phone call, and says so twice** — once on the form and
 *    once on the confirmation, with the number read back. Anything vaguer
 *    ("we'll be in touch") is a form that swallowed a number for nothing.
 */
export function RequestArtisanSheet({
  open,
  onClose,
  source,
  /** What they were filtering or searching on. Prefills the first field. */
  need,
  /** The search that found nobody, kept verbatim for the console. */
  query,
}: {
  open: boolean;
  onClose: () => void;
  source: ArtisanRequestSource;
  need?: string | null;
  query?: string;
}) {
  return (
    <Sheet open={open} onClose={onClose} label="Ask Artiza to find an artisan">
      {/* Everything below lives in a child, and that placement is the reset.
          The sheet outlives the screen it sits on, so the trade someone is
          filtering on — and a confirmation from a previous ask — would both go
          stale in state held up here. `Sheet` only renders its children while
          open, so a child seeds itself fresh on every open with no effect
          syncing anything. */}
      <RequestForm
        onClose={onClose}
        source={source}
        need={need}
        query={query}
      />
    </Sheet>
  );
}

function RequestForm({
  onClose,
  source,
  need,
  query,
}: {
  onClose: () => void;
  source: ArtisanRequestSource;
  need?: string | null;
  query?: string;
}) {
  const { api } = useApi();
  const reduceMotion = useReducedMotion();

  const [draft, setDraft] = useState<RequestDraft>(() =>
    blankRequest({ need: need ?? "" }),
  );
  const [errors, setErrors] = useState<RequestErrors>({});
  const [submitting, setSubmitting] = useState(false);
  /**
   * Whatever went wrong, shown on the sheet rather than raised as a toast. The
   * sheet is modal, so a toast behind it lands in the one place nobody looks.
   */
  const [formError, setFormError] = useState<string>();
  /** The filed request, read back on the confirmation. Null until sent. */
  const [sent, setSent] = useState<{ phone: string; need: string } | null>(
    null,
  );
  const scrollRef = useRef<HTMLDivElement>(null);

  const set = <K extends keyof RequestDraft>(key: K, value: RequestDraft[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
    setErrors((current) =>
      key in current ? { ...current, [key]: undefined } : current,
    );
  };

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (submitting) return;

    const found = validateRequest(draft);
    if (Object.keys(found).length > 0) {
      setErrors(found);
      scrollRef.current
        ?.querySelector('[aria-invalid="true"]')
        ?.scrollIntoView({ block: "center", behavior: "smooth" });
      return;
    }

    setSubmitting(true);
    setFormError(undefined);
    try {
      await api.requests.submit(toRequestInput(draft, { source, query }));
      setSent({ phone: toMsisdn(draft.phone), need: draft.need.trim() });
    } catch (cause) {
      setSubmitting(false);

      if (cause instanceof ApiError) {
        // A field the API rejected lands back on its field where we have one.
        const detail = cause.details;
        if (detail) {
          const mapped: RequestErrors = {};
          for (const [field, messages] of Object.entries(detail)) {
            const key = field.split(".").pop() as keyof RequestDraft;
            if (key in draft) mapped[key] = messages[0];
          }
          if (Object.keys(mapped).length > 0) setErrors(mapped);
        }
        setFormError(cause.message);
        return;
      }

      setFormError("The request didn't send. Try again.");
    }
  }

  return (
    <>
      {sent ? (
        <Confirmation
          phone={sent.phone}
          need={sent.need}
          onDone={onClose}
          reduceMotion={Boolean(reduceMotion)}
        />
      ) : (
        <form onSubmit={submit} noValidate className="flex min-h-0 flex-1 flex-col">
          <div
            ref={scrollRef}
            className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-5"
          >
            <header className="pt-1">
              <h2 className="title text-ink">Tell us who you need</h2>
              <p className="mt-1 text-[0.9375rem] leading-relaxed text-sub">
                Ilisan is one town and the register is still filling up. Leave
                your number and the team goes looking — you get a call the
                moment we&rsquo;ve found someone.
              </p>
            </header>

            <div className="mt-5 space-y-5">
              {/* Free text, not the trade picker the rest of the app uses. A
                  picker can only offer trades Artiza already knows about, and
                  this form exists precisely because the register didn't have
                  one — so the answer worth capturing is the one that isn't on
                  the list. */}
              <TextField
                label="Who do you need?"
                value={draft.need}
                onChange={(v) => set("need", v)}
                placeholder="Welder, marble polisher, chimney sweep…"
                maxLength={REQUEST_LIMITS.need}
                error={errors.need}
                disabled={submitting}
                hint="Whatever you'd call them. No list to pick from."
              />

              <TextArea
                label="What's the job?"
                value={draft.details}
                onChange={(v) => set("details", v)}
                placeholder="Burst pipe under the kitchen sink. Needs looking at this week."
                maxLength={REQUEST_LIMITS.details}
                rows={3}
                error={errors.details}
                disabled={submitting}
                hint="The more we know, the better the match."
              />

              <TextField
                label="Your number"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                prefix="+234"
                value={draft.phone}
                onChange={(v) => set("phone", v)}
                placeholder="803 123 4567"
                error={errors.phone}
                disabled={submitting}
                hint="How we reach you. Never shown to anyone else."
              />

              {formError ? (
                <p role="alert" className="caption px-1 text-danger">
                  {formError}
                </p>
              ) : null}
            </div>
          </div>

          {/* Pinned, so the action is never scrolled away. */}
          <div className="chrome flex shrink-0 items-center gap-3 border-t border-line px-5 py-3">
            <p className="caption min-w-0 flex-1 truncate">
              {submitting ? "Sending…" : "No charge for asking."}
            </p>
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="pressable rounded-full bg-fill px-4 py-2.5 text-sm font-semibold text-ink disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="pressable inline-flex items-center gap-1.5 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
            >
              {submitting ? (
                <Loader2 size={16} className="animate-spin" aria-label="Sending" />
              ) : (
                "Send request"
              )}
            </button>
          </div>
        </form>
      )}
    </>
  );
}

/**
 * What replaces the form once it has sent.
 *
 * It reads the number back. A form that takes a phone number and answers
 * "thanks!" leaves the one thing that matters unverified — a transposed digit
 * is the difference between a call and silence, and this is the last moment
 * anyone can catch it.
 *
 * The mark scales in once and stops. Per the frequency budget this is not the
 * unlock reveal, so it gets a single spring and no orchestration.
 */
function Confirmation({
  phone,
  need,
  onDone,
  reduceMotion,
}: {
  phone: string;
  need: string;
  onDone: () => void;
  reduceMotion: boolean;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div
        role="status"
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-5 pt-4 text-center"
      >
        <motion.span
          aria-hidden
          initial={reduceMotion ? false : { scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", bounce: 0.35, duration: 0.5 }}
          className="mx-auto grid size-14 place-items-center rounded-full bg-accent-soft text-accent"
        >
          <Check size={26} strokeWidth={2.6} />
        </motion.span>

        <h2 className="title mt-4 text-ink">We&rsquo;re on it</h2>
        {/* Their words, quoted back rather than paraphrased — proof the ask
            landed as written, which a taxonomy label could never be. */}
        <p className="mx-auto mt-2 max-w-sm text-[0.9375rem] leading-relaxed text-sub">
          The team is looking for{" "}
          <span className="font-semibold text-ink">
            &ldquo;{need}&rdquo;
          </span>{" "}
          in Ilisan. We&rsquo;ll call{" "}
          <span className="figure font-semibold text-ink">
            {formatPhone(phone)}
          </span>{" "}
          as soon as we have someone — usually within a couple of days.
        </p>

        <p className="caption mx-auto mt-5 flex max-w-sm items-center justify-center gap-2 rounded-2xl bg-fill px-4 py-3">
          <PhoneCall size={14} strokeWidth={2.2} aria-hidden className="shrink-0" />
          Keep browsing — nothing else is needed from you.
        </p>
      </div>

      <div className="chrome flex shrink-0 items-center justify-end border-t border-line px-5 py-3">
        <button
          type="button"
          onClick={onDone}
          className="pressable rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white"
        >
          Done
        </button>
      </div>
    </div>
  );
}
