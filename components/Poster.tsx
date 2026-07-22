"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { BadgeCheck, ChevronLeft, ChevronRight, Star } from "lucide-react";
import { Artisan, TRADE_COVERS, TRADE_LABELS } from "../lib/artisans";
import { FavoriteButton } from "./FavoriteButton";

/**
 * The Netflix home experiment's unit of browse: a 2:3 poster.
 *
 * Netflix can print the title into the artwork; Artiza's art is an artisan's
 * own job photo, which arrives landscape and unlabelled. So the poster is
 * composed rather than supplied — the work cropped tall, the name and trade
 * set on a bottom-up scrim, and the trade chip where the maturity rating sits.
 * The one thing that never crops is the record: whichever number the rail
 * ranked on rides on the art, because a poster with no evidence is just a
 * photograph.
 */
export function Poster({
  artisan,
  signal,
  width = "w-40 sm:w-48 lg:w-56",
  onOpen,
}: {
  artisan: Artisan;
  /** The number this rail sorted on. Omitted on rails that didn't sort. */
  signal?: React.ReactNode;
  width?: string;
  onOpen: () => void;
}) {
  const cover = artisan.work[0] ?? TRADE_COVERS[artisan.trade];

  return (
    // The heart is its own control, so it sits beside the card's button rather
    // than inside it — nested buttons are invalid and the outer would eat the tap.
    <div className={`hover-lift relative rounded-lg ${width}`}>
      <button
        type="button"
        onClick={onOpen}
        className="pressable group relative block w-full overflow-hidden rounded-lg bg-fill text-left"
      >
        <div className="relative aspect-2/3 w-full">
          <Image
            src={cover}
            alt={`${TRADE_LABELS[artisan.trade]} work by ${artisan.name}`}
            fill
            sizes="(min-width: 1024px) 224px, (min-width: 640px) 192px, 160px"
            className="object-cover"
          />
          {/* Scrim, not a tint — the type has to read without draining the
              colour out of the job underneath it. */}
          <div
            aria-hidden
            className="absolute inset-0 bg-linear-to-t from-black/90 via-black/25 to-black/35"
          />
        </div>

        {artisan.featured && (
          <span className="absolute left-2 top-2 rounded-sm bg-accent px-2 py-0.5 text-[0.6875rem] font-bold uppercase tracking-wide text-white">
            Featured
          </span>
        )}

        <div className="absolute inset-x-0 bottom-0 p-3">
          <p className="flex items-center gap-1.5 text-[0.9375rem] font-bold leading-tight text-white">
            <span className="truncate">{artisan.name}</span>
            <BadgeCheck
              size={14}
              strokeWidth={2.4}
              className="shrink-0"
              aria-label="Verified"
            />
          </p>
          <p className="mt-1 truncate text-[0.8125rem] font-medium text-white/70">
            {TRADE_LABELS[artisan.trade]} · {artisan.location}
          </p>
          {signal ? (
            <p className="figure mt-1.5 flex items-center gap-1 text-[0.8125rem] text-white">
              {signal}
            </p>
          ) : null}
        </div>
      </button>

      <FavoriteButton
        artisanId={artisan.id}
        name={artisan.name}
        className="absolute right-2 top-2"
      />
    </div>
  );
}

/** Ratings and counts, sized for the poster's bottom strip. */
export function RatingSignal({ artisan }: { artisan: Artisan }) {
  return (
    <>
      <Star size={13} strokeWidth={2.4} fill="currentColor" aria-hidden />
      {artisan.rating.toFixed(1)}
      <span className="font-normal text-white/60">({artisan.reviewCount})</span>
    </>
  );
}

/**
 * A row of posters under a heading. Netflix's rails run full-bleed and let the
 * next card peek, which is the whole invitation to scroll — so the rail breaks
 * the page gutter and puts it back as scroll padding.
 */
