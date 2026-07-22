"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useApi } from "../lib/api/useApi";
import { ApiError } from "../lib/api/error";
import { confirm } from "../lib/confirm";
import { toast } from "../lib/toast";
import { UNLOCK_PRICE } from "../lib/artisans";
import type { TransactionItem } from "../lib/api/types";

/** Naira with a thousands separator: 1200 → "₦1,200". */
function naira(amount: number): string {
  return `₦${amount.toLocaleString("en-NG")}`;
}

const BUNDLE_CREDITS = 3;
const BUNDLE_PRICE = 1200;

interface UnlocksValue {
  /** Artisan ids this customer has paid for. */
  unlockedIds: string[];
  isUnlocked: (artisanId: string) => boolean;
  credits: number;
  transactions: TransactionItem[];
  /** Artisan ids unlocked but not yet reviewed. */
  pendingReviewIds: string[];
  hasReviewed: (artisanId: string) => boolean;
  /** False until the first read lands, so screens can hold their skeletons. */
  ready: boolean;
  signedIn: boolean;

  unlock: (artisanId: string, artisanName?: string) => Promise<void>;
  buyBundle: () => Promise<void>;
  submitRating: (artisanId: string, rating: number, text: string) => Promise<void>;
  refresh: () => void;
}

const UnlocksContext = createContext<UnlocksValue | null>(null);

const NO_IDS: string[] = [];
const NO_TRANSACTIONS: TransactionItem[] = [];

/**
 * One source of truth for what the customer has bought.
 *
 * Four screens read this. As separate hook instances they would each hold
 * their own copy, each fetch it, and each go stale the moment another one
 * unlocked something — so it lives in a provider and every screen sees the
 * same numbers at the same time.
 */
