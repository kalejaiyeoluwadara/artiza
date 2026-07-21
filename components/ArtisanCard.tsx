import { MapPin, Star } from "lucide-react";
import { Artisan, TRADE_LABELS } from "../lib/artisans";
import { SealedContact } from "./SealedContact";

export function ArtisanCard({ artisan }: { artisan: Artisan }) {
  return (
    <article className="hover-surface relative flex h-full flex-col overflow-hidden rounded-sm border border-line bg-ash transition-colors duration-200">
      {/* Featured is a solid brass rule, not a second accent colour. */}
      {artisan.featured && (
        <div className="h-0.5 w-full bg-brass" aria-hidden />
      )}

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <header className="flex items-start gap-3">
          <Monogram name={artisan.name} />
          <div className="min-w-0 flex-1">
            <h3 className="type-display truncate text-h3 text-bone">
              {artisan.name}
            </h3>
            <p className="type-label mt-0.5 text-brass">
              {TRADE_LABELS[artisan.trade]}
            </p>
          </div>
          {artisan.featured && (
            <span className="type-label shrink-0 rounded-xs bg-brass px-1.5 py-0.5 text-ink">
              Featured
            </span>
          )}
        </header>

        <p className="mt-3 flex items-center gap-1.5 text-sm text-smoke">
          <MapPin size={13} strokeWidth={2} className="shrink-0" />
          {artisan.location}
        </p>

        <p className="mt-2 line-clamp-2 text-sm text-smoke">{artisan.note}</p>

        {/* The record: what the ₦500 is backed by. */}
        <dl className="mt-4 grid grid-cols-3 gap-px overflow-hidden rounded-sm border border-line bg-line">
          <Stat label="Rating">
            <Star size={12} strokeWidth={2.5} fill="currentColor" className="text-brass" />
            {artisan.rating.toFixed(1)}
            <span className="ml-0.5 text-xs font-normal text-mute">
              ({artisan.reviewCount})
            </span>
          </Stat>
          <Stat label="Experience">
            {artisan.yearsExperience}
            <span className="ml-0.5 text-xs font-normal text-mute">yrs</span>
          </Stat>
          <Stat label="Jobs">{artisan.jobsCompleted}</Stat>
        </dl>

        <p className="type-label mt-3">Verified {artisan.verifiedSince}</p>

        <div className="mt-4 flex-1" />

        <SealedContact phone={artisan.phone} name={artisan.name} compact />
      </div>
    </article>
  );
}

function Stat({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-ash px-2 py-2.5 text-center">
      <dt className="type-label">{label}</dt>
      <dd className="type-figure mt-1 flex items-center justify-center gap-1 text-sm text-bone">
        {children}
      </dd>
    </div>
  );
}

/**
 * Stands in for a portrait until the team photographs each artisan.
 * Initials on ash with a brass hairline reads as a record photo slot
 * rather than a missing image.
 */
function Monogram({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("");

  return (
    <span
      aria-hidden
      className="type-display grid size-11 shrink-0 place-items-center rounded-sm border border-brass-dim bg-ink text-sm text-brass"
    >
      {initials}
    </span>
  );
}
