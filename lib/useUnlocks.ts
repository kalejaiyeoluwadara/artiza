"use client";

import { useCallback, useEffect, useState } from "react";

const UNLOCKS_KEY = "artiza_unlocked";
const CREDITS_KEY = "artiza_credits";
const TRANSACTIONS_KEY = "artiza_transactions";
const RATINGS_KEY = "artiza_ratings";

export interface Transaction {
  id: string;
  type: "unlock" | "bundle";
  artisanName?: string;
  artisanTrade?: string;
  amount: number;
  date: string;
  reference: string;
}

export interface UserRating {
  artisanId: string;
  rating: number;
  reviewText: string;
  date: string;
}

/**
 * Manages unlocked contacts, bundle credits, transactions, and post-job ratings.
 */
export function useUnlocks() {
  const [ids, setIds] = useState<string[]>([]);
  const [credits, setCredits] = useState<number>(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [userRatings, setUserRatings] = useState<Record<string, UserRating>>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const rawUnlocks = localStorage.getItem(UNLOCKS_KEY);
      if (rawUnlocks) setIds(JSON.parse(rawUnlocks));

      const rawCredits = localStorage.getItem(CREDITS_KEY);
      if (rawCredits) setCredits(parseInt(rawCredits, 10) || 0);

      const rawTx = localStorage.getItem(TRANSACTIONS_KEY);
      if (rawTx) setTransactions(JSON.parse(rawTx));

      const rawRatings = localStorage.getItem(RATINGS_KEY);
      if (rawRatings) setUserRatings(JSON.parse(rawRatings));
    } catch {
      // Non-fatal: storage read failure defaults gracefully
    }
    setReady(true);
  }, []);

  const unlock = useCallback((id: string, artisanName?: string, artisanTrade?: string) => {
    setIds((prev) => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      try {
        localStorage.setItem(UNLOCKS_KEY, JSON.stringify(next));
      } catch {
        // Non-fatal
      }
      return next;
    });

    // Deduct credit if available, otherwise record single purchase
    setCredits((prevCredits) => {
      let nextCredits = prevCredits;
      if (prevCredits > 0) {
        nextCredits = prevCredits - 1;
        try {
          localStorage.setItem(CREDITS_KEY, nextCredits.toString());
        } catch {
          // Non-fatal
        }
      }
      return nextCredits;
    });

    // Record transaction
    const newTx: Transaction = {
      id: `tx_${Date.now()}`,
      type: "unlock",
      artisanName,
      artisanTrade,
      amount: credits > 0 ? 0 : 500,
      date: new Date().toISOString(),
      reference: `AZ_${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
    };

    setTransactions((prev) => {
      const next = [newTx, ...prev];
      try {
        localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(next));
      } catch {
        // Non-fatal
      }
      return next;
    });
  }, [credits]);

  const buyBundle = useCallback(() => {
    const nextCredits = credits + 3;
    setCredits(nextCredits);
    try {
      localStorage.setItem(CREDITS_KEY, nextCredits.toString());
    } catch {
      // Non-fatal
    }

    const bundleTx: Transaction = {
      id: `tx_${Date.now()}`,
      type: "bundle",
      amount: 1200,
      date: new Date().toISOString(),
      reference: `AZ_BDL_${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
    };

    setTransactions((prev) => {
      const next = [bundleTx, ...prev];
      try {
        localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(next));
      } catch {
        // Non-fatal
      }
      return next;
    });

    return bundleTx;
  }, [credits]);

  const submitRating = useCallback((artisanId: string, rating: number, reviewText: string) => {
    const newRating: UserRating = {
      artisanId,
      rating,
      reviewText,
      date: new Date().toISOString(),
    };

    setUserRatings((prev) => {
      const next = { ...prev, [artisanId]: newRating };
      try {
        localStorage.setItem(RATINGS_KEY, JSON.stringify(next));
      } catch {
        // Non-fatal
      }
      return next;
    });
  }, []);

  const isUnlocked = useCallback(
    (id: string) => ready && ids.includes(id),
    [ids, ready]
  );

  return {
    unlock,
    isUnlocked,
    unlockedIds: ids,
    ready,
    credits,
    buyBundle,
    transactions,
    submitRating,
    userRatings,
  };
}

