"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, Loader2 } from "lucide-react";
import {
  FormSection,
  SelectField,
  TagField,
  TextArea,
  TextField,
  ToggleField,
} from "./Fields";
import { GalleryField, ImageField } from "./ImageField";
import { ArtisanCard } from "../ArtisanCard";
import { useApi } from "../../lib/api/useApi";
import { ApiError } from "../../lib/api/error";
import { toast } from "../../lib/toast";
import {
  LIMITS,
  MONTHS,
  TRADE_OPTIONS,
  isUnchanged,
  toInput,
  toPatch,
  validateDraft,
  type ArtisanDraft,
  type DraftErrors,
} from "../../lib/admin/artisan-draft";
import type { Artisan, Trade } from "../../lib/artisans";

/** Ten years back and one forward — the range a verification visit can fall in. */
function yearOptions(): { value: string; label: string }[] {
  const now = new Date().getFullYear();
  return Array.from({ length: 12 }, (_, i) => {
    const year = String(now + 1 - i);
    return { value: year, label: year };
  });
}

/**
 * The draft as a customer would meet it, so the preview beside the form is the
 * real card component rather than a drawing of one. Counts that only the
 * database can know are shown at their true values when editing and at zero on
 * a new listing — a preview that invents a rating would be the most misleading
 * thing on the screen.
 */
function previewArtisan(draft: ArtisanDraft, actual?: Partial<Artisan>): Artisan {
  return {
    id: "preview",
    name: draft.name.trim() || "New artisan",
    trade: draft.trade,
    location: draft.location.trim() || "Ilisan",
    yearsExperience: Number(draft.yearsExperience) || 0,
    jobsCompleted: actual?.jobsCompleted ?? (Number(draft.jobsCompleted) || 0),
    recentUnlocks: actual?.recentUnlocks ?? 0,
    rating: actual?.rating ?? 0,
    reviewCount: actual?.reviewCount ?? 0,
    photo: draft.photo,
    work: draft.work,
    featured: draft.featured,
    verifiedSince: `${draft.verifiedMonth} ${draft.verifiedYear}`,
    note: draft.note.trim() || "Their note will read here.",
    services: draft.services,
    respondsIn: draft.respondsIn,
    availability: draft.availability,
  };
}

