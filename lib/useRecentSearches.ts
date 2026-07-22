"use client";

import { useCallback, useSyncExternalStore } from "react";
import { useStoredValue, writeStored } from "./useStoredValue";

const KEY = "artiza_recent_searches";
const LIMIT = 6;

/** Stable identity — it is the server snapshot, so it must not be re-created. */
const NO_QUERIES: string[] = [];

const NEVER_CHANGES = () => () => {};
const onClient = () => true;
const onServer = () => false;

/**
 * The last few queries that went somewhere, newest first.
 *
 * Only a query someone acted on is recorded — every keystroke is a valid
 * search string and none of them are worth offering back. Local storage, not
 * an account feature: it's this device's history.
 */
export function useRecentSearches() {
  const queries = useStoredValue<string[]>(KEY, NO_QUERIES);

  // The server has no history to render, so the first client paint must match
  // it. This flips true after hydration, which is when the real list appears.
  const ready = useSyncExternalStore(NEVER_CHANGES, onClient, onServer);

  const remember = useCallback((query: string) => {
    const value = query.trim();
    if (!value) return;

    const previous = readCurrent();
    // Case-insensitive dedupe, keeping the spelling just used.
    const next = [
      value,
      ...previous.filter((q) => q.toLowerCase() !== value.toLowerCase()),
    ].slice(0, LIMIT);

    writeStored(KEY, next);
  }, []);

  const forget = useCallback((query: string) => {
    writeStored(
      KEY,
      readCurrent().filter((q) => q !== query),
    );
  }, []);

  const clear = useCallback(() => writeStored(KEY, NO_QUERIES), []);

  return { queries: ready ? queries : NO_QUERIES, ready, remember, forget, clear };
}

/**
 * Read straight from the store rather than closing over the rendered value —
 * two searches in the same tick would otherwise both build on the same stale
 * list and the first would be lost.
 */
function readCurrent(): string[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as string[]) : NO_QUERIES;
  } catch {
    return NO_QUERIES;
  }
}
