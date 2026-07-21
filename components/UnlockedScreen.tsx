"use client";

import { useState } from "react";
import { Artisan } from "../lib/artisans";
import { useArtisans } from "../lib/useData";
import { useUnlocks } from "../lib/useUnlocks";
import { ArtisanCard } from "./ArtisanCard";
import { ArtisanSheet } from "./ArtisanSheet";
import { Placeholder } from "./Placeholder";
import { ArtisanGridSkeleton, LoadingLabel, Skeleton } from "./Skeleton";

/** Contacts already paid for. Reads the same store the unlock writes. */
export function UnlockedScreen() {
  const { isUnlocked, unlock, unlockedIds, ready } = useUnlocks();
  const { artisans, loading } = useArtisans();
  const [selected, setSelected] = useState<Artisan | null>(null);

  // Two reads have to land — the unlock record and the register — and the
  // empty state must never flash at someone who has unlocks, so the screen
  // waits on both behind placeholders.
  if (!ready || loading) {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 pb-28 pt-6 md:px-6 md:pb-16 md:pt-10">
        <LoadingLabel>Loading your unlocked contacts</LoadingLabel>
        <h1 className="title-lg text-ink">Unlocked</h1>
        <Skeleton className="mt-2 h-3 w-52 rounded-md" />
        <ArtisanGridSkeleton count={3} className="mt-5" />
      </div>
    );
  }

  const unlocked = artisans.filter((a) => unlockedIds.includes(a.id));

  if (unlocked.length === 0) {
    return (
      <Placeholder
        title="No contacts unlocked yet"
        body="Contacts you pay to open are kept here, so you never pay twice for the same artisan."
      />
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 pb-28 pt-6 md:px-6 md:pb-16 md:pt-10">
      <h1 className="title-lg text-ink">Unlocked</h1>
      <p className="caption mt-1">
        {unlocked.length} {unlocked.length === 1 ? "contact" : "contacts"} you
        can reach any time.
      </p>

      <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {unlocked.map((artisan) => (
          <li key={artisan.id}>
            <ArtisanCard
              artisan={artisan}
              unlocked
              onOpen={() => setSelected(artisan)}
            />
          </li>
        ))}
      </ul>

      <ArtisanSheet
        artisan={selected}
        onClose={() => setSelected(null)}
        unlocked={selected ? isUnlocked(selected.id) : false}
        onUnlock={() => selected && unlock(selected.id)}
      />
    </div>
  );
}
