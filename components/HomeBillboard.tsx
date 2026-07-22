"use client";

import Image from "next/image";
import { Check, ChevronRight, Plus } from "lucide-react";
import { Artisan, TRADE_COVERS, TRADE_LABELS } from "../lib/artisans";
import { useFavorites } from "../lib/useFavorites";

/**
 * The billboard. Netflix opens on one title at full bleed, and everything
 * about the layout is in service of the art: the page gutter is gone, the
 * header floats on top of it, and the bottom edge dissolves into the canvas
 * rather than ending on a line.
 *
 * Artiza's version promotes a person, so the thing at full bleed is their
 * work, and the "genre" row underneath is the record — trade, years, jobs —
 * because that is what the decision actually turns on. The primary action is
 * View profile, not Unlock: the list is still for choosing and the sheet is
 * still where buying happens.
 */
export function HomeBillboard({
  artisan,
  onOpen,
}: {
  artisan: Artisan;
  onOpen: () => void;
}) {
  const { isFavorite, toggle, ready } = useFavorites();
  const saved = ready && isFavorite(artisan.id);
  const cover = artisan.work[0] ?? TRADE_COVERS[artisan.trade];

  return (
    <section
      aria-labelledby="billboard-name"
      className="relative -mt-16 flex min-h-[30rem] flex-col justify-end px-4 pb-4 pt-24 md:-mt-14 md:min-h-[34rem] md:px-0"
    >
      <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden">
        <Image
          src={cover}
          alt=""
          fill
          // The one image above the fold on this screen, so it's the one that
          // gets to preload.
          priority
          sizes="100vw"
          className="object-cover"
        />
        {/* Two scrims doing different jobs: the top one keeps the floating
            header legible, the bottom one dissolves the art into the canvas
            so the first rail scrolls out of the photo instead of off a seam. */}
        <div className="absolute inset-0 bg-linear-to-b from-black/70 via-black/10 to-transparent" />
        <div className="absolute inset-0 bg-linear-to-t from-canvas via-canvas/55 to-transparent" />
      </div>

      <p className="text-[0.6875rem] font-bold uppercase tracking-[0.22em] text-sub">
        <span className="text-accent">Verified</span> · Ilisan
      </p>

      <h1
        id="billboard-name"
        className="title-lg mt-1.5 text-ink"
      >
        {artisan.name}
      </h1>

      {/* Netflix's genre row, read as credentials. Middots are decoration, so
          they're hidden rather than announced between every item. */}
      <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.8125rem] font-medium text-ink">
        {[
          TRADE_LABELS[artisan.trade],
          `${artisan.yearsExperience} yrs`,
          `${artisan.jobsCompleted} jobs`,
          `${artisan.rating.toFixed(1)} rating`,
        ].map((item, index) => (
          <span key={item} className="flex items-center gap-2">
            {index > 0 && (
              <span aria-hidden className="text-faint">
                ·
              </span>
            )}
            {item}
          </span>
        ))}
      </p>

      <div className="mt-4 flex items-center gap-2.5">
        <button
          type="button"
          onClick={onOpen}
          className="pressable flex flex-1 items-center justify-center gap-1 rounded-md bg-card px-5 py-2.5 text-[0.9375rem] font-bold text-ink"
        >
          View profile
          <ChevronRight size={17} strokeWidth={2.6} aria-hidden />
        </button>

        <button
          type="button"
          onClick={() => toggle(artisan.id)}
          aria-pressed={saved}
          className="pressable flex flex-1 items-center justify-center gap-1.5 rounded-md bg-fill px-5 py-2.5 text-[0.9375rem] font-bold text-ink"
        >
          {saved ? (
            <Check size={17} strokeWidth={2.6} aria-hidden />
          ) : (
            <Plus size={17} strokeWidth={2.6} aria-hidden />
          )}
          {saved ? "Saved" : "Save"}
        </button>
      </div>
    </section>
  );
}
