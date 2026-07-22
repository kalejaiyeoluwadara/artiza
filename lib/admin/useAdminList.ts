"use client";

import { useCallback, useEffect, useState } from "react";
import { ApiError } from "../api/error";
import { useApi } from "../api/useApi";
import type { Api } from "../api";

type Phase = "loading" | "ready" | "error";

export interface AdminList<T> {
  items: T[];
  loading: boolean;
  error: boolean;
  /** The API's own wording for what went wrong, when it gave one. */
  message?: string;
  retry: () => void;
  /**
   * Writes the local copy after a mutation has already succeeded on the server.
   * The console edits one row at a time and the API answers with the saved
   * record, so refetching the whole register to learn what we were just told
   * would only add a flash of skeletons.
   */
  patch: (next: T[] | ((current: T[]) => T[])) => void;
}

/**
 * A console read: the list, its three real states, and a way to write the local
 * copy back after a save.
 *
 * Admin reads are never cached, so the retry here re-runs a real request rather
 * than re-reading something Next has already stored.
 */
export function useAdminList<T>(
  load: (api: Api, signal: AbortSignal) => Promise<T[]>,
): AdminList<T> {
  const { api, loading: sessionLoading } = useApi();
  const [items, setItems] = useState<T[]>([]);
  const [phase, setPhase] = useState<Phase>("loading");
  const [message, setMessage] = useState<string>();
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    // Without a token every one of these routes is a 401, so the read waits
    // for the session rather than failing once and offering a pointless retry.
    if (sessionLoading) return;

    const controller = new AbortController();

    load(api, controller.signal)
      .then((value) => {
        if (controller.signal.aborted) return;
        setItems(value);
        setPhase("ready");
      })
      .catch((cause: unknown) => {
        if (controller.signal.aborted) return;
        if (cause instanceof ApiError && cause.isAborted) return;
        setMessage(cause instanceof ApiError ? cause.message : undefined);
        setPhase("error");
      });

    return () => controller.abort();
    // `load` is passed inline by every caller and `api` is rebuilt whenever the
    // token changes; the attempt counter is what deliberately re-runs this.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [api, sessionLoading, attempt]);

  const retry = useCallback(() => {
    setMessage(undefined);
    setPhase("loading");
    setAttempt((n) => n + 1);
  }, []);

  return {
    items,
    loading: phase === "loading",
    error: phase === "error",
    message,
    retry,
    patch: setItems,
  };
}
