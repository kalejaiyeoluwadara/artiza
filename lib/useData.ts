"use client";

import { useCallback, useEffect, useState } from "react";
import { Artisan, Banner } from "./artisans";
import { fetchArtisans, fetchBanners } from "./artisan-source";
import { ApiError } from "./api/error";

type Phase = "loading" | "ready" | "error";

/**
 * What the browser already knows, for the length of one visit.
 *
 * The register is the same list for everyone and changes a few times a week,
 * so refetching it every time a screen mounts spends a round trip to redraw
 * pixels that were already correct. Keeping it here means the second visit to
 * a screen renders from memory: no skeleton, no flash, no wait.
 *
 * Deliberately module state and not a context — nothing renders off it
 * directly, it only seeds the first render of each hook, so there is no
 * provider to thread and no re-render to fan out.
 */
const store = new Map<string, { value: unknown; at: number }>();

/**
 * How long a cached entry is served without checking. Matches the API's own
 * revalidate window, so the client and the server go stale together rather
 * than the client holding data the origin has already replaced.
 */
const STALE_MS = 60_000;

function read<T>(key: string): { value: T; fresh: boolean } | undefined {
  const entry = store.get(key);
  if (!entry) return undefined;
  return {
    value: entry.value as T,
    fresh: Date.now() - entry.at < STALE_MS,
  };
}

/**
 * Everything a screen reads from the API, with the three states a network read
 * actually has.
 *
 * Screens go through these hooks rather than calling the API directly, so none
 * of them assume the data is already there: over a slow connection the same
 * code shows placeholders, and if the read fails it offers a retry.
 *
 * `initial` is data the server already rendered with. When it is present the
 * hook never shows a loading state at all — it starts ready, and the first
 * render on the client matches the HTML that arrived.
 */
function useAsync<T>(
  key: string,
  load: (signal: AbortSignal) => Promise<T>,
  fallback: T,
  initial?: T,
) {
  /* What this hook already knew at its first render — server-rendered props,
     or whatever a previous screen left in the store. Consulted here rather
     than in an effect because the entire point is to have the data before
     paint; reading it after mount would still cost a frame of skeleton.
     `useState`'s initialiser is what keeps it to the first render only. */
  const [seed] = useState(() =>
    initial ? { value: initial, fresh: true } : read<T>(key),
  );

  const [data, setData] = useState<T>(seed?.value ?? fallback);
  const [phase, setPhase] = useState<Phase>(seed ? "ready" : "loading");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    /* Server-rendered data is as fresh as the cache would have been, so file it
       under the same key — the next screen to want the register gets it from
       memory instead of the network. */
    if (attempt === 0 && initial !== undefined && !store.has(key)) {
      store.set(key, { value: initial, at: Date.now() });
    }

    // Already holding something current: nothing to do. A stale seed still
    // renders, but a refresh goes out behind it — the user sees the old list
    // rather than a skeleton, and it corrects itself when the answer lands.
    if (attempt === 0 && seed?.fresh) return;

    // The controller does two jobs: it stops a request that no longer has
    // anywhere to land, and — because an aborted request rejects — it is also
    // what tells the handlers below to stay quiet. A `live` boolean alone
    // would leave the request itself running.
    const controller = new AbortController();

    load(controller.signal)
      .then((value) => {
        if (controller.signal.aborted) return;
        store.set(key, { value, at: Date.now() });
        setData(value);
        setPhase("ready");
      })
      .catch((cause: unknown) => {
        // Unmounted or superseded — not a failure anyone needs to see.
        if (controller.signal.aborted) return;
        if (cause instanceof ApiError && cause.isAborted) return;
        // A background refresh that fails leaves the stale list on screen. It
        // is out of date, but it is still the truth as of a minute ago —
        // better than replacing a working page with an error. A tap on Retry
        // is a different thing entirely: it is someone asking what happened,
        // so that failure does surface.
        if (seed && attempt === 0) return;
        setPhase("error");
      });

    return () => controller.abort();
    // `load` is a module function and `key` is a literal, both stable across
    // renders; the retry counter is what re-runs this.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt]);

  // Back to placeholders, then re-run the read. Both live here rather than in
  // the effect, so the effect never sets state during a render pass.
  const retry = useCallback(() => {
    setPhase("loading");
    setAttempt((n) => n + 1);
  }, []);

  return {
    data,
    loading: phase === "loading",
    error: phase === "error",
    retry,
  };
}

const NO_ARTISANS: Artisan[] = [];
const NO_BANNERS: Banner[] = [];

/** The register. */
export function useArtisans(initial?: Artisan[]) {
  const { data, loading, error, retry } = useAsync(
    "artisans",
    fetchArtisans,
    NO_ARTISANS,
    initial,
  );
  return { artisans: data, loading, error, retry };
}

/** The promotional rail — admin-managed, so it moves with the register. */
export function useBanners(initial?: Banner[]) {
  const { data, loading, error } = useAsync(
    "banners",
    fetchBanners,
    NO_BANNERS,
    initial,
  );
  return { banners: data, loading, error };
}
