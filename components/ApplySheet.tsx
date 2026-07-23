"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { ImageUp, Loader2, Trash2 } from "lucide-react";
import { Sheet } from "./Sheet";
import { SelectField, TagField, TextArea, TextField } from "./admin/Fields";
import { useApi } from "../lib/api/useApi";
import { ApiError } from "../lib/api/error";
import { toast } from "../lib/toast";
import { TRADE_OPTIONS } from "../lib/admin/artisan-draft";
import {
  APPLICATION_LIMITS,
  blankApplication,
  toApplicationInput,
  validateApplication,
  type ApplicationDraft,
  type ApplicationErrors,
} from "../lib/applications/application-draft";
import type { Trade } from "../lib/artisans";
import type { ApplicationItem } from "../lib/api/types";

/** What the upload path accepts, said out loud so the copy and the picker agree. */
const ACCEPT = "image/jpeg,image/png,image/webp,image/heic,image/heif";
const MAX_BYTES = 8 * 1024 * 1024;

export function ApplySheet({
  open,
  onClose,
  onSubmitted,
}: {
  open: boolean;
  onClose: () => void;
  /** Handed the filed application so the caller can flip the CTA to pending. */
  onSubmitted: (application: ApplicationItem) => void;
}) {
  const { data: session } = useSession();
  const { api } = useApi();

  const name = session?.user?.name ?? "";
  const [draft, setDraft] = useState<ApplicationDraft>(() =>
    blankApplication(name),
  );
  const [errors, setErrors] = useState<ApplicationErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const set = <K extends keyof ApplicationDraft>(
    key: K,
    value: ApplicationDraft[K],
  ) => {
    setDraft((current) => ({ ...current, [key]: value }));
    setErrors((current) =>
      key in current ? { ...current, [key]: undefined } : current,
    );
  };

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (submitting) return;

    const found = validateApplication(draft);
    if (Object.keys(found).length > 0) {
      setErrors(found);
      scrollRef.current
        ?.querySelector('[aria-invalid="true"]')
        ?.scrollIntoView({ block: "center", behavior: "smooth" });
      return;
    }

    setSubmitting(true);
    try {
      const application = await api.applications.submit(
        toApplicationInput(draft),
      );
      toast.success("Application sent", {
        description: "The Artiza team will review it and be in touch.",
      });
      onSubmitted(application);
    } catch (cause) {
      setSubmitting(false);

      if (cause instanceof ApiError) {
        // A field the API rejected lands back on its field where we have one.
        const detail = cause.details;
        if (detail) {
          const mapped: ApplicationErrors = {};
          for (const [field, messages] of Object.entries(detail)) {
            const key = field.split(".").pop() as keyof ApplicationDraft;
            if (key in draft) mapped[key] = messages[0];
          }
          if (Object.keys(mapped).length > 0) setErrors(mapped);
        }

        toast.error("Couldn't send your application", {
          description: cause.message,
        });
        return;
      }

      toast.error("Something went wrong", {
        description: "The application didn't send. Try again.",
      });
    }
  }

  return (
    <Sheet open={open} onClose={onClose} label="Apply to join Artiza">
      <form onSubmit={submit} noValidate className="flex min-h-0 flex-1 flex-col">
        <div
          ref={scrollRef}
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-5"
        >
          <header className="pt-1">
            <h2 className="title text-ink">Apply to join Artiza</h2>
            <p className="mt-1 text-[0.9375rem] text-sub">
              Tell us about your trade. The team verifies every artisan in
              person before listing them, so a real number matters.
            </p>
          </header>

          <div className="mt-5 space-y-5">
            <TextField
              label="Full name"
              value={draft.name}
              onChange={(v) => set("name", v)}
              placeholder="Tunde Bakare"
              maxLength={APPLICATION_LIMITS.name}
              error={errors.name}
            />

            <SelectField<Trade>
              label="Trade"
              value={draft.trade}
              onChange={(v) => set("trade", v)}
              options={TRADE_OPTIONS}
              hint="The work you'd be listed under."
            />

            <TextField
              label="Area of Ilisan"
              value={draft.location}
              onChange={(v) => set("location", v)}
              placeholder="Babcock Road"
              maxLength={APPLICATION_LIMITS.location}
              error={errors.location}
            />

            <TextField
              label="Years of experience"
              type="number"
              inputMode="numeric"
              value={draft.yearsExperience}
              onChange={(v) => set("yearsExperience", v)}
              placeholder="8"
              error={errors.yearsExperience}
            />

            <TextField
              label="Phone"
              type="tel"
              inputMode="tel"
              prefix="+234"
              value={draft.phone}
              onChange={(v) => set("phone", v)}
              placeholder="803 123 4567"
              error={errors.phone}
              hint="How the team reaches you to verify."
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
              hint="Only if WhatsApp is on a different line."
            />

            <TextArea
              label="What you do"
              value={draft.note}
              onChange={(v) => set("note", v)}
              placeholder="Floor, wall and marble. Work clean and clear the site after."
              maxLength={APPLICATION_LIMITS.note}
              rows={3}
              error={errors.note}
              hint="A line or two on how you work."
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
          </div>
        </div>

        {/* Pinned, so the action is never scrolled away on a long form. */}
        <div className="chrome flex shrink-0 items-center gap-3 border-t border-line px-5 py-3">
          <p className="caption min-w-0 flex-1 truncate">
            {submitting ? "Sending…" : "The team reviews every application."}
          </p>
          <button
            type="button"
            onClick={onClose}
            className="pressable rounded-full bg-fill px-4 py-2.5 text-sm font-semibold text-ink"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="pressable inline-flex items-center gap-1.5 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {submitting ? <Loader2 size={14} className="animate-spin" /> : null}
            Send application
          </button>
        </div>
      </form>
    </Sheet>
  );
}

/**
 * The optional work photos.
 *
 * A trimmed cousin of the admin `GalleryField`: same upload-on-choose flow, but
 * it goes through the applicant's own `/applications/photos` route rather than
 * the admin uploader, and caps at four.
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
  const { api } = useApi();
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
      setError(`"${oversized.name}" is over 8 MB. Export it smaller and retry.`);
      return;
    }

    setBusy(true);
    try {
      const results = await api.applications.uploadPhotos(picked);
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
        <span className="caption font-semibold text-ink">Photos of your work</span>
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
                <ImageUp size={18} strokeWidth={1.8} />
              )}
              <span className="caption font-semibold">
                {busy ? "Uploading…" : "Add work"}
              </span>
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
          Evidence helps, but it&apos;s not required — the team shoots proper
          photos on the verification visit.
        </p>
      )}
    </div>
  );
}
