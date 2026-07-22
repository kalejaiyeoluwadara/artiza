"use client";

import Link from "next/link";
import {
  ChevronRight,
  Unlock,
  History,
  Star,
  HelpCircle,
  ShieldCheck,
  PhoneCall,
  LogOut,
  SlidersHorizontal,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { PageHeader } from "../../components/PageHeader";
import { useUnlocks } from "../../context/UnlocksContext";
import { confirm } from "../../lib/confirm";

export default function AccountPage() {
  const { data: session } = useSession();
  // The console has no link anywhere else in the app, and a customer who
  // guesses the URL is turned round by the proxy. This row is the door.
  const isAdmin = session?.user?.role === "admin";

  const {
    unlockedIds,
    credits,
    transactions,
    pendingReviewIds,
    ready,
    buyBundle,
    signedIn,
  } = useUnlocks();

  async function handleSignOut() {
    const confirmed = await confirm({
      title: "Sign out?",
      body: "Your unlocked contacts and credits stay on your account — you'll find them again next time you sign in.",
      confirmLabel: "Sign out",
      tone: "danger",
    });

    if (!confirmed) return;

    await signOut({ callbackUrl: "/" });
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 pb-28 pt-6 md:px-6 md:pb-16 md:pt-10">
      <PageHeader
        title="Account"
        // Signed out there is no name to show, and "Account" alone is honest
        // about that — an eyebrow reading "Not signed in" would be noise above
        // a screen whose first row already says so.
        eyebrow={signedIn && session?.user?.name ? session.user.name : undefined}
        subtitle={
          signedIn
            ? "Credits, unlocks and everything you've paid for."
            : undefined
        }
      />

      {/* ── Credits ────────────────────────────────────── */}
      <section className="mt-6 overflow-hidden rounded-2xl bg-card shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <div className="flex items-center justify-between p-4">
          <div>
            <p className="caption">Unlock credits</p>
            <p className="figure mt-0.5 text-2xl text-ink">{credits}</p>
          </div>
          <button
            type="button"
            onClick={() => void buyBundle()}
            className="pressable rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white"
          >
            Buy 3 for ₦1,200
          </button>
        </div>
        <div className="border-t border-line px-4 py-3">
          <p className="text-[0.8125rem] text-sub">
            Each credit unlocks one artisan contact. Single unlocks cost{" "}
            <span className="figure text-ink">₦500</span>.
          </p>
        </div>
      </section>

      {/* ── Activity ───────────────────────────────────── */}
      <p className="caption mt-8 mb-2 px-1 uppercase tracking-wider font-semibold">
        Activity
      </p>
      <ul className="overflow-hidden rounded-2xl bg-card shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <Row
          href="/unlocked"
          icon={Unlock}
          label="Unlocked contacts"
          detail={
            <span className="figure text-sm text-sub">
              {ready ? unlockedIds.length : "–"}
            </span>
          }
        />
        <Row
          icon={Star}
          label="Pending ratings"
          detail={
            pendingReviewIds.length > 0 ? (
              <span className="figure rounded-full bg-accent-soft px-2 py-0.5 text-xs text-accent">
                {pendingReviewIds.length}
              </span>
            ) : (
              <span className="text-sm text-faint">None</span>
            )
          }
          href="/unlocked"
        />
        <Row
          icon={History}
          label="Payment history"
          detail={
            <span className="figure text-sm text-sub">
              {transactions.length > 0
                ? `${transactions.length} ${transactions.length === 1 ? "payment" : "payments"}`
                : "No payments yet"}
            </span>
          }
          last
        />
      </ul>

      {/* ── Transaction list (last 5) ─────────────────── */}
      {transactions.length > 0 && (
        <>
          <p className="caption mt-8 mb-2 px-1 uppercase tracking-wider font-semibold">
            Recent Transactions
          </p>
          <ul className="overflow-hidden rounded-2xl bg-card shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            {transactions.slice(0, 5).map((tx, i) => (
              <li
                key={tx.id}
                className={`flex items-center justify-between px-4 py-3.5 ${
                  i < Math.min(transactions.length, 5) - 1
                    ? "border-b border-line"
                    : ""
                }`}
              >
                <div className="min-w-0 flex-1">
                  <p className="text-[0.9375rem] font-medium text-ink truncate">
                    {tx.type === "bundle"
                      ? "3-unlock bundle"
                      : tx.artisanName
                        ? `${tx.artisanName}`
                        : "Contact unlock"}
                  </p>
                  <p className="caption mt-0.5">
                    {tx.type === "unlock" && tx.artisanTrade
                      ? `${tx.artisanTrade} · `
                      : ""}
                    {new Date(tx.date).toLocaleDateString("en-NG", {
                      day: "numeric",
                      month: "short",
                    })}
                  </p>
                </div>
                <span className="figure ml-4 text-sm text-ink">
                  {tx.amount === 0 ? "Credit used" : `₦${tx.amount}`}
                </span>
              </li>
            ))}
          </ul>
        </>
      )}

      {/* ── The console, for the Artiza team only ──────── */}
      {isAdmin && (
        <>
          <p className="caption mt-8 mb-2 px-1 uppercase tracking-wider font-semibold">
            Artiza team
          </p>
          <ul className="overflow-hidden rounded-2xl bg-card shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <Row
              href="/admin"
              icon={SlidersHorizontal}
              label="Admin console"
              detail={
                <span className="caption text-sub">Register and promotions</span>
              }
              last
            />
          </ul>
        </>
      )}

      {/* ── Support ────────────────────────────────────── */}
      <p className="caption mt-8 mb-2 px-1 uppercase tracking-wider font-semibold">
        Support
      </p>
      <ul className="overflow-hidden rounded-2xl bg-card shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <Row
          icon={PhoneCall}
          label="Contact Artiza on WhatsApp"
          external="https://wa.me/2348031234567"
        />
        <Row icon={HelpCircle} label="How unlocking works" />
        <Row icon={ShieldCheck} label="Privacy and terms" last />
      </ul>

      {/* ── Session ────────────────────────────────────── */}
      {signedIn ? (
        <ul className="mt-8 overflow-hidden rounded-2xl bg-card shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <Row icon={LogOut} label="Sign out" onClick={handleSignOut} last />
        </ul>
      ) : (
        <Link
          href="/sign-in?callbackUrl=%2Faccount"
          className="pressable mt-8 flex w-full items-center justify-center rounded-full bg-accent py-3.5 text-[0.9375rem] font-semibold text-white"
        >
          Sign in
        </Link>
      )}

      {/* ── Footer ─────────────────────────────────────── */}
      <p className="caption mt-10 mb-4 text-center text-faint">
        Artiza v0.1 · made for Ilisan
      </p>
    </div>
  );
}

