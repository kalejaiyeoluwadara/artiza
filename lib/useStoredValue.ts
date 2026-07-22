"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Local storage as an external store, rather than as an effect that reads it
 * on mount and calls setState.
 *
 * The effect version costs a second render on every mount and trips React's
 * cascading-render rule. Worse, it can't hear a write from another tab: unlock
 * something in one and the other keeps showing the old list. Subscribing to
 * the real source fixes both.
 */

/** Parsed values, keyed by storage key, invalidated by the raw string. */
const cache = new Map<string, { raw: string | null; value: unknown }>();
const listeners = new Map<string, Set<() => void>>();

function readRaw(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    // Private mode, or storage disabled. Behaves as empty.
    return null;
  }
}

/**
 * `useSyncExternalStore` compares snapshots by identity, so parsing on every
 * call would loop forever. The parse is cached against the raw string and only
 * redone when the stored text actually changes.
 */
function readValue<T>(key: string, fallback: T): T {
  const raw = readRaw(key);
  const cached = cache.get(key);

  if (cached && cached.raw === raw) return cached.value as T;

  let value = fallback;
  if (raw !== null) {
    try {
      value = JSON.parse(raw) as T;
    } catch {
      // Corrupt entry — fall back rather than throw at render time.
      value = fallback;
    }
  }

  cache.set(key, { raw, value });
  return value;
}

function notify(key: string): void {
  const set = listeners.get(key);
  if (!set) return;
  for (const listener of set) listener();
}

function subscribeTo(key: string, listener: () => void): () => void {
  let set = listeners.get(key);
  if (!set) {
    set = new Set();
    listeners.set(key, set);
  }
  set.add(listener);

  // Fired by *other* tabs only, which is exactly the case an in-tab write
  // can't cover.
  const onStorage = (event: StorageEvent) => {
    if (event.key === key || event.key === null) listener();
  };
  window.addEventListener("storage", onStorage);

  return () => {
    set.delete(listener);
    if (set.size === 0) listeners.delete(key);
    window.removeEventListener("storage", onStorage);
  };
}

/** Writes, then tells this tab. Other tabs hear it through `storage`. */
export function writeStored<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Non-fatal: the in-memory value below still holds for this session.
  }
  cache.set(key, { raw: JSON.stringify(value), value });
  notify(key);
}

export function readStored<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  return readValue(key, fallback);
}

/**
 * Reads a JSON value from local storage and re-renders when it changes — in
 * this tab or any other.
 *
 * `fallback` must be a stable reference (a module constant), since it is the
 * server snapshot and a fresh array each render would loop.
 */
export function useStoredValue<T>(key: string, fallback: T): T {
  const subscribe = useCallback(
    (listener: () => void) => subscribeTo(key, listener),
    [key],
  );

  const getSnapshot = useCallback(() => readValue(key, fallback), [key, fallback]);
  const getServerSnapshot = useCallback(() => fallback, [fallback]);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
