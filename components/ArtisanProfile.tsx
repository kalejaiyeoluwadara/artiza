"use client";

import Image from "next/image";
import { useState } from "react";
import { BadgeCheck, MapPin, Star } from "lucide-react";
import { Artisan, SealedDetails, tradeName } from "../lib/artisans";
import { useArtisanReviews } from "../lib/useArtisanReviews";
import { Avatar } from "./ArtisanCard";
import { ContactPanel } from "./ContactPanel";
import { Lightbox } from "./Lightbox";
import { ShareButton } from "./ShareButton";

/**
 * The record, as one component.
 *
 * It is rendered in two places and is deliberately the same code in both: the
 * detail sheet a card opens, and `/artisan/[slug]`, the page that link goes
 * to. A shared profile that had been rebuilt as its own screen would drift
 * from the sheet within a release — a stat added here, a section reordered
 * there — and the whole point of the share is that the person receiving it
 * sees exactly what the person sending it saw.
 *
 * What stays out of it: the pinned unlock footer, which is chrome belonging to
 * each surface (a translucent bar in the sheet, a sticky one on the page), and
 * the sealed half itself, which the caller fetches and passes in.
 */
export function ArtisanProfile({
  artisan,
  unlocked,
  details,
}: {
  artisan: Artisan;
  unlocked: boolean;
  /** The half the ₦500 buys, once paid for. */
  details?: SealedDetails | null;
}) {
  const { reviews, loading: loadingReviews } = useArtisanReviews(artisan.id);

  // Which past-work photo is open full screen, if any. Tagged with the artisan
  // it belongs to rather than cleared on close: the sheet outlives both, and a
  // stale index would otherwise reopen the viewer over the next profile.
  const [photo, setPhoto] = useState<{ id: string; index: number } | null>(null);
  const openPhoto = photo?.id === artisan.id ? photo.index : null;

  return (
    <>
      <header className="flex items-center gap-3.5 pt-1">
        <Avatar name={artisan.name} src={artisan.photo} size="size-16 text-xl" />
        <div className="min-w-0 flex-1">
          <h2 className="title flex items-center gap-1.5 text-ink">
            <span className="truncate">{artisan.name}</span>
            <BadgeCheck
              size={18}
              strokeWidth={2.2}
              className="shrink-0 text-accent"
              aria-label="Verified"
            />
          </h2>
          <p className="caption mt-0.5 flex items-center gap-2">
            {tradeName(artisan)}
            <span aria-hidden className="text-faint">
              ·
            </span>
            <span className="flex items-center gap-0.5">
              <MapPin size={11} strokeWidth={2} />
              {artisan.location}
            </span>
          </p>
        </div>

        {/* Beside the name rather than down with the unlock button: passing an
            artisan on is free and costs nothing to consider, so it must never
            sit close enough to the paid action to be mistaken for it. */}
        <ShareButton artisan={artisan} />
      </header>

      {/* The record: three numbers that back the ₦500. */}
      <dl className="mt-4 grid grid-cols-3 overflow-hidden rounded-2xl bg-card">
        <Stat label="Rating">
          <Star
            size={14}
            strokeWidth={2.2}
            fill="currentColor"
            className="text-accent"
          />
          {artisan.rating.toFixed(1)}
        </Stat>
        <Stat label="Experience" divider>
          {artisan.yearsExperience} yrs
        </Stat>
        <Stat label="Jobs done" divider>
          {artisan.jobsCompleted}
        </Stat>
      </dl>

      <p className="mt-4 text-[0.9375rem] leading-relaxed text-sub">
        {artisan.note}
      </p>

      <p className="caption mt-3 flex items-center gap-1.5">
        <BadgeCheck size={13} strokeWidth={2.2} className="text-accent" />
        Visited and verified by the Artiza team · {artisan.verifiedSince}
      </p>

      <ContactPanel artisan={artisan} unlocked={unlocked} details={details} />

      {artisan.work.length > 0 && (
        <Section title="Past work">
          {/* Edge-to-edge rail: the photos are the evidence, so they
              get the full width of the surface rather than a grid. */}
          <div className="no-scrollbar -mx-5 flex snap-x snap-mandatory scroll-px-5 gap-2.5 overflow-x-auto px-5">
            {artisan.work.map((src, i) => (
              <button
                key={src}
                type="button"
                onClick={() => setPhoto({ id: artisan.id, index: i })}
                aria-label={`View ${workAlt(artisan, i)} full screen`}
                className="pressable relative h-64 w-52 shrink-0 snap-start overflow-hidden rounded-2xl bg-fill sm:h-72 sm:w-60"
              >
                {/* The photo is shown whole (`contain`), because a thumbnail
                    that crops the finished garment out of a garment photo is
                    worse than no thumbnail. A blurred, over-scaled copy of the
                    same photo fills whatever the fit leaves over, so a portrait
                    shot in this frame reads as one image rather than as art
                    stranded between two grey bars. */}
                <Image
                  src={src}
                  alt=""
                  aria-hidden
                  fill
                  sizes="64px"
                  quality={30}
                  className="scale-125 object-cover blur-xl saturate-150"
                />
                {/* The button carries the name; a described image here
                    would only be read out twice. */}
                <Image
                  src={src}
                  alt=""
                  fill
                  sizes="(min-width: 640px) 240px, 208px"
                  className="object-contain"
                />
              </button>
            ))}
          </div>
        </Section>
      )}

      <Section title="Services">
        <ul className="flex flex-wrap gap-2">
          {artisan.services.map((service) => (
            <li
              key={service}
              className="rounded-full bg-card px-3 py-1.5 text-sm text-ink"
            >
              {service}
            </li>
          ))}
        </ul>
      </Section>

      <Section
        title={`Reviews (${artisan.reviewCount})`}
        note={
          reviews.length > 0 && reviews.length < artisan.reviewCount
            ? `Showing ${reviews.length} most recent`
            : undefined
        }
      >
        {loadingReviews ? (
          <ul className="space-y-2.5" aria-hidden>
            {[0, 1].map((n) => (
              <li key={n} className="skeleton h-28 rounded-2xl" />
            ))}
          </ul>
        ) : reviews.length === 0 ? (
          <p className="caption">
            No reviews yet — the first one after a job goes here.
          </p>
        ) : (
          <ul className="space-y-2.5">
            {reviews.map((review) => (
              <li key={review.id} className="rounded-2xl bg-card p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="headline text-ink">{review.author}</p>
                  <span className="caption shrink-0">{review.when}</span>
                </div>
                <div
                  className="mt-1 flex gap-0.5"
                  aria-label={`${review.rating} out of 5`}
                >
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star
                      key={n}
                      size={13}
                      strokeWidth={2.2}
                      aria-hidden
                      className={n <= review.rating ? "text-accent" : "text-faint"}
                      fill={n <= review.rating ? "currentColor" : "none"}
                    />
                  ))}
                </div>
                <p className="mt-2 text-[0.9375rem] leading-relaxed text-sub">
                  {review.text}
                </p>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Lightbox
        photos={artisan.work}
        index={openPhoto}
        onClose={() => setPhoto(null)}
        alt={(i) => workAlt(artisan, i)}
      />
    </>
  );
}

/** One description for the photo, whether it's a thumbnail or full screen. */
function workAlt(artisan: Artisan, i: number) {
  return `${tradeName(artisan)} job by ${artisan.name}, photo ${i + 1}`;
}

function Stat({
  label,
  children,
  divider = false,
}: {
  label: string;
  children: React.ReactNode;
  divider?: boolean;
}) {
  return (
    <div className={`px-2 py-3 text-center ${divider ? "border-l border-line" : ""}`}>
      <dd className="figure flex items-center justify-center gap-1 text-[1.0625rem] text-ink">
        {children}
      </dd>
      <dt className="caption mt-0.5">{label}</dt>
    </div>
  );
}

function Section({
  title,
  note,
  children,
}: {
  title: string;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-6">
      <div className="mb-2.5 flex items-baseline justify-between gap-3">
        <h3 className="headline text-ink">{title}</h3>
        {note && <span className="caption shrink-0">{note}</span>}
      </div>
      {children}
    </section>
  );
}
