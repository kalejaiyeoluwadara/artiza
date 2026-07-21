"use client";

import { useCallback, useEffect, useState } from "react";
import { Artisan, Banner } from "./artisans";
import { fetchArtisans, fetchBanners } from "./artisan-source";

/**
 * Everything a screen reads from the source, with the three states a
 * network read actually has.
 *
 * Screens go through these hooks instead of importing the fixtures
 * directly, so none of them assume the data is already there. Today the
 * promises resolve in a microtask and the skeleton's 120ms fade-in means
 * nothing flashes; over a slow connection the same code shows placeholders
 * and, if the read fails, a retry. The database swap touches
 * `artisan-source.ts` and nothing else.
 */
function useAsync<T>(load: () => Promise<T>, fallback: T) {
  const [data, setData] = useState<T>(fallback);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    // Guards against a read from a previous attempt landing after a newer
    // one and overwriting it.
    let live = true;

    load()
      .then((value) => {
        if (!live) return;
        setData(value);
        setState("ready");
      })
      .catch(() => {
        if (live) setState("error");
      });

    return () => {
      live = false;
    };
    // `load` is a module function, stable across renders; the retry counter
    // is what re-runs this.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt]);

  // Back to placeholders, then re-run the read. Both live here rather than
  // in the effect, so the effect never sets state during a render pass.
  const retry = useCallback(() => {
    setState("loading");
    setAttempt((n) => n + 1);
  }, []);

  return {
    data,
    loading: state === "loading",
    error: state === "error",
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
