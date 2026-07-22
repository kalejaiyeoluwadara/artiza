"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Banner } from "../lib/artisans";
import { useBanners } from "../lib/useData";

/** How long a slide holds before the rail advances itself. */
const DWELL = 6000;
/** How long after a touch or a hover ends before auto-advance resumes. */
const RESUME = 4000;

/**
 * The billboard: the offers carousel, full bleed, auto-advancing.
 *
 * Netflix opens on one title. Artiza opens on what it is actually selling —
 * the admin-managed offers from `/admin/banners` — because a bundle is the
 * only thing on this screen with a price on it, and the rails below already
 * do the work of arguing for individual artisans.
 *
 * Promotion is the one thing the page can genuinely do without, so there is no
 * stand-in: while the offers read is in flight, and if it comes back empty or
 * fails, the billboard is simply absent and the rails move up. It used to fall
 * back to a spotlight on the top-ranked artisan, which meant that on a slow
 * connection a placeholder appeared first and the real offer replaced it a
 * moment later — the page appearing to change its mind about what it sells.
 * Nothing, briefly, is better than something untrue.
 */
export function HomeBillboard({
  banners: initialBanners,
}: {
  /* Read on the server alongside the register, so the carousel is in the HTML
     rather than appearing a round trip after it. Absent means the server read
     failed and the hook fetches from the browser, as it used to. */
  banners?: Banner[];
}) {
  const { banners, error } = useBanners(initialBanners);
  const count = error ? 0 : banners.length;

  const railRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  const reduced = useReducedMotion();

  /* Auto-advance. The rail's own scroll position is the source of truth for
     which slide is showing — reading it back each tick rather than tracking an
     index means a swipe and the timer are the same mechanism and can never
     disagree, and a half-swiped rail advances from where the finger left it. */
  useEffect(() => {
    if (reduced || paused || count < 2) return;

    const id = setInterval(() => {
      const rail = railRef.current;
      if (!rail || rail.clientWidth === 0) return;
      const current = Math.round(rail.scrollLeft / rail.clientWidth);
      rail.scrollTo({
        left: ((current + 1) % count) * rail.clientWidth,
        behavior: "smooth",
      });
    }, DWELL);

    return () => clearInterval(id);
  }, [paused, count, reduced]);

  /* A carousel that keeps moving in a background tab is spending battery to
     animate something nobody is looking at. */
  useEffect(() => {
    const onVisibility = () => setPaused(document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  // Any deliberate attention — a touch, a hover, tabbing into a CTA — stops
  // the rail moving under the person looking at it.
  const hold = () => setPaused(true);
  const release = () => {
    window.setTimeout(() => setPaused(false), RESUME);
  };

  if (count === 0) return null;

  return (
    <section
      aria-label="Offers"
      aria-roledescription="carousel"
      className="relative pt-2"
      onPointerDown={hold}
      onPointerUp={release}
      onPointerCancel={release}
      onMouseEnter={hold}
      onMouseLeave={release}
      onFocusCapture={hold}
      onBlurCapture={release}
    >
      <div
        ref={railRef}
        className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto"
      >
        {banners.map((banner, i) => (
          <Slide key={banner.id} image={banner.image} priority={i === 0}>
            <BannerContent banner={banner} />
          </Slide>
        ))}
      </div>

    </section>
  );
}

/**
 * The frame every slide shares: an inset card, not a full-bleed wall. The art
 * keeps the page gutter and its own 16px corner, so the billboard reads as the
 * first and largest card in a stack of them rather than as a page header — and
 * the rails below inherit the same left edge.
 *
 * The art is a plain absolute layer at the back of this element's own stacking
 * context; a negative z-index would put it behind the page background instead
 * and paint nothing at all.
 */
function Slide({
  image,
  priority,
  children,
}: {
  image: string;
  priority?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="w-full shrink-0 snap-center snap-always px-4 md:px-0">
      <div className="relative flex min-h-112 flex-col justify-end overflow-hidden rounded-2xl bg-fill p-5 md:min-h-128 md:p-10 lg:min-h-[38rem] lg:p-14">
        <Image
          src={image}
          alt=""
          fill
          priority={priority}
          sizes="(min-width: 1024px) 1536px, 100vw"
          className="object-cover"
        />
        {/* Scrim, not a tint: type has to hold at any photo brightness without
            draining the colour out of the art underneath it. On a phone the
            type sits under the art so the scrim runs bottom-up; on a wide
            screen it sits beside it, so a second one runs left-to-right and
            leaves the right half of the photo unclouded. */}
        <div
          aria-hidden
          className="absolute inset-0 bg-linear-to-t from-black/90 via-black/40 to-black/20 md:from-black/70 md:via-black/20 md:to-transparent"
        />
        <div
          aria-hidden
          className="absolute inset-0 hidden bg-linear-to-r from-black/85 via-black/45 to-transparent md:block"
        />

        {/* Centred on a phone, where the type is a caption under the art.
            Left-aligned and column-width from `md`, where centring 60ch of
            offer copy across a 1400px card would leave nothing to read
            along — the eye needs one left edge to return to. */}
        <div className="relative flex flex-col items-center text-center md:max-w-xl md:items-start md:text-left lg:max-w-2xl">
          {children}
        </div>
      </div>
    </div>
  );
}

/**
 * Sets the last word of a display headline in the serif italic accent voice —
 * the Clash/Instrument clash that gives offer titles their poster feel.
 * Single-word titles stay entirely in Clash; the accent needs a straight
 * word beside it to read as deliberate.
 */
function AccentedTitle({ title }: { title: string }) {
  const words = title.trim().split(/\s+/);
  if (words.length < 2) return <>{title}</>;
  const last = words.pop();
  return (
    <>
      {words.join(" ")} <span className="display-accent">{last}</span>
    </>
  );
}

/** An offer: what it is, what it gets you, one way in. */
function BannerContent({ banner }: { banner: Banner }) {
  return (
    <>
      <p className="text-[0.6875rem] font-bold uppercase tracking-[0.22em] text-accent">
        Offer
      </p>
      <h2 className="display mt-1.5 text-ink">
        <AccentedTitle title={banner.title} />
      </h2>
      <p className="mt-2 max-w-[36ch] text-[0.9375rem] leading-relaxed text-sub md:mt-3 md:text-base">
        {banner.body}
      </p>

      <Link
        href={banner.href}
        className="pressable hover-dim mt-4 inline-flex items-center gap-1.5 rounded-md bg-accent px-5 py-2.5 text-[0.9375rem] font-bold text-white md:mt-6 md:px-7 md:py-3 md:text-base"
      >
        {banner.cta}
        <ArrowRight size={16} strokeWidth={2.6} aria-hidden />
      </Link>
    </>
  );
}