export function ArtisanForm({
  mode,
  initial,
  artisanId,
  actual,
}: {
  mode: "create" | "edit";
  initial: ArtisanDraft;
  /** Required in edit mode — what the PATCH goes to. */
  artisanId?: string;
  /** The live counters, so the preview doesn't have to guess at them. */
  actual?: Partial<Artisan>;
}) {
  const router = useRouter();
  const { api } = useApi();

  const [draft, setDraft] = useState<ArtisanDraft>(initial);
  const [errors, setErrors] = useState<DraftErrors>({});
  const [saving, setSaving] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const set = <K extends keyof ArtisanDraft>(key: K, value: ArtisanDraft[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
    // The error clears as soon as the field it belongs to is touched. Leaving
    // it up while someone fixes it reads as "still wrong", which it isn't.
    setErrors((current) =>
      key in current ? { ...current, [key]: undefined } : current,
    );
  };

  const patch = useMemo(
    () => (mode === "edit" ? toPatch(draft, initial) : {}),
    [draft, initial, mode],
  );
  const dirty = mode === "create" || !isUnchanged(patch);

  const preview = useMemo(() => previewArtisan(draft, actual), [draft, actual]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (saving) return;

    const found = validateDraft(draft);
    if (Object.keys(found).length > 0) {
      setErrors(found);
      // The form is long enough that an error above the fold is an error
      // nobody sees. Bring the first one into view rather than leaving the
      // save button looking broken.
      formRef.current
        ?.querySelector('[aria-invalid="true"]')
        ?.scrollIntoView({ block: "center", behavior: "smooth" });
      return;
    }

    setSaving(true);
    try {
      if (mode === "create") {
        const created = await api.admin.artisans.create(toInput(draft));
        toast.success(`${created.name} is on the register`, {
          description: "They're live on the browse screen now.",
        });
      } else if (artisanId) {
        if (isUnchanged(patch)) {
          setSaving(false);
          return;
        }
        await api.admin.artisans.update(artisanId, patch);
        toast.success("Changes saved");
      }

      router.push("/admin/artisans");
      // The register is cached for a minute on the customer side; this is the
      // console's own list, which reads no-store and so needs the fresh pass.
      router.refresh();
    } catch (cause) {
      setSaving(false);

      if (cause instanceof ApiError) {
        // Field-level rejections land back on their fields where possible;
        // anything the form has no input for is said out loud instead.
        const detail = cause.details;
        if (detail) {
          const mapped: DraftErrors = {};
          for (const [field, messages] of Object.entries(detail)) {
            const key = field.split(".").pop() as keyof ArtisanDraft;
            if (key in draft) mapped[key] = messages[0];
          }
          if (Object.keys(mapped).length > 0) setErrors(mapped);
        }

        toast.error(
          mode === "create" ? "Couldn't add them" : "Couldn't save the changes",
          { description: cause.message },
        );
        return;
      }

      toast.error("Something went wrong", {
        description: "The save didn't complete. Try again.",
      });
    }
  }

  return (
    <form ref={formRef} onSubmit={submit} noValidate>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-5">
          {/* ── Identity ──────────────────────────────────────────────── */}
          <FormSection
            title="Who they are"
            note="What the team confirmed on the verification visit."
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <TextField
                label="Full name"
                value={draft.name}
                onChange={(v) => set("name", v)}
                placeholder="Tunde Bakare"
                maxLength={LIMITS.name}
                error={errors.name}
              />
              <SelectField<Trade>
                label="Trade"
                value={draft.trade}
                onChange={(v) => set("trade", v)}
                options={TRADE_OPTIONS}
                hint="Decides which rail and filter they appear under."
              />
              <TextField
                label="Area of Ilisan"
                value={draft.location}
                onChange={(v) => set("location", v)}
                placeholder="Babcock Road"
                maxLength={LIMITS.location}
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
            </div>

            <ImageField
              label="Portrait"
              folder="portraits"
              value={draft.photo}
              onChange={(url) => set("photo", url)}
              error={errors.photo}
              hint="Square, face-aware crop. Shot by the team, not sent in."
            />

            <div className="grid gap-5 sm:grid-cols-2">
              <SelectField
                label="Verified in"
                value={draft.verifiedMonth}
                onChange={(v) => set("verifiedMonth", v)}
                options={MONTHS.map((m) => ({ value: m, label: m }))}
              />
              <SelectField
                label="Year"
                value={draft.verifiedYear}
                onChange={(v) => set("verifiedYear", v)}
                options={yearOptions()}
                error={errors.verifiedYear}
              />
            </div>
          </FormSection>

          {/* ── The pitch ─────────────────────────────────────────────── */}
          <FormSection
            title="What they do"
            note="This is the whole argument for paying ₦500. Write it the way you'd say it."
          >
            <TextArea
              label="Note"
              value={draft.note}
              onChange={(v) => set("note", v)}
              placeholder="Floor, wall and marble. Works clean and clears the site after."
              maxLength={LIMITS.note}
              rows={3}
              error={errors.note}
              hint="Two lines show on the card. Plain verbs, no exclamation marks."
            />
            <TagField
              label="Services"
              values={draft.services}
              onChange={(v) => set("services", v)}
              placeholder="Floor tiling, Marble, Grout repair"
              max={LIMITS.services}
              maxLength={LIMITS.service}
              hint="Enter or a comma adds one. These are searchable."
            />
          </FormSection>

          {/* ── Portfolio ─────────────────────────────────────────────── */}
          <FormSection
            title="Their work"
            note="The evidence. Without it the card falls back to a stock photo of the trade."
          >
            <GalleryField
              label="Portfolio photos"
              values={draft.work}
              onChange={(v) => set("work", v)}
              max={LIMITS.work}
              hint="The cover leads every surface they appear on. The rest fill the sheet."
            />
          </FormSection>

          {/* ── The sealed half ───────────────────────────────────────── */}
          <FormSection
            title="Contact details"
            note="Behind the paywall. Only a customer who has paid ₦500 ever sees any of this — get it right, because a wrong number is a refund."
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <TextField
                label="Phone"
                type="tel"
                inputMode="tel"
                prefix="+234"
                value={draft.phone}
                onChange={(v) => set("phone", v)}
                placeholder="803 123 4567"
                error={errors.phone}
                hint="Calls and texts go here."
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
              <TextField
                label="Instagram"
                value={draft.instagram}
                onChange={(v) => set("instagram", v)}
                placeholder="tundetiles_ilisan"
                optional
                maxLength={LIMITS.instagram}
                hint="Handle without the @."
              />
              <TextField
                label="Email"
                type="email"
                inputMode="email"
                value={draft.email}
                onChange={(v) => set("email", v)}
                placeholder="tunde@example.com"
                optional
                error={errors.email}
              />
              <TextField
                label="Second line"
                type="tel"
                inputMode="tel"
                prefix="+234"
                value={draft.altPhone}
                onChange={(v) => set("altPhone", v)}
                placeholder="803 123 4568"
                optional
                error={errors.altPhone}
                hint="A shop landline or an apprentice."
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <TextField
                label="Usually replies"
                value={draft.respondsIn}
                onChange={(v) => set("respondsIn", v)}
                maxLength={LIMITS.respondsIn}
                error={errors.respondsIn}
                hint="Public — it's part of deciding to pay."
              />
              <TextField
                label="Working hours"
                value={draft.availability}
                onChange={(v) => set("availability", v)}
                maxLength={LIMITS.availability}
                error={errors.availability}
                hint="Public. In their own words."
              />
            </div>
          </FormSection>

          {/* ── Placement ─────────────────────────────────────────────── */}
          <FormSection
            title="Placement"
            note="Where they sit in the register."
          >
            <ToggleField
              label="Featured"
              description="Paid promotion. Puts them in the carousel and first in the list."
              checked={draft.featured}
              onChange={(v) => set("featured", v)}
            />

            {mode === "create" ? (
              <TextField
                label="Jobs completed before Artiza"
                type="number"
                inputMode="numeric"
                value={draft.jobsCompleted}
                onChange={(v) => set("jobsCompleted", v)}
                placeholder="0"
                optional
                error={errors.jobsCompleted}
                hint="Imports only. An ordinary listing starts at zero and earns the number."
              />
            ) : null}
          </FormSection>
        </div>

        {/* ── Preview ─────────────────────────────────────────────────── */}
        <aside className="xl:sticky xl:top-10 xl:self-start">
          <p className="caption mb-2 flex items-center gap-1.5 px-1 font-semibold uppercase tracking-wider">
            <Eye size={13} strokeWidth={2.2} />
            How they&apos;ll read
          </p>
          <div className="pointer-events-none max-w-80">
            <ArtisanCard artisan={preview} unlocked={false} onOpen={() => {}} />
          </div>
          <p className="caption mt-3 px-1">
            {mode === "create"
              ? "Rating and job count start at zero and are earned — they aren't set here."
              : "Rating and job count come from real reviews and unlocks."}
          </p>
        </aside>
      </div>

      {/* ── The save bar ──────────────────────────────────────────────────
          Pinned, because the form is longer than a screen and the action
          must never be the thing you have to scroll to find. */}
      <div className="chrome sticky bottom-0 z-30 -mx-4 mt-6 flex items-center gap-3 border-t border-line px-4 py-3 sm:-mx-6 sm:px-6">
        <p className="caption min-w-0 flex-1 truncate">
          {saving
            ? "Saving…"
            : dirty
              ? mode === "create"
                ? "Not saved yet."
                : `${Object.keys(patch).length} ${Object.keys(patch).length === 1 ? "field" : "fields"} changed.`
              : "No changes to save."}
        </p>

        <Link
          href="/admin/artisans"
          className="pressable rounded-full bg-fill px-4 py-2 text-sm font-semibold text-ink"
        >
          Cancel
        </Link>

        <button
          type="submit"
          disabled={saving || !dirty}
          className="pressable inline-flex items-center gap-1.5 rounded-full bg-accent px-5 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : null}
          {mode === "create" ? "Add to the register" : "Save changes"}
        </button>
      </div>
    </form>
  );
}