export function UnlocksProvider({ children }: { children: React.ReactNode }) {
  const { api, signedIn } = useApi();
  const { data: session, update } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const [unlockedIds, setUnlockedIds] = useState<string[]>(NO_IDS);
  const [transactions, setTransactions] = useState<TransactionItem[]>(NO_TRANSACTIONS);
  const [pendingReviewIds, setPendingReviewIds] = useState<string[]>(NO_IDS);
  const [ready, setReady] = useState(false);
  const [attempt, setAttempt] = useState(0);

  // Credits come from the session rather than a second request: the token
  // already carries the balance, and it is refreshed by `update()` whenever a
  // purchase changes it.
  const credits = session?.user?.credits ?? 0;

  useEffect(() => {
    if (!signedIn) return;

    const controller = new AbortController();

    // One round of reads, in parallel — they're independent and the screen
    // needs all three before it stops looking half-loaded.
    Promise.all([
      api.unlocks.list(controller.signal),
      api.unlocks.transactions(1, 50, controller.signal),
      api.reviews.pending(controller.signal),
    ])
      .then(([unlocks, ledger, pending]) => {
        if (controller.signal.aborted) return;
        setUnlockedIds(unlocks.artisanIds);
        setTransactions(ledger.items);
        setPendingReviewIds(pending.pending.map((entry) => entry.artisanId));
        setReady(true);
      })
      .catch((cause: unknown) => {
        if (controller.signal.aborted) return;
        if (cause instanceof ApiError && cause.isAborted) return;

        // The session watcher handles an expired token; anything else is worth
        // saying out loud, because the screen behind this is about to look
        // like the customer owns nothing.
        if (!(cause instanceof ApiError && cause.isUnauthorized)) {
          toast.error("Couldn't load your unlocks", {
            description: "Pull down or tap retry once you're back online.",
          });
        }
        setReady(true);
      });

    return () => controller.abort();
  }, [api, signedIn, attempt]);

  const refresh = useCallback(() => setAttempt((n) => n + 1), []);

  /** Sends a signed-out customer to sign in and back again. */
  const requireSignIn = useCallback(() => {
    toast.info("Sign in to unlock a contact", {
      description: "It takes a moment, and your unlocks stay on your account.",
    });
    router.push(`/sign-in?callbackUrl=${encodeURIComponent(pathname)}`);
  }, [router, pathname]);

  const unlock = useCallback(
    async (artisanId: string, artisanName?: string) => {
      if (!signedIn) {
        requireSignIn();
        return;
      }

      if (unlockedIds.includes(artisanId)) return;

      const who = artisanName ? `${artisanName}'s` : "this artisan's";
      const payingWithCredit = credits > 0;

      const confirmed = await confirm({
        title: payingWithCredit ? "Use one credit?" : `Unlock for ${naira(UNLOCK_PRICE)}?`,
        body: payingWithCredit
          ? `This opens ${who} phone, WhatsApp and hours. You have ${credits} ${
              credits === 1 ? "credit" : "credits"
            } left.`
          : `This opens ${who} phone, WhatsApp and hours. Paid once, kept forever.`,
        confirmLabel: payingWithCredit ? "Use credit" : "Continue to payment",
        onConfirm: async () => {
          const result = await api.unlocks.unlock(artisanId);

          if (result.unlocked) {
            // A credit covered it — reflect it immediately rather than waiting
            // on a refetch, so the sheet behind the dialog is already unsealed.
            setUnlockedIds((previous) =>
              previous.includes(artisanId) ? previous : [...previous, artisanId],
            );
            if (result.transaction) {
              setTransactions((previous) => [result.transaction!, ...previous]);
            }
            setPendingReviewIds((previous) =>
              previous.includes(artisanId) ? previous : [...previous, artisanId],
            );
            await update({ credits: result.creditsRemaining });
            return;
          }

          if (!result.payment) {
            throw new Error("Couldn't start the payment. Please try again.");
          }

          // Leaving the app entirely, so nothing after this runs. The return
          // trip lands on /payment/return, which confirms before celebrating.
          window.location.assign(result.payment.authorizationUrl);

          // Hold the dialog open behind the redirect — resolving here would
          // flash a closed dialog on a page that is already navigating away.
          await new Promise(() => {});
        },
      });

      if (confirmed && credits > 0) {
        toast.success("Contact unlocked", {
          description: artisanName ? `${artisanName}'s details are open.` : undefined,
        });
      }
    },
    [signedIn, unlockedIds, credits, api, update, requireSignIn],
  );

  const buyBundle = useCallback(async () => {
    if (!signedIn) {
      requireSignIn();
      return;
    }

    await confirm({
      title: `Buy ${BUNDLE_CREDITS} unlocks for ${naira(BUNDLE_PRICE)}?`,
      body: `That's ${naira(Math.round(BUNDLE_PRICE / BUNDLE_CREDITS))} an unlock instead of ${naira(
        UNLOCK_PRICE,
      )}. Credits don't expire.`,
      confirmLabel: "Continue to payment",
      onConfirm: async () => {
        const result = await api.unlocks.buyBundle();
        window.location.assign(result.payment.authorizationUrl);
        await new Promise(() => {});
      },
    });
  }, [signedIn, api, requireSignIn]);

  const submitRating = useCallback(
    async (artisanId: string, rating: number, text: string) => {
      await api.reviews.submit(artisanId, { rating, text });

      // Reviewed, so it drops out of the prompts.
      setPendingReviewIds((previous) => previous.filter((id) => id !== artisanId));

      toast.success("Thanks for rating", {
        description: "It helps the next person in Ilisan choose well.",
      });
    },
    [api],
  );

  const value = useMemo<UnlocksValue>(() => {
    // Signed out, the customer owns nothing — derived rather than cleared in
    // an effect, so a sign-out can't leave a stale list on screen for a frame.
    const ids = signedIn ? unlockedIds : NO_IDS;
    const pending = signedIn ? pendingReviewIds : NO_IDS;

    return {
      unlockedIds: ids,
      isUnlocked: (artisanId: string) => ids.includes(artisanId),
      credits: signedIn ? credits : 0,
      transactions: signedIn ? transactions : NO_TRANSACTIONS,
      pendingReviewIds: pending,
      hasReviewed: (artisanId: string) =>
        ids.includes(artisanId) && !pending.includes(artisanId),
      ready: signedIn ? ready : true,
      signedIn,
      unlock,
      buyBundle,
      submitRating,
      refresh,
    };
  }, [
    signedIn,
    unlockedIds,
    pendingReviewIds,
    credits,
    transactions,
    ready,
    unlock,
    buyBundle,
    submitRating,
    refresh,
  ]);

  return <UnlocksContext.Provider value={value}>{children}</UnlocksContext.Provider>;
}

export function useUnlocks(): UnlocksValue {
  const value = useContext(UnlocksContext);
  if (!value) {
    throw new Error("useUnlocks must be used inside <UnlocksProvider>.");
  }
  return value;
}
