"use client";

import { useCallback, useEffect, useState } from "react";
import { useApi } from "./api/useApi";
import { ApiError } from "./api/error";
import type { SealedDetails } from "./artisans";

export interface SealedContactState {
  details: SealedDetails | null;
  loading: boolean;
  /** True when the API says this artisan has not been paid for. */
  locked: boolean;
  error: string | null;
  retry: () => void;
}

/**
 * Fetches the half of a profile that costs ₦500.
 *
 * `enabled` is what keeps this honest: the request only goes out once the
 * caller believes the artisan is unlocked, and the API checks that belief
 * again anyway. A 403 here is not an error to apologise for — it means the
 * paywall is doing its job, so it surfaces as `locked` rather than as a
 * failure message.
 */
export function useArtisanContact(
  artisanId: string | null,
  enabled: boolean,
): SealedContactState {
  const { api, signedIn } = useApi();
  const [details, setDetails] = useState<SealedDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [locked, setLocked] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    // A new artisan (or a locked one) must never inherit the last one's
    // sealed half. Clear it up front so the pinned reveal and contact rows
    // fall back to their masked state instead of showing a stale number.
    setDetails(null);
    setLocked(false);
    setError(null);

    if (!artisanId || !enabled || !signedIn) {
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    // Kicked off inside the async body rather than before it, so the first
    // state change happens after an await — never synchronously in the effect.
    async function load() {
      setLoading(true);
      setError(null);

      try {
        const contact = await api.artisans.contact(artisanId!, controller.signal);
        if (controller.signal.aborted) return;

        setDetails({
          phone: contact.phone,
          contact: {
            whatsapp: contact.whatsapp,
            instagram: contact.instagram,
            email: contact.email,
            altPhone: contact.altPhone,
            respondsIn: contact.respondsIn,
            availability: contact.availability,
          },
        });
        setLocked(false);
      } catch (cause) {
        if (controller.signal.aborted) return;
        if (cause instanceof ApiError && cause.isAborted) return;

        if (cause instanceof ApiError && cause.isForbidden) {
          setLocked(true);
          return;
        }

        setError(
          cause instanceof ApiError
            ? cause.message
            : "Couldn't load the contact details.",
        );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void load();

    return () => controller.abort();
  }, [api, artisanId, enabled, signedIn, attempt]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  return { details, loading, locked, error, retry };
}
