"use client";

import { useState } from "react";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import {
  FormSection,
  SelectField,
  TextArea,
  TextField,
  ToggleField,
} from "./Fields";
import { ImageField } from "./ImageField";
import { useApi } from "../../lib/api/useApi";
import { ApiError } from "../../lib/api/error";
import { toast } from "../../lib/toast";
import { BANNER_TYPES, bannerTypeLabel, type BannerType } from "../../lib/artisans";
import type { AdminBannerItem, BannerInput } from "../../lib/api/types";

export const BANNER_LIMITS = { title: 40, body: 120, cta: 30 } as const;

export interface BannerDraft {
  type: BannerType;
  title: string;
  body: string;
  cta: string;
  href: string;
  image: string;
  isActive: boolean;
}

export function blankBanner(): BannerDraft {
  return {
    // Every banner Artiza has run so far is an offer; it stays the default.
    type: "offer",
    title: "",
    body: "",
    cta: "",
    // Every banner Artiza has run so far points at the bundle. It is a default,
    // not a constraint — the field is a plain path.
    href: "/account",
    image: "",
    isActive: true,
  };
}

export function bannerDraftFrom(banner: AdminBannerItem): BannerDraft {
  return {
    type: banner.type,
    title: banner.title,
    body: banner.body,
    cta: banner.cta,
    href: banner.href,
    image: banner.image,
    isActive: banner.isActive,
  };
}

type Errors = Partial<Record<keyof BannerDraft, string>>;

function validate(draft: BannerDraft): Errors {
  const errors: Errors = {};

  if (!draft.title.trim()) errors.title = "Two or three words.";
  if (!draft.body.trim()) errors.body = "One line under the title.";
  if (!draft.cta.trim()) errors.cta = "What the button says.";
  if (!draft.image) errors.image = "A banner is a picture with a label on it.";
  if (!draft.href.startsWith("/"))
    errors.href = "A path inside the app, starting with /.";

  return errors;
}

/**
 * The banner editor, beside the rail it edits.
 *
 * A banner is five fields and one photo, so it does not earn a page of its
 * own — and putting it in a modal would hide the list it has to sit next to,
 * which is the only way to judge whether a new one is saying the same thing as
 * the last one.
 */
export function BannerEditor({
  banner,
  onSaved,
  onCancel,
}: {
  /** `undefined` composes a new one. */
  banner?: AdminBannerItem;
  onSaved: (banner: AdminBannerItem, created: boolean) => void;
  onCancel: () => void;
}) {
  const { api } = useApi();
  const [draft, setDraft] = useState<BannerDraft>(() =>
    banner ? bannerDraftFrom(banner) : blankBanner(),
  );
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);

  // Selecting a different banner re-seeds the form through the `key` the page
  // gives this component, not through an effect: a half-typed draft must not
  // survive into a different banner's row, and a remount is the one way to
  // guarantee that without a second copy of the seeding logic.

  const set = <K extends keyof BannerDraft>(key: K, value: BannerDraft[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (saving) return;

    const found = validate(draft);
    if (Object.keys(found).length > 0) {
      setErrors(found);
      return;
    }

    const payload: BannerInput = {
      type: draft.type,
      title: draft.title.trim(),
      body: draft.body.trim(),
      cta: draft.cta.trim(),
      href: draft.href.trim(),
      image: draft.image,
      isActive: draft.isActive,
    };

    setSaving(true);
    try {
      const saved = banner
        ? await api.admin.banners.update(banner.id, payload)
        : await api.admin.banners.create(payload);

      toast.success(banner ? "Banner saved" : "Banner added");
      onSaved(saved, !banner);
    } catch (cause) {
      toast.error("Couldn't save the banner", {
        description:
          cause instanceof ApiError ? cause.message : "Try again in a moment.",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} noValidate>
      <FormSection
        title={banner ? "Edit banner" : "New banner"}
        note="The one promotional surface in the app. It sits under the search field on the home screen."
      >
        <BannerPreview draft={draft} />

        <ImageField
          label="Artwork"
          folder="banners"
          value={draft.image}
          onChange={(url) => set("image", url)}
          error={errors.image}
          hint="White type sits on a dark scrim over the bottom — keep that area busy-free."
        />

        <SelectField
          label="Type"
          value={draft.type}
          onChange={(v) => set("type", v)}
          options={BANNER_TYPES}
          hint="The small label over the title. Only offers are priced promotions."
        />

        <TextField
          label="Title"
          value={draft.title}
          onChange={(v) => set("title", v)}
          placeholder="3 for ₦1,200"
          maxLength={BANNER_LIMITS.title}
          error={errors.title}
        />

        <TextArea
          label="Body"
          value={draft.body}
          onChange={(v) => set("body", v)}
          placeholder="Line up a few artisans at once."
          maxLength={BANNER_LIMITS.body}
          rows={2}
          error={errors.body}
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            label="Button"
            value={draft.cta}
            onChange={(v) => set("cta", v)}
            placeholder="Get the bundle"
            maxLength={BANNER_LIMITS.cta}
            error={errors.cta}
          />
          <TextField
            label="Goes to"
            value={draft.href}
            onChange={(v) => set("href", v)}
            placeholder="/account"
            error={errors.href}
            hint="A path in the app, never a full URL."
          />
        </div>

        <ToggleField
          label="Showing"
          description="Off keeps the banner here but takes it out of the rail."
          checked={draft.isActive}
          onChange={(v) => set("isActive", v)}
        />

        <div className="flex items-center gap-2 pt-1">
          <button
            type="submit"
            disabled={saving}
            className="pressable inline-flex items-center gap-1.5 rounded-full bg-accent px-5 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : null}
            {banner ? "Save banner" : "Add banner"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="pressable rounded-full bg-fill px-4 py-2 text-sm font-semibold text-ink"
          >
            {banner ? "Done" : "Clear"}
          </button>
        </div>
      </FormSection>
    </form>
  );
}

/**
 * The card exactly as the rail draws it: 2:1, white type on a bottom-up scrim,
 * one white pill. Copy is judged against the photo it will sit on or not at all.
 */
export function BannerPreview({
  draft,
  className = "",
}: {
  draft: BannerDraft;
  className?: string;
}) {
  return (
    <div
      className={`relative aspect-2/1 w-full overflow-hidden rounded-2xl bg-fill ${className}`}
    >
      {draft.image ? (
        <Image
          src={draft.image}
          alt=""
          fill
          sizes="(min-width: 1280px) 420px, 100vw"
          className="object-cover"
        />
      ) : null}

      <div
        aria-hidden
        className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent"
      />

      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4">
        <div className="min-w-0">
          <p className="text-[0.625rem] font-bold uppercase tracking-[0.18em] text-white/70">
            {bannerTypeLabel(draft.type)}
          </p>
          <p className="title text-white">
            {draft.title || "Your title here"}
          </p>
          <p className="mt-0.5 line-clamp-2 text-sm text-white/85">
            {draft.body || "And the line that goes under it."}
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-white px-3.5 py-1.5 text-sm font-semibold text-canvas">
          {draft.cta || "Button"}
        </span>
      </div>
    </div>
  );
}
