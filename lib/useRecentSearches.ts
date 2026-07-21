"use client";

import { useCallback, useEffect, useState } from "react";

const KEY = "artiza_recent_searches";
const LIMIT = 6;

/**
 * The last few queries that went somewhere, newest first.
 *
 * Only a query someone acted on is recorded — every keystroke is a valid
 * search string and none of them are worth offering back. Local storage,
 * like unlocks: it's this device's history, not an account feature.
 */
export function useRecentSearches() {
  const [queries, setQueries] = useState<string[]>([]);
  // Read after mount, so the first paint matches the server's.
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setQueries(JSON.parse(raw));
    } catch {
      // Corrupt or unavailable storage just means no history.
    }
    setReady(true);
  }, []);

  const write = useCallback((next: string[]) => {
    setQueries(next);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      // Non-fatal: the list still holds for this session.
    }
  }, []);

  const remember = useCallback(
    (query: string) => {
      const value = query.trim();
      if (!value) return;
      setQueries((prev) => {
        // Case-insensitive dedupe, keeping the spelling just used.
        const next = [
          value,
          ...prev.filter((q) => q.toLowerCase() !== value.toLowerCase()),
        ].slice(0, LIMIT);
        try {
          localStorage.setItem(KEY, JSON.stringify(next));
        } catch {
          // Non-fatal.
        }
        return next;
      });
    },
    []
  );

  const forget = useCallback(
    (query: string) => write(queries.filter((q) => q !== query)),
    [queries, write]
  );

  const clear = useCallback(() => write([]), [write]);

  return { queries, ready, remember, forget, clear };
}
