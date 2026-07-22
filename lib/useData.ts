"use client";

import { useCallback, useEffect, useState } from "react";
import { Artisan, Banner } from "./artisans";
import { fetchArtisans, fetchBanners } from "./artisan-source";
import { ApiError } from "./api/error";

type Phase = "loading" | "ready" | "error";

/**
 * Everything a screen reads from the API, with the three states a network read
 * actually has.
 *
 * Screens go through these hooks rather than calling the API directly, so none
 * of them assume the data is already there: over a slow connection the same
 * code shows placeholders, and if the read fails it offers a retry.
 */
function useAsync<T>(load: (signal: AbortSignal) => Promise<T>, fallback: T) {
  const [data, setData] = useState<T>(fallback);
  const [phase, setPhase] = useState<Phase>("loading");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    // The controller does two jobs: it stops a request that no longer has
    // anywhere to land, and — because an aborted request rejects — it is also
    // what tells the handlers below to stay quiet. A `live` boolean alone
    // would leave the request itself running.
    const controller = new AbortController();

    load(controller.signal)
      .then((value) => {
        if (controller.signal.aborted) return;
        setData(value);
        setPhase("ready");
      })
      .catch((cause: unknown) => {
        // Unmounted or superseded — not a failure anyone needs to see.
        if (controller.signal.aborted) return;
        if (cause instanceof ApiError && cause.isAborted) return;
        setPhase("error");
      });

    return () => controller.abort();
    // `load` is a module function, stable across renders; the retry counter is
    // what re-runs this.
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
export function useArtisans() {
  const { data, loading, error, retry } = useAsync(fetchArtisans, NO_ARTISANS);
  return { artisans: data, loading, error, retry };
}

/** The promotional rail — admin-managed, so it moves with the register. */
export function useBanners() {
  const { data, loading, error } = useAsync(fetchBanners, NO_BANNERS);
  return { banners: data, loading, error };
}
