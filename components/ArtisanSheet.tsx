"use client";

import { Artisan, tradeName } from "../lib/artisans";
import { useArtisanContact } from "../lib/useArtisanContact";
import { ArtisanProfile } from "./ArtisanProfile";
import { SealedContact } from "./SealedContact";
import { Sheet } from "./Sheet";

/**
 * The profile as a modal — a card opens this, and buying happens here.
 *
 * The body is `ArtisanProfile`, shared verbatim with `/artisan/[slug]`, the
 * page a shared link opens. What belongs to the sheet and stays here is the
 * modal itself and the pinned unlock footer.
 */
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
  // Loads on open and is dropped on close — and only once the customer has
  // actually paid for it.
  const { details, loading: loadingDetails } = useArtisanContact(
    artisan?.id ?? null,
    unlocked,
  );

  return (
    <Sheet
      open={artisan !== null}
      onClose={onClose}
      label={artisan ? `${artisan.name}, ${tradeName(artisan)}` : ""}
    >
      {artisan && (
        <>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-5">
            <ArtisanProfile
              artisan={artisan}
              unlocked={unlocked}
              details={details}
            />
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
              artisan={artisan}
              unlocked={unlocked}
              details={details}
              loadingDetails={loadingDetails}
              onUnlock={onUnlock}
            />
          </div>
        </>
      )}
    </Sheet>
  );
}
