"use client";

import { useCallback, useSyncExternalStore } from "react";
import { readStored, useStoredValue, writeStored } from "./useStoredValue";

const KEY = "artiza_favorites";

/** Stable identity — it is the server snapshot, so it must not be re-created. */
const NO_IDS: string[] = [];

const NEVER_CHANGES = () => () => {};
const onClient = () => true;
const onServer = () => false;

/**
 * Artisans someone has marked to come back to, newest first.
 *
 * This device, not the account: a favourite costs nothing and commits to
 * nothing, so it has no business being a server round trip or a reason to make
 * someone sign in. Unlocks are the opposite — those are paid for, so they live
 * on the account and are read from the API.
 */
export function useFavorites() {
  const ids = useStoredValue<string[]>(KEY, NO_IDS);

  // The server has no favourites to render, so the first client paint has to
  // match it. Flips true after hydration, which is when the real list appears.
  const ready = useSyncExternalStore(NEVER_CHANGES, onClient, onServer);

  const toggle = useCallback((artisanId: string) => {
    // Read through rather than closing over the rendered list: two taps in one
    // tick would otherwise both build on the same stale array.
    const current = readStored<string[]>(KEY, NO_IDS);

    writeStored(
      KEY,
      current.includes(artisanId)
        ? current.filter((id) => id !== artisanId)
        : [artisanId, ...current],
    );
  }, []);

  const clear = useCallback(() => writeStored(KEY, NO_IDS), []);

  const live = ready ? ids : NO_IDS;

  return {
    ids: live,
    isFavorite: useCallback(
      (artisanId: string) => live.includes(artisanId),
      [live],
    ),
    count: live.length,
    ready,
    toggle,
    clear,
  };
}
