"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Sparkles,
  CreditCard,
  History,
  Star,
  CheckCircle2,
  HelpCircle,
  PhoneCall,
  ShieldCheck,
  ChevronRight,
  User as UserIcon,
} from "lucide-react";
import { useUnlocks, Transaction } from "../../lib/useUnlocks";
import { useArtisans } from "../../lib/useData";
import { TRADE_LABELS, Artisan } from "../../lib/artisans";
import { RatingModal } from "../../components/RatingModal";

export default function AccountPage() {
  const { credits, buyBundle, transactions, unlockedIds, userRatings, submitRating } = useUnlocks();
  const { artisans } = useArtisans();
  const [bundleSuccess, setBundleSuccess] = useState(false);
  const [ratingArtisan, setRatingArtisan] = useState<Artisan | null>(null);

  const unlockedArtisans = artisans.filter((a) => unlockedIds.includes(a.id));
  const unratedArtisans = unlockedArtisans.filter((a) => !userRatings[a.id]);

  const handleBuyBundle = () => {
    buyBundle();
    setBundleSuccess(true);
    setTimeout(() => setBundleSuccess(false), 3000);
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-4 pb-28 pt-6 md:px-6 md:pb-16 md:pt-10">
      <h1 className="title-lg text-ink">Account & Credits</h1>
      <p className="caption mt-1 text-sub">
        Manage your unlock bundle, review past transactions, and rate completed jobs.
      </p>

      {/* User Card */}
      <div className="mt-6 flex items-center justify-between rounded-2xl border border-line bg-card p-5 shadow-2xs">
        <div className="flex items-center gap-4">
          <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-accent-soft text-accent text-xl font-bold">
            <UserIcon size={26} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="headline font-bold text-ink">Ilisan Resident</h2>
              <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-semibold text-accent">
                <ShieldCheck size={13} />
                Verified
              </span>
            </div>
            <p className="caption mt-0.5 text-sub">Ilisan, Ogun State · Customer Account</p>
          </div>
        </div>
      </div>

      {/* Bundle Purchase Card */}
      <div className="mt-6 overflow-hidden rounded-2xl border border-line bg-card shadow-2xs">
        <div className="bg-gradient-to-r from-accent to-[#095D48] p-6 text-white">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
              <Sparkles size={13} />
              Unlock Bundle
            </span>
            <span className="figure text-xl font-extrabold text-white">
              {credits} {credits === 1 ? "Credit" : "Credits"} Left
            </span>
          </div>

          <h3 className="title-lg mt-4 text-white">Save on Artisan Contact Unlocks</h3>
          <p className="mt-1 text-sm text-white/80">
            Get 3 contact unlocks for ₦1,200 instead of ₦1,500. Credits never expire.
          </p>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-baseline gap-2">
              <span className="figure text-2xl font-bold text-white">₦1,200</span>
              <span className="caption text-white/60 line-through">₦1,500</span>
              <span className="text-xs font-semibold text-white/90"> (3 Unlocks)</span>
            </div>

            <button
              onClick={handleBuyBundle}
              className="pressable inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-accent shadow-md hover:bg-canvas"
            >
              <CreditCard size={16} />
              {bundleSuccess ? "3 Credits Added!" : "Buy 3 Credits · ₦1,200"}
            </button>
          </div>
        </div>
      </div>

      {/* Artisans Awaiting Rating */}
      {unratedArtisans.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center justify-between">
            <h2 className="title text-ink">Rate Recent Jobs</h2>
            <span className="caption text-sub">{unratedArtisans.length} pending</span>
          </div>

          <div className="mt-3.5 grid gap-3 sm:grid-cols-2">
            {unratedArtisans.map((artisan) => (
              <div
                key={artisan.id}
                className="flex items-center justify-between rounded-2xl border border-line bg-card p-4 shadow-2xs"
              >
                <div>
                  <h4 className="headline text-sm font-bold text-ink">{artisan.name}</h4>
                  <p className="caption text-sub">{TRADE_LABELS[artisan.trade]}</p>
                </div>

                <button
                  onClick={() => setRatingArtisan(artisan)}
                  className="pressable flex items-center gap-1.5 rounded-full bg-accent-soft px-3.5 py-1.5 text-xs font-semibold text-accent"
                >
                  <Star size={13} fill="currentColor" />
                  Rate Job
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Transaction History */}
      <div className="mt-8">
        <h2 className="title text-ink">Transaction History</h2>

        {transactions.length === 0 ? (
          <div className="mt-3 rounded-2xl border border-line bg-card p-6 text-center">
            <History className="mx-auto size-8 text-faint" />
            <p className="headline mt-2 text-ink">No transactions yet</p>
            <p className="caption mt-0.5 text-sub">
              Your unlock credit purchases and ₦500 contact unlocks will appear here.
            </p>
          </div>
        ) : (
          <div className="mt-3 overflow-hidden rounded-2xl border border-line bg-card divide-y divide-line">
            {transactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-fill text-accent font-bold">
                    {tx.type === "bundle" ? "🎁" : "🔓"}
                  </div>
                  <div>
                    <h4 className="headline text-sm font-bold text-ink">
                      {tx.type === "bundle"
                        ? "3-Unlock Bundle Credit"
                        : tx.artisanName
                        ? `Unlocked ${tx.artisanName}`
                        : "Artisan Contact Unlock"}
                    </h4>
                    <p className="caption text-xs text-sub">
                      Ref: {tx.reference} · {new Date(tx.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <span className="figure font-semibold text-ink">
                  {tx.amount === 0 ? "Free (Credit)" : `₦${tx.amount}`}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Support & Community */}
      <div className="mt-8 rounded-2xl border border-line bg-card p-5">
        <h3 className="headline text-ink">Need Help in Ilisan?</h3>
        <p className="caption mt-1 text-sub">
          Have an issue with an unlocked artisan or payment? Reach the Artiza verification team directly.
        </p>

        <div className="mt-4 flex flex-wrap gap-3">
          <a
            href="https://wa.me/2348031234567"
            target="_blank"
            rel="noopener noreferrer"
            className="pressable inline-flex items-center gap-2 rounded-full bg-[#25D366]/10 px-4 py-2 text-xs font-semibold text-[#25D366]"
          >
            <PhoneCall size={14} />
            Contact Support on WhatsApp
          </a>

          <Link
            href="/unlocked"
            className="pressable inline-flex items-center gap-1.5 rounded-full bg-fill px-4 py-2 text-xs font-semibold text-ink"
          >
            View Unlocked Book
            <ChevronRight size={14} />
          </Link>
        </div>
      </div>

      <RatingModal
        artisan={ratingArtisan}
        onClose={() => setRatingArtisan(null)}
        onSubmit={submitRating}
      />
    </div>
  );
}
