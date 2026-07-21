"use client";

import Image from "next/image";
import { BadgeCheck, ChevronRight, MapPin, Star } from "lucide-react";
import {
  Artisan,
  TRADE_COVERS,
  TRADE_LABELS,
  UNLOCK_PRICE,
} from "../lib/artisans";

/**
 * A row in the list, not a self-contained page. The whole card is the
 * tap target and opens the detail sheet — unlocking lives there, so
 * browsing stays about choosing rather than buying.
 *
 * The photo leads: you judge a hand worker by their work, so the cover is
 * the job and the portrait laps onto it as the second layer of proof.
 */
export function ArtisanCard({
  artisan,
  unlocked,
  onOpen,
}: {
  artisan: Artisan;
  unlocked: boolean;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="pressable group flex h-full w-full flex-col overflow-hidden rounded-2xl bg-card text-left shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
    >
      <CoverPhoto artisan={artisan} />

      <div className="flex w-full flex-1 flex-col p-4">
        {/* The portrait is the only thing that laps the cover — it needs its
            own stacking context or the positioned cover paints over it. The
            name sits clear of the photo, on the card surface where it reads. */}
        <Avatar
          name={artisan.name}
          src={artisan.photo}
          size="size-14"
          className="relative z-10 -mt-12 ring-4 ring-card"
        />

        <h3 className="headline mt-2.5 flex items-center gap-1.5 text-ink">
          <span className="truncate">{artisan.name}</span>
          <BadgeCheck
            size={16}
            strokeWidth={2.2}
            className="shrink-0 text-accent"
            aria-label="Verified"
          />
        </h3>
        <p className="caption mt-0.5 flex items-center gap-0.5">
          <MapPin size={11} strokeWidth={2} />
          {artisan.location}
        </p>

        <p className="mt-3 line-clamp-2 text-sm text-sub">{artisan.note}</p>

        <div className="figure mt-3 flex items-center gap-4 text-sm text-ink">
          <span className="flex items-center gap-1">
            <Star
              size={13}
              strokeWidth={2.2}
              fill="currentColor"
              className="text-accent"
            />
            {artisan.rating.toFixed(1)}
            <span className="font-normal text-sub">({artisan.reviewCount})</span>
          </span>
          <span>
            {artisan.yearsExperience}
            <span className="ml-1 font-normal text-sub">yrs exp</span>
          </span>
          <span>
            {artisan.jobsCompleted}
            <span className="ml-1 font-normal text-sub">jobs</span>
          </span>
        </div>

        <div className="mt-3 flex-1" />

        <div className="flex w-full items-center justify-between border-t border-line pt-3">
          <span className="text-sm font-medium text-accent">
            {unlocked ? "Contact unlocked" : `₦${UNLOCK_PRICE} to unlock contact`}
          </span>
          <ChevronRight
            size={16}
            strokeWidth={2.2}
            aria-hidden
            className="text-faint"
          />
        </div>
      </div>
    </button>
  );
}

/**
 * The artisan's own work when we have it, the trade's stock scene when we
 * don't — the card is never a blank slab.
 */
function CoverPhoto({ artisan }: { artisan: Artisan }) {
  const src = artisan.work[0] ?? TRADE_COVERS[artisan.trade];

  return (
    <div className="relative aspect-16/10 w-full overflow-hidden bg-fill">
      <Image
        src={src}
        alt={`${TRADE_LABELS[artisan.trade]} work by ${artisan.name}`}
        fill
        sizes="(min-width: 1024px) 340px, (min-width: 640px) 50vw, 100vw"
        className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
      />
      {/* Scrim, not a tint: keeps the overlaid labels legible on any photo
          without draining the colour out of the work. */}
      <div
        aria-hidden
        className="absolute inset-0 bg-linear-to-b from-black/30 via-black/0 to-black/20"
      />
      <span className="chrome absolute left-3 top-3 rounded-full px-2.5 py-1 text-xs font-semibold text-ink">
        {TRADE_LABELS[artisan.trade]}
      </span>
      {artisan.featured && (
        <span className="absolute right-3 top-3 rounded-full bg-accent px-2.5 py-1 text-xs font-semibold text-white">
          Featured
        </span>
      )}
    </div>
  );
}

/**
 * The artisan's face, shot by the team on the verification visit. Initials
 * on an accent fill stay the fallback for anyone not yet photographed —
 * an avatar slot, never a broken image.
 */
export function Avatar({
  name,
  src,
  size = "size-12 text-[0.9375rem]",
  className = "",
}: {
  name: string;
  src?: string;
  size?: string;
  className?: string;
}) {
  if (src) {
    return (
      <span
        className={`relative shrink-0 overflow-hidden rounded-full bg-accent-soft ${size} ${className}`}
      >
        <Image
          src={src}
          alt={name}
          fill
          sizes="128px"
          className="object-cover"
        />
      </span>
    );
  }

  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("");

  return (
    <span
      aria-hidden
      className={`grid shrink-0 place-items-center rounded-full bg-accent-soft font-semibold text-accent ${size} ${className}`}
    >
      {initials}
    </span>
  );
}