/* ────────────────────────────────────────────────────────
   Grouped-list row — the iOS Settings primitive.
   ──────────────────────────────────────────────────────── */
function Row({
  icon: Icon,
  label,
  detail,
  href,
  external,
  onClick,
  last = false,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  detail?: React.ReactNode;
  href?: string;
  external?: string;
  onClick?: () => void;
  last?: boolean;
}) {
  const inner = (
    <>
      <span className="flex items-center gap-3">
        <span className="flex size-8 items-center justify-center rounded-lg bg-fill">
          <Icon size={16} className="text-sub" />
        </span>
        <span className="text-[0.9375rem] font-medium text-ink">{label}</span>
      </span>
      <span className="flex items-center gap-2">
        {detail}
        <ChevronRight size={16} className="text-faint" />
      </span>
    </>
  );

  const cls = `pressable flex items-center justify-between px-4 py-3 ${
    last ? "" : "border-b border-line"
  }`;

  if (external) {
    return (
      <li>
        <a
          href={external}
          target="_blank"
          rel="noopener noreferrer"
          className={cls}
        >
          {inner}
        </a>
      </li>
    );
  }

  if (href) {
    return (
      <li>
        <Link href={href} className={cls}>
          {inner}
        </Link>
      </li>
    );
  }

  return (
    <li>
      <button type="button" onClick={onClick} className={`${cls} w-full text-left`}>
        {inner}
      </button>
    </li>
  );
}
