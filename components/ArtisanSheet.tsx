"use client";

import Image from "next/image";
import { BadgeCheck, MapPin, Star } from "lucide-react";
import { Artisan, TRADE_LABELS } from "../lib/artisans";
import { Avatar } from "./ArtisanCard";
import { SealedContact } from "./SealedContact";
import { Sheet } from "./Sheet";

export function ArtisanSheet({
  artisan,
  onClose,
  unlocked,
  onUnlock,
}: {
  artisan: Artisan | null;
  onClose: () => void;
  unlocked: boolean;
  onUnlock: () => void;
}) {
  return (
    <Sheet
      open={artisan !== null}
      onClose={onClose}
      label={artisan ? `${artisan.name}, ${TRADE_LABELS[artisan.trade]}` : ""}
    >
      {artisan && (
        <>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-5">
            <header className="flex items-center gap-3.5 pt-1">
              <Avatar
                name={artisan.name}
                src={artisan.photo}
                size="size-16 text-xl"
              />
              <div className="min-w-0">
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
                  {TRADE_LABELS[artisan.trade]}
                  <span aria-hidden className="text-faint">
                    ·
                  </span>
                  <span className="flex items-center gap-0.5">
                    <MapPin size={11} strokeWidth={2} />
                    {artisan.location}
                  </span>
                </p>
              </div>
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

            {artisan.work.length > 0 && (
              <Section title="Past work">
                {/* Edge-to-edge rail: the photos are the evidence, so they
                    get the full width of the sheet rather than a grid. */}
                <div className="no-scrollbar -mx-5 flex snap-x snap-mandatory gap-2.5 overflow-x-auto px-5">
                  {artisan.work.map((src, i) => (
                    <div
                      key={src}
                      className="relative h-40 w-56 shrink-0 snap-start overflow-hidden rounded-2xl bg-fill"
                    >
                      <Image
                        src={src}
                        alt={`${TRADE_LABELS[artisan.trade]} job by ${
                          artisan.name
                        }, photo ${i + 1}`}
                        fill
                        sizes="224px"
                        className="object-cover"
                      />
                    </div>
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
                artisan.reviews.length < artisan.reviewCount
                  ? `Showing ${artisan.reviews.length} most recent`
                  : undefined
              }
            >
              <ul className="space-y-2.5">
                {artisan.reviews.map((review, i) => (
                  <li key={i} className="rounded-2xl bg-card p-4">
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
                          className={
                            n <= review.rating ? "text-accent" : "text-faint"
                          }
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
            </Section>
          </div>

          {/* The paid action stays pinned and reachable — never scrolled
              away, never competing with the content above it. */}
          <div
            className="chrome shrink-0 border-t border-line px-5 pt-3"
            style={{
              paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))",
            }}
          >
            <SealedContact
              phone={artisan.phone}
              name={artisan.name}
              unlocked={unlocked}
              onUnlock={onUnlock}
            />
          </div>
        </>
      )}
    </Sheet>
  );
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
