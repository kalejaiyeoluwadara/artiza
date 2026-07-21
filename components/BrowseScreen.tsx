"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { BadgeCheck, Star } from "lucide-react";
import {
  ARTISANS,
  Artisan,
  TRADE_COVERS,
  TRADE_LABELS,
  Trade,
  rankArtisans,
} from "../lib/artisans";
import { useUnlocks } from "../lib/useUnlocks";
import { ArtisanCard, Avatar } from "./ArtisanCard";
import { ArtisanSheet } from "./ArtisanSheet";

const TRADES = Object.keys(TRADE_LABELS) as Trade[];

/**
 * Owns the browse state and the one sheet instance. A single sheet
 * shared by every entry point keeps the open/close transition identical
 * wherever you tapped from.
 */
export function BrowseScreen() {
  const [trade, setTrade] = useState<Trade | null>(null);
  const [selected, setSelected] = useState<Artisan | null>(null);
  const { isUnlocked, unlock } = useUnlocks();

  const featured = useMemo(
    () => rankArtisans(ARTISANS.filter((a) => a.featured)),
    []
  );

  const results = useMemo(
    () => rankArtisans(ARTISANS.filter((a) => !trade || a.trade === trade)),
    [trade]
  );

  return (
    <>
      {featured.length > 0 && (
        <section aria-labelledby="featured-heading" className="mt-7">
          <h2 id="featured-heading" className="title text-ink">
            Featured
          </h2>
          {/* Snap carousel, edge-to-edge on mobile. */}
          <div className="no-scrollbar -mx-4 mt-3 snap-x snap-mandatory overflow-x-auto px-4 md:mx-0 md:px-0">
            <ul className="flex w-max gap-3">
              {featured.map((artisan) => (
                <li key={artisan.id} className="snap-start">
                  <FeaturedCard
                    artisan={artisan}
                    onOpen={() => setSelected(artisan)}
                  />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <section aria-labelledby="browse-heading" className="mt-7">
        <div className="no-scrollbar -mx-4 overflow-x-auto px-4 md:mx-0 md:px-0">
          <div className="flex w-max gap-2 md:w-auto md:flex-wrap">
            <Chip active={trade === null} onClick={() => setTrade(null)}>
              All
            </Chip>
            {TRADES.map((t) => (
              <Chip key={t} active={trade === t} onClick={() => setTrade(t)}>
                {TRADE_LABELS[t]}
              </Chip>
            ))}
          </div>
        </div>

        <div className="mt-5 flex items-baseline justify-between">
          <h2 id="browse-heading" className="title text-ink">
            {trade ? `${TRADE_LABELS[trade]}s` : "All artisans"}
          </h2>
          <p className="caption">
            {results.length} {results.length === 1 ? "artisan" : "artisans"}
          </p>
        </div>

        {results.length === 0 ? (
          <p className="mt-4 rounded-2xl bg-card p-8 text-center text-sm text-sub">
            No {trade && TRADE_LABELS[trade].toLowerCase()}s listed in Ilisan
            yet. Try another trade — the team adds artisans weekly.
          </p>
        ) : (
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((artisan) => (
              <li key={artisan.id}>
                <ArtisanCard
                  artisan={artisan}
                  unlocked={isUnlocked(artisan.id)}
                  onOpen={() => setSelected(artisan)}
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      <ArtisanSheet
        artisan={selected}
        onClose={() => setSelected(null)}
        unlocked={selected ? isUnlocked(selected.id) : false}
        onUnlock={() => selected && unlock(selected.id)}
      />
    </>
  );
}

/**
 * Featured is a promoted slot, so it gets the app's most image-forward
 * treatment: the work fills the card and the type sits on top of it.
 */
function FeaturedCard({
  artisan,
  onOpen,
}: {
  artisan: Artisan;
  onOpen: () => void;
}) {
  const cover = artisan.work[0] ?? TRADE_COVERS[artisan.trade];

  return (
    <button
      type="button"
      onClick={onOpen}
      className="pressable group relative flex h-56 w-64 flex-col justify-end overflow-hidden rounded-2xl bg-fill p-4 text-left"
    >
      <Image
        src={cover}
        alt={`${TRADE_LABELS[artisan.trade]} work by ${artisan.name}`}
        fill
        sizes="256px"
        className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-linear-to-t from-black/85 via-black/30 to-black/10"
      />

      <span className="absolute left-3 top-3 rounded-full bg-accent px-2.5 py-1 text-xs font-semibold text-white">
        Featured
      </span>

      <div className="relative flex items-end gap-2.5">
        <Avatar
          name={artisan.name}
          src={artisan.photo}
          size="size-11"
          className="ring-2 ring-white/70"
        />
        <div className="min-w-0 flex-1">
          <p className="headline flex items-center gap-1.5 text-white">
            <span className="truncate">{artisan.name}</span>
            <BadgeCheck
              size={15}
              strokeWidth={2.2}
              className="shrink-0 text-white"
              aria-label="Verified"
            />
          </p>
          <p className="caption text-white/75">{TRADE_LABELS[artisan.trade]}</p>
        </div>
      </div>

      <p className="figure relative mt-2.5 flex items-center gap-3 text-sm text-white">
        <span className="flex items-center gap-1">
          <Star size={13} strokeWidth={2.2} fill="currentColor" aria-hidden />
          {artisan.rating.toFixed(1)}
          <span className="font-normal text-white/70">
            ({artisan.reviewCount})
          </span>
        </span>
        <span>
          {artisan.jobsCompleted}
          <span className="ml-1 font-normal text-white/70">jobs</span>
        </span>
      </p>
    </button>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`pressable shrink-0 rounded-full px-4 py-2 text-sm font-medium ${
        active
          ? "bg-ink text-canvas"
          : "hover-fill bg-card text-ink shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
      }`}
    >
      {children}
    </button>
  );
}
