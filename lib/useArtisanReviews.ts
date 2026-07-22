"use client";

import { useEffect, useState } from "react";
import { publicApi } from "./api";
import { ApiError } from "./api/error";
import type { ReviewItem } from "./api/types";

/** The sheet shows the most recent handful; the count comes from the profile. */
const PAGE_SIZE = 5;

const NO_REVIEWS: ReviewItem[] = [];

/**
 * Reviews for the detail sheet. Public, so it runs for signed-out visitors
 * too — reading the record is free, and that is the point of the register.
 *
 * Loaded on demand rather than embedded in the register: eight profiles ×
 * three reviews each is weight every browse request would otherwise carry for
 * a section most visitors never scroll to.
 */
export function useArtisanReviews(artisanId: string | null) {
  const [reviews, setReviews] = useState<ReviewItem[]>(NO_REVIEWS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!artisanId) return;

    const controller = new AbortController();

    async function load() {
      setLoading(true);
      setError(false);

      try {
        const page = await publicApi.artisans.reviews(
          artisanId!,
          1,
          PAGE_SIZE,
          controller.signal,
        );
        if (controller.signal.aborted) return;
        setReviews(page.items);
      } catch (cause) {
        if (controller.signal.aborted) return;
        if (cause instanceof ApiError && cause.isAborted) return;
        setError(true);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void load();

    return () => {
      controller.abort();
    };
  }, [artisanId]);

  return { reviews, loading, error };
}