export function PosterRail({
  heading,
  action,
  artisans,
  signal,
  onOpen,
}: {
  heading: string;
  /** Trailing link, Netflix's "My List ›". Omitted when there's nowhere to go. */
  action?: { label: string; onSelect: () => void };
  artisans: Artisan[];
  signal?: (artisan: Artisan) => React.ReactNode;
  onOpen: (artisan: Artisan) => void;
}) {
  const railRef = useRef<HTMLDivElement>(null);
  const [edge, setEdge] = useState<Edge>("start");

  /* Which arrows are worth showing. A touch screen answers this with the
     rail itself — you can see there is more and you flick it. A mouse cannot,
     so the desktop rail has to say so, and an arrow pointing at nothing is
     worse than no arrow. */
  const onScroll = useCallback(() => {
    const rail = railRef.current;
    if (!rail) return;
    const max = rail.scrollWidth - rail.clientWidth;
    // A pixel of slack: fractional layout widths mean scrollLeft rarely
    // lands exactly on the end.
    if (max <= 1) setEdge("both");
    else if (rail.scrollLeft <= 1) setEdge("start");
    else if (rail.scrollLeft >= max - 1) setEdge("end");
    else setEdge("middle");
  }, []);

  // Runs on mount and whenever the row's contents change, so a rail that
  // arrives short never shows an arrow it doesn't need.
  useEffect(() => {
    onScroll();
  }, [onScroll, artisans]);

  if (artisans.length === 0) return null;

  const headingId = `rail-${heading.replace(/\W+/g, "-").toLowerCase()}`;

  // A page at a time, minus a poster's worth, so the card you were looking
  // at stays on screen as the anchor for where you just came from.
  const page = (direction: 1 | -1) => {
    const rail = railRef.current;
    if (!rail) return;
    rail.scrollBy({ left: direction * rail.clientWidth * 0.8, behavior: "smooth" });
  };

  return (
    <section aria-labelledby={headingId} className="group/rail relative mt-6">
      <div className="flex items-center justify-between gap-3 px-4 md:px-0">
        <h2 id={headingId} className="title text-ink">
          {heading}
        </h2>
        {action && (
          <button
            type="button"
            onClick={action.onSelect}
            className="pressable flex shrink-0 items-center gap-0.5 text-[0.8125rem] font-semibold text-sub"
          >
            {action.label}
            <ChevronRight size={14} strokeWidth={2.4} aria-hidden />
          </button>
        )}
      </div>

      <div
        ref={railRef}
        onScroll={onScroll}
        className="no-scrollbar mt-2 overflow-x-auto scroll-px-4 px-4 md:scroll-px-0 md:px-0"
      >
        {/* py- gives the hover lift somewhere to grow into; without it the
            raised poster is clipped by the scroll container. */}
        <ul className="flex w-max gap-2.5 md:py-2">
          {artisans.map((artisan) => (
            <li key={artisan.id}>
              <Poster
                artisan={artisan}
                signal={signal?.(artisan)}
                onOpen={() => onOpen(artisan)}
              />
            </li>
          ))}
        </ul>
      </div>

      {edge !== "start" && edge !== "both" && (
        <RailArrow direction="left" heading={heading} onClick={() => page(-1)} />
      )}
      {edge !== "end" && edge !== "both" && (
        <RailArrow direction="right" heading={heading} onClick={() => page(1)} />
      )}
    </section>
  );
}

/** Where the rail is sitting. `both` means it doesn't overflow at all. */
type Edge = "start" | "middle" | "end" | "both";

/**
 * Desktop only — a touch rail is flicked, not clicked, and a control that
 * covers a poster to offer a scroll you already have is a net loss on a phone.
 * It fades in with the row rather than sitting there permanently, so a rail at
 * rest is all artwork.
 */
function RailArrow({
  direction,
  heading,
  onClick,
}: {
  direction: "left" | "right";
  heading: string;
  onClick: () => void;
}) {
  const Icon = direction === "left" ? ChevronLeft : ChevronRight;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Scroll ${heading} ${direction}`}
      className={`chrome pressable absolute top-1/2 z-10 hidden size-11 -translate-y-1/2 place-items-center rounded-full text-ink opacity-0 transition-opacity duration-200 ease-out group-hover/rail:opacity-100 focus-visible:opacity-100 md:grid ${
        direction === "left" ? "left-1" : "right-1"
      }`}
    >
      <Icon size={22} strokeWidth={2.4} aria-hidden />
    </button>
  );
}
