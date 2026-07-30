"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { ArtisanProfile } from "../../../components/ArtisanProfile";
import { FavoriteButton } from "../../../components/FavoriteButton";
import { SealedContact } from "../../../components/SealedContact";
import type { Artisan } from "../../../lib/artisans";
import { useArtisanContact } from "../../../lib/useArtisanContact";
import { useUnlocks } from "../../../context/UnlocksContext";

/**
 * The shared profile, as a screen.
 *
 * Deliberately the sheet's dimensions and not the app's usual `max-w-5xl`
 * column: the body is the very same `ArtisanProfile`, laid out at the width it
 * was designed at, so a link opens the thing the sender was looking at rather
 * than a wide-screen variant of it. Everything around it is the sheet's chrome
 * translated to a page — a way back where the grabber was, and the unlock bar
 * stuck to the bottom of the viewport rather than to the bottom of a drawer.
 *
 * Whoever arrives here may never have seen Artiza. The record is free to read
 * on purpose, so nothing above the unlock bar is gated and nothing asks them
 * to sign in before they have decided the artisan is worth ₦500.
 */
export function ArtisanScreen({ artisan }: { artisan: Artisan }) {
  const { isUnlocked, unlock } = useUnlocks();
  const unlocked = isUnlocked(artisan.id);
  const { details, loading: loadingDetails } = useArtisanContact(
    artisan.id,
    unlocked,
  );

  return (
    <div className="mx-auto w-full max-w-lg px-5 pt-4 pb-28 md:pb-16">
      <div className="mb-4 flex items-center justify-between gap-3">
        <Link
          href="/"
          className="pressable hover-fill -ml-2 flex items-center gap-1 rounded-full py-1.5 pr-3 pl-2 text-[0.9375rem] font-semibold text-sub"
        >
          <ChevronLeft size={18} strokeWidth={2.4} aria-hidden />
          All artizans
        </Link>

        {/* Saving belongs up here rather than in the profile: on a card the
            heart floats over the cover photo, and there is no cover on a page. */}
        <FavoriteButton artisanId={artisan.id} name={artisan.name} />
      </div>

      <ArtisanProfile artisan={artisan} unlocked={unlocked} details={details} />

      {/* The paid action never scrolls away here either — it sticks to the
          viewport, clearing the tab bar on mobile, which is only a floor on
          screens narrower than `md`. Negative margins take the bar to the full
          width of the column so it reads as chrome and not as another card. */}
      <div
        className="chrome sticky bottom-[calc(4.9rem+env(safe-area-inset-bottom))] z-30 -mx-5 mt-8 border-t border-line px-5 pt-3 pb-3 md:bottom-0 md:pb-4"
      >
        <SealedContact
          artisan={artisan}
          unlocked={unlocked}
          details={details}
          loadingDetails={loadingDetails}
          onUnlock={() => void unlock(artisan.id, artisan.name)}
        />
      </div>
    </div>
  );
}
