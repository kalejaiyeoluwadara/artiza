"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BANNERS } from "../lib/artisans";

/**
 * The one promotional surface in the app. It sits under the search field
 * as a photographic rail — a picture with a short label, never a poster.
 * Snap scrolling with a dot readout, so it reads as a stack of cards you
 * flick through rather than a carousel that moves on its own.
 */
export function BannerRail() {
  const railRef = useRef<HTMLUListElement>(null);
  const [active, setActive] = useState(0);

  // Derived from real scroll position, so the dots stay honest during a
  // flick, a drag, or a keyboard scroll.
  function onScroll() {
    const rail = railRef.current;
    if (!rail) return;
    const card = rail.firstElementChild as HTMLElement | null;
    if (!card) return;
    const step = card.offsetWidth + 12; // gap-3
    setActive(Math.round(rail.scrollLeft / step));
  }

  return (
    <section aria-label="Offers" className="mt-5">
      <ul
        ref={railRef}
        onScroll={onScroll}
        className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 md:mx-0 md:px-0"
      >
        {BANNERS.map((banner, i) => (
          <li
            key={banner.id}
            className="flex w-[85%] shrink-0 snap-center sm:w-[60%] lg:w-[46%]"
          >
            <Link
              href={banner.href}
              // min-h-fit keeps the 2:1 picture shape as a floor, not a
              // ceiling — a title that wraps to two lines grows the card
              // instead of being clipped off the top by justify-end.
              className="pressable group relative flex aspect-2/1 h-full min-h-fit w-full flex-col justify-end overflow-hidden rounded-2xl bg-fill p-4 sm:aspect-5/2"
            >
              <Image
                src={banner.image}
                alt=""
                fill
                priority={i === 0}
                sizes="(min-width: 1024px) 460px, (min-width: 640px) 60vw, 85vw"
                className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
              />
              {/* Text sits on a scrim heavy enough to hold white type at
                  any photo brightness. */}
              <div
                aria-hidden
                className="absolute inset-0 bg-linear-to-t from-black/80 via-black/35 to-black/10"
              />

              <div className="relative">
                <p className="title text-white">{banner.title}</p>
                <p className="mt-1 max-w-[28ch] text-sm text-white/80">
                  {banner.body}
                </p>
                <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-sm font-semibold text-ink">
                  {banner.cta}
                  <ArrowRight size={14} strokeWidth={2.4} aria-hidden />
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      {/* Position readout, not a control — tapping dots would compete with
          the swipe that already moves the rail. */}
      <div aria-hidden className="mt-2.5 flex justify-center gap-1.5">
        {BANNERS.map((banner, i) => (
          <span
            key={banner.id}
            className={`h-1.5 rounded-full transition-all duration-300 ease-out ${
              i === active ? "w-4 bg-ink" : "w-1.5 bg-faint"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
