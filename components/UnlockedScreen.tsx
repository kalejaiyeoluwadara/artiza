"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Phone,
  MessageCircle,
  Copy,
  Star,
  Check,
  Search,
  ChevronRight,
  BadgeCheck,
  MapPin,
  Clock,
  Briefcase,
  Unlock,
} from "lucide-react";
import { CreditCoinIcon } from "./CreditCoinIcon";
import { PageHeader } from "./PageHeader";
import { Artisan, TRADE_COVERS, TRADE_LABELS } from "../lib/artisans";
import { useArtisans } from "../lib/useData";
import { useArtisanContact } from "../lib/useArtisanContact";
import { useUnlocks } from "../context/UnlocksContext";
import { Avatar } from "./ArtisanCard";
import { ArtisanSheet } from "./ArtisanSheet";
import { RatingModal } from "./RatingModal";
export function UnlockedScreen() {
  const { isUnlocked, unlock, unlockedIds, credits, ready, submitRating, hasReviewed } =
    useUnlocks();
  const { artisans, loading } = useArtisans();
  const [selected, setSelected] = useState<Artisan | null>(null);
  const [ratingArtisan, setRatingArtisan] = useState<Artisan | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  if (!ready || loading) return null;

  const unlocked = artisans.filter((a) => unlockedIds.includes(a.id));

  const filtered = unlocked.filter((a) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      a.name.toLowerCase().includes(q) ||
      TRADE_LABELS[a.trade].toLowerCase().includes(q) ||
      a.location.toLowerCase().includes(q)
    );
  });

  const handleCopyPhone = (phone: string, id: string) => {
    navigator.clipboard.writeText(phone);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (unlocked.length === 0) {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 pb-28 pt-6 md:px-6 md:pb-16 md:pt-10">
        <PageHeader
          title="Unlocked Contacts"
          compactTitle="Unlocked"
          action={
            credits > 0 ? (
              <span className="caption figure rounded-full bg-accent-soft px-3 py-1 font-semibold text-accent">
                {credits} {credits === 1 ? "credit" : "credits"} ready
              </span>
            ) : undefined
          }
        />

        <div className="mt-16 flex flex-col items-center text-center">
          <div className="flex size-20 items-center justify-center rounded-full bg-accent-soft">
            <Unlock size={32} strokeWidth={1.8} className="text-accent" />
          </div>
          <h2 className="title mt-5 text-ink">No contacts unlocked yet</h2>
          <p className="mt-2 max-w-xs text-[0.9375rem] leading-relaxed text-sub">
            Contacts you pay to open are kept here forever so you never pay twice for the same artisan in Ilisan.
          </p>
          <Link
            href="/"
            className="pressable hover-dim mt-6 inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-[0.9375rem] font-semibold text-white shadow-sm"
          >
            Browse Vetted Artisans
            <ChevronRight size={16} strokeWidth={2.2} />
          </Link>
        </div>
      </div>
    );
  }

  const unratedArtisans = unlocked.filter((a) => !hasReviewed(a.id));

  return (
    <div className="mx-auto w-full max-w-5xl px-4 pb-28 pt-6 md:px-6 md:pb-16 md:pt-10">
      <PageHeader
        title="Unlocked Contacts"
        compactTitle="Unlocked"
        subtitle={`${unlocked.length} ${
          unlocked.length === 1 ? "artisan" : "artisans"
        } in your contact book, kept for good.`}
        action={<CreditsLink credits={credits} />}
      />

      {/* Search within unlocked list */}
      {unlocked.length > 2 && (
        <div className="relative mt-5">
          <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-faint" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search your unlocked contacts..."
            className="w-full rounded-2xl border border-line bg-card py-3 pl-11 pr-4 text-[0.9375rem] text-ink placeholder:text-faint focus:border-accent focus:outline-hidden"
          />
        </div>
      )}

      {/* Post-Job Rating Banner */}
      {unratedArtisans.length > 0 && (
        <div className="mt-6 overflow-hidden rounded-2xl border border-accent/15 bg-accent-soft/50 p-4">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent/10">
              <Star size={18} strokeWidth={2.2} className="text-accent" fill="currentColor" />
            </div>
            <div className="min-w-0">
              <h3 className="headline text-ink">
                Has a recent job been completed?
              </h3>
              <p className="caption mt-0.5">
                Leave a rating to help others in Ilisan find verified hand workers.
              </p>
            </div>
          </div>

          {/* Edge-bleeding horizontal scroller, except on phones, where the
              rows stack full-width instead. */}
          <div className="no-scrollbar -mx-4 mt-4 flex gap-2.5 overflow-x-auto px-4 pb-0.5 max-sm:mx-0 max-sm:flex-col max-sm:overflow-x-visible max-sm:px-0">
            {unratedArtisans.map((artisan) => (
              <button
                key={artisan.id}
                onClick={() => setRatingArtisan(artisan)}
                className="pressable flex shrink-0 items-center gap-3 rounded-2xl bg-card border border-line p-2.5 pr-4 max-sm:w-full"
              >
                <Avatar name={artisan.name} src={artisan.photo} size="size-10 text-sm" />
                <div className="text-left max-sm:min-w-0">
                  <h4 className="text-sm font-bold text-ink max-sm:truncate">{artisan.name}</h4>
                  <p className="caption text-[11px] max-sm:truncate">{TRADE_LABELS[artisan.trade]}</p>
                </div>
                <div className="ml-1 flex shrink-0 items-center gap-1 rounded-full bg-accent px-3 py-1.5 text-xs font-semibold text-white max-sm:ml-auto">
                  <Star size={11} fill="currentColor" />
                  Rate
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Contact cards */}
      <div className="mt-6">
        {filtered.length === 0 && query.trim() && (
          <div className="flex flex-col items-center py-16 text-center">
            <Search size={32} strokeWidth={1.5} className="text-faint" />
            <p className="headline mt-3 text-ink">No match found</p>
            <p className="caption mt-1 text-sub">
              Try a different name, trade, or location.
            </p>
          </div>
        )}

        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((artisan) => (
            <UnlockedCard
              key={artisan.id}
              artisan={artisan}
              rated={hasReviewed(artisan.id)}
              copiedId={copiedId}
              onCopy={handleCopyPhone}
              onOpen={() => setSelected(artisan)}
            />
          ))}
        </ul>
      </div>

      <ArtisanSheet
        artisan={selected}
        onClose={() => setSelected(null)}
        unlocked={selected ? isUnlocked(selected.id) : false}
        onUnlock={() => selected && void unlock(selected.id, selected.name)}
      />

      <RatingModal
        artisan={ratingArtisan}
        onClose={() => setRatingArtisan(null)}
        onSubmit={submitRating}
      />
    </div>
  );
}

/** The credits shortcut that rides in the header, on both the large title and
 *  the collapsed bar. */
function CreditsLink({ credits }: { credits: number }) {
  return (
    <Link
      href="/account"
      className="pressable group flex items-center gap-2.5 rounded-full border border-line bg-card px-4 py-2 text-sm font-semibold text-ink"
    >
      <span className="flex size-7 items-center justify-center rounded-full bg-accent-soft text-accent">
        <CreditCoinIcon size={14} />
      </span>
      <span>{credits > 0 ? `${credits} credits` : "Buy Bundle"}</span>
      <ChevronRight
        size={14}
        className="text-faint transition-transform duration-200 group-hover:translate-x-0.5"
      />
    </Link>
  );
}

/**
 * One unlocked contact.
 *
 * Its own component because each row loads its own sealed details, and a hook
 * per row is what gives each one an independent request that cancels cleanly
 * when the list re-filters or the screen unmounts.
 */
function UnlockedCard({
  artisan,
  rated,
  copiedId,
  onCopy,
  onOpen,
}: {
  artisan: Artisan;
  rated: boolean;
  copiedId: string | null;
  onCopy: (phone: string, id: string) => void;
  onOpen: () => void;
}) {
  const { details, loading } = useArtisanContact(artisan.id, true);
  const coverSrc = artisan.work[0] ?? TRADE_COVERS[artisan.trade];
  const phone = details?.phone;

  return (
    <li className="flex flex-col overflow-hidden rounded-2xl bg-card">
      {/* Work photo cover */}
      <button
        type="button"
        onClick={onOpen}
        className="pressable group relative w-full overflow-hidden bg-fill md:aspect-[16/10]"
      >
        <Image
          src={coverSrc}
          alt={`${TRADE_LABELS[artisan.trade]} work by ${artisan.name}`}
          fill
          sizes="(min-width: 1024px) 340px, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-linear-to-b from-black/20 via-transparent to-black/30"
        />
        <span className="chrome absolute left-3 top-3 rounded-full px-2.5 py-1 text-xs font-semibold text-ink">
          {TRADE_LABELS[artisan.trade]}
        </span>
        {rated && (
          <span className="chrome absolute right-3 top-3 flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold text-ink">
            <Star size={11} fill="currentColor" className="text-accent" />
            Rated
          </span>
        )}
      </button>

      {/* Profile info */}
      <div className="flex flex-col p-4">
        <button
          type="button"
          onClick={onOpen}
          className="pressable flex items-start gap-3 text-left"
        >
          <Avatar
            name={artisan.name}
            src={artisan.photo}
            size="size-12 text-base"
            className="relative z-10 ring-[3px] ring-card"
          />
          <div className="min-w-0 flex-1 pt-0.5">
            <h3 className="headline flex items-center gap-1.5 text-ink">
              <span className="truncate">{artisan.name}</span>
              <BadgeCheck
                size={15}
                strokeWidth={2.2}
                className="shrink-0 text-accent"
                aria-label="Verified"
              />
            </h3>
            <p className="caption mt-0.5 flex items-center gap-1">
              <MapPin size={11} strokeWidth={2} />
              {artisan.location}
            </p>
          </div>
        </button>

        {/* Stats row */}
        <div className="figure mt-3 flex items-center gap-3 border-t border-line pt-3 text-[13px] text-ink">
          <span className="flex items-center gap-1">
            <Star size={12} strokeWidth={2.2} fill="currentColor" className="text-accent" />
            {artisan.rating.toFixed(1)}
            <span className="font-normal text-sub">({artisan.reviewCount})</span>
          </span>
          <span className="h-3 w-px bg-line" aria-hidden />
          <span className="flex items-center gap-1">
            <Clock size={11} strokeWidth={2.2} className="text-sub" />
            {artisan.yearsExperience} yrs
          </span>
          <span className="h-3 w-px bg-line" aria-hidden />
          <span className="flex items-center gap-1">
            <Briefcase size={11} strokeWidth={2.2} className="text-sub" />
            {artisan.jobsCompleted} jobs
          </span>
        </div>

        {/* Contact actions. Held back until the number is actually in hand —
            a Call button that dials nothing is worse than one that waits. */}
        {phone ? (
          <div className="mt-3 flex items-center gap-2">
            <a
              href={`tel:+${phone}`}
              className="pressable flex flex-1 items-center justify-center gap-2 rounded-full bg-accent py-2.5 text-sm font-semibold text-white shadow-[0_1px_3px_rgba(13,122,95,0.25)]"
            >
              <Phone size={14} />
              Call
            </a>
            <a
              href={`https://wa.me/${details?.contact.whatsapp ?? phone}`}
              target="_blank"
              rel="noopener noreferrer"
              className="pressable flex flex-1 items-center justify-center gap-2 rounded-full bg-accent-soft py-2.5 text-sm font-semibold text-accent"
            >
              <MessageCircle size={14} />
              WhatsApp
            </a>
            <button
              type="button"
              onClick={() => onCopy(phone, artisan.id)}
              aria-label={`Copy ${artisan.name}'s phone number`}
              className="pressable flex size-10 shrink-0 items-center justify-center rounded-full bg-fill text-sub hover:text-ink"
            >
              {copiedId === artisan.id ? (
                <Check size={15} className="text-accent" />
              ) : (
                <Copy size={15} />
              )}
            </button>
          </div>
        ) : (
          <div className="mt-3 flex items-center gap-2" aria-hidden>
            <span className="skeleton h-10 flex-1 rounded-full" />
            <span className="skeleton h-10 flex-1 rounded-full" />
            <span className="skeleton size-10 shrink-0 rounded-full" />
          </div>
        )}

        <p className="caption mt-2.5 text-center text-[11px] text-faint">
          {loading && !details ? "Opening contact…" : artisan.respondsIn}
        </p>
      </div>
    </li>
  );
}
