"use client";

import { useState } from "react";
import Link from "next/link";
import { Phone, MessageCircle, Copy, Star, Check, Sparkles, Search } from "lucide-react";
import { Artisan, TRADE_LABELS } from "../lib/artisans";
import { useArtisans } from "../lib/useData";
import { useUnlocks } from "../lib/useUnlocks";
import { ArtisanCard, Avatar } from "./ArtisanCard";
import { ArtisanSheet } from "./ArtisanSheet";
import { Placeholder } from "./Placeholder";
import { RatingModal } from "./RatingModal";
import { ArtisanGridSkeleton, LoadingLabel, Skeleton } from "./Skeleton";

export function UnlockedScreen() {
  const { isUnlocked, unlock, unlockedIds, credits, ready, submitRating, userRatings } = useUnlocks();
  const { artisans, loading } = useArtisans();
  const [selected, setSelected] = useState<Artisan | null>(null);
  const [ratingArtisan, setRatingArtisan] = useState<Artisan | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  if (!ready || loading) {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 pb-28 pt-6 md:px-6 md:pb-16 md:pt-10">
        <LoadingLabel>Loading your unlocked contacts</LoadingLabel>
        <h1 className="title-lg text-ink">Unlocked Contacts</h1>
        <Skeleton className="mt-2 h-3 w-52 rounded-md" />
        <ArtisanGridSkeleton count={3} className="mt-5" />
      </div>
    );
  }

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
        <div className="flex items-center justify-between">
          <h1 className="title-lg text-ink">Unlocked Contacts</h1>
          {credits > 0 && (
            <span className="caption rounded-full bg-accent-soft px-3 py-1 font-semibold text-accent">
              {credits} {credits === 1 ? "credit" : "credits"} ready
            </span>
          )}
        </div>
        <div className="mt-6">
          <Placeholder
            title="No contacts unlocked yet"
            body="Contacts you pay to open are kept here forever so you never pay twice for the same artisan in Ilisan."
          />
          <div className="mt-6 flex justify-center">
            <Link
              href="/"
              className="pressable rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white shadow-sm"
            >
              Browse Vetted Artisans
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const unratedArtisans = unlocked.filter((a) => !userRatings[a.id]);

  return (
    <div className="mx-auto w-full max-w-5xl px-4 pb-28 pt-6 md:px-6 md:pb-16 md:pt-10">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="title-lg text-ink">Unlocked Contacts</h1>
          <p className="caption mt-0.5 text-sub">
            {unlocked.length} {unlocked.length === 1 ? "artisan" : "artisans"} in your contact book
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/account"
            className="pressable flex items-center gap-2 rounded-full bg-card border border-line px-3.5 py-1.5 text-xs font-semibold text-ink shadow-2xs"
          >
            <Sparkles className="size-3.5 text-accent" />
            <span>
              {credits > 0 ? `${credits} credits` : "Buy Bundle"}
            </span>
          </Link>
        </div>
      </div>

      {/* Search within unlocked list */}
      {unlocked.length > 2 && (
        <div className="relative mt-4">
          <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-faint" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search your unlocked contacts by name or trade..."
            className="w-full rounded-2xl border border-line bg-card py-2.5 pl-10 pr-4 text-sm text-ink placeholder:text-faint focus:border-accent focus:outline-hidden shadow-2xs"
          />
        </div>
      )}

      {/* Post-Job Rating Banner / Prompt */}
      {unratedArtisans.length > 0 && (
        <div className="mt-6 overflow-hidden rounded-2xl border border-line bg-card p-4 shadow-2xs">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="caption font-semibold uppercase tracking-wider text-accent">
                Rate & Verify
              </span>
              <h3 className="headline mt-0.5 text-ink">
                Has a recent job been completed?
              </h3>
              <p className="caption mt-0.5 text-sub">
                Leave a rating to help others in Ilisan find verified hand workers.
              </p>
            </div>
          </div>

          <div className="no-scrollbar -mx-4 mt-3.5 flex gap-2.5 overflow-x-auto px-4">
            {unratedArtisans.map((artisan) => (
              <div
                key={artisan.id}
                className="flex items-center gap-3 shrink-0 rounded-xl bg-canvas border border-line p-2.5 pr-3.5"
              >
                <Avatar name={artisan.name} src={artisan.photo} size="size-9 text-sm" />
                <div>
                  <h4 className="text-xs font-bold text-ink">{artisan.name}</h4>
                  <p className="caption text-[11px] text-sub">{TRADE_LABELS[artisan.trade]}</p>
                </div>
                <button
                  onClick={() => setRatingArtisan(artisan)}
                  className="pressable ml-2 flex items-center gap-1 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-white"
                >
                  <Star size={11} fill="currentColor" />
                  Rate
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Unlocked Contacts Register */}
      <div className="mt-6">
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((artisan) => {
            const ratingObj = userRatings[artisan.id];
            const cleanPhone = artisan.phone.replace(/[^0-9+]/g, "");

            return (
              <li key={artisan.id} className="flex flex-col rounded-2xl border border-line bg-card p-4 shadow-2xs">
                <div
                  onClick={() => setSelected(artisan)}
                  className="pressable flex items-start gap-3 cursor-pointer"
                >
                  <Avatar name={artisan.name} src={artisan.photo} size="size-12 text-base" />
                  <div className="min-w-0 flex-1">
                    <h3 className="headline font-bold text-ink truncate">{artisan.name}</h3>
                    <p className="caption mt-0.5 text-sub">
                      {TRADE_LABELS[artisan.trade]} · {artisan.location}
                    </p>
                    {ratingObj ? (
                      <span className="inline-flex items-center gap-1 mt-1 text-xs font-semibold text-accent">
                        <Star size={12} fill="currentColor" />
                        Rated {ratingObj.rating}★
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 mt-1 text-xs font-medium text-faint">
                        Unlocked · {artisan.contact.respondsIn}
                      </span>
                    )}
                  </div>
                </div>

                {/* Direct Action Bar */}
                <div className="mt-4 flex items-center gap-2 border-t border-line pt-3">
                  <a
                    href={`tel:${cleanPhone}`}
                    className="pressable flex flex-1 items-center justify-center gap-1.5 rounded-full bg-accent py-2 text-xs font-semibold text-white shadow-2xs"
                  >
                    <Phone size={13} />
                    Call
                  </a>
                  <a
                    href={`https://wa.me/${cleanPhone.replace("+", "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="pressable flex flex-1 items-center justify-center gap-1.5 rounded-full bg-[#25D366]/10 text-[#25D366] py-2 text-xs font-semibold"
                  >
                    <MessageCircle size={13} />
                    WhatsApp
                  </a>
                  <button
                    onClick={() => handleCopyPhone(artisan.phone, artisan.id)}
                    title="Copy phone number"
                    className="pressable flex size-8 shrink-0 items-center justify-center rounded-full bg-fill text-sub hover:text-ink"
                  >
                    {copiedId === artisan.id ? (
                      <Check size={14} className="text-accent" />
                    ) : (
                      <Copy size={14} />
                    )}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <ArtisanSheet
        artisan={selected}
        onClose={() => setSelected(null)}
        unlocked={selected ? isUnlocked(selected.id) : false}
        onUnlock={() => selected && unlock(selected.id, selected.name, TRADE_LABELS[selected.trade])}
      />

      <RatingModal
        artisan={ratingArtisan}
        onClose={() => setRatingArtisan(null)}
        onSubmit={submitRating}
      />
    </div>
  );
}
