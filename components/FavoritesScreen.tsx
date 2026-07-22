"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Artisan } from "../lib/artisans";
import { useArtisans } from "../lib/useData";
import { useFavorites } from "../lib/useFavorites";
import { useUnlocks } from "../context/UnlocksContext";
import { ArtisanCard } from "./ArtisanCard";
import { ArtisanSheet } from "./ArtisanSheet";
import { ArtisanGridSkeleton } from "./Skeleton";
import { PageHeader } from "./PageHeader";

/**
 * Everything saved on this device.
 *
 * The same card as the register, deliberately — a saved artisan is not a
 * different kind of thing, and a second card style would only make the list
 * harder to read against the one it came from.
 */
export function FavoritesScreen() {
  const { ids, ready, clear } = useFavorites();
  const { artisans, loading } = useArtisans();
  const { isUnlocked, unlock } = useUnlocks();
  const [selected, setSelected] = useState<Artisan | null>(null);

  // Ordered by the saved list, not the register, so the most recently saved
  // sits first — that is the order someone remembers doing it in.
  const saved = ids
    .map((id) => artisans.find((artisan) => artisan.id === id))
    .filter((artisan): artisan is Artisan => Boolean(artisan));

  return (
    <div className="mx-auto w-full max-w-5xl px-4 pb-28 pt-6 md:px-6 md:pb-16 md:pt-10">
      <PageHeader
        title="Favourites"
        subtitle={
          ready && saved.length > 0
            ? `${saved.length} ${
                saved.length === 1 ? "artisan" : "artisans"
              } saved on this device.`
            : undefined
        }
        action={
          ready && saved.length > 0 ? (
            <button
              type="button"
              onClick={clear}
              className="pressable shrink-0 text-[0.8125rem] font-semibold text-accent"
            >
              Clear
            </button>
          ) : undefined
        }
      />

      {!ready || loading ? (
        <div className="mt-6">
          <ArtisanGridSkeleton count={3} className="" />
        </div>
      ) : saved.length === 0 ? (
        <div className="mt-16 flex flex-col items-center text-center">
          <span className="grid size-20 place-items-center rounded-full bg-accent-soft text-accent">
            <svg
              viewBox="0 0 32 32"
              className="size-8"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M16 27S4 20 4 12a6.5 6.5 0 0 1 12-3.6A6.5 6.5 0 0 1 28 12c0 8-12 15-12 15Z" />
            </svg>
          </span>

          <h2 className="title mt-5 text-ink">Nothing saved yet</h2>
          <p className="mt-2 max-w-xs text-[0.9375rem] leading-relaxed text-sub">
            Tap the heart on any artisan to keep them here while you decide.
            Saving is free — you only pay when you unlock a contact.
          </p>
          <Link
            href="/"
            className="pressable hover-dim mt-6 inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-[0.9375rem] font-semibold text-white shadow-sm"
          >
            Browse artisans
            <ChevronRight size={16} strokeWidth={2.2} />
          </Link>
        </div>
      ) : (
        <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {saved.map((artisan) => (
            <li key={artisan.id} className="h-full">
              <ArtisanCard
                artisan={artisan}
                unlocked={isUnlocked(artisan.id)}
                onOpen={() => setSelected(artisan)}
              />
            </li>
          ))}
        </ul>
      )}

      <ArtisanSheet
        artisan={selected}
        onClose={() => setSelected(null)}
        unlocked={selected ? isUnlocked(selected.id) : false}
        onUnlock={() => selected && void unlock(selected.id, selected.name)}
      />
    </div>
  );
}
