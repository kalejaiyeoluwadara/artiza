"use client";

import { useCallback, useEffect, useState } from "react";

const KEY = "artiza_unlocked";

/**
 * Which artisan contacts this person has paid to open.
 *
 * Local only for now — it stands in for the server record so an unlock
 * survives navigation and refresh, and so nobody is ever charged twice
 * for the same artisan. Swap the read/write for the API when payments
 * are wired.
 */
export function useUnlocks() {
  const [ids, setIds] = useState<string[]>([]);
  // Storage is read after mount, so the first paint matches the server.
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setIds(JSON.parse(raw));
    } catch {
      // Corrupt or unavailable storage just means nothing is unlocked.
    }
    setReady(true);
  }, []);

  const unlock = useCallback((id: string) => {
    setIds((prev) => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      try {
        localStorage.setItem(KEY, JSON.stringify(next));
      } catch {
        // Non-fatal: the unlock still holds for this session.
      }
      return next;
    });
  }, []);

  const isUnlocked = useCallback(
    (id: string) => ready && ids.includes(id),
    [ids, ready]
  );

  return { unlock, isUnlocked, unlockedIds: ids, ready };
}
