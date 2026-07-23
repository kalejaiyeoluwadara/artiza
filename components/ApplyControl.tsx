"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Hammer, Hourglass } from "lucide-react";
import { useApi } from "../lib/api/useApi";
import { ApplySheet } from "./ApplySheet";

/**
 * The "Apply to join" call to action, sat in the category pill row.
 *
 * It is an action, not a filter, so it wears the accent rather than the
 * outlined chrome the filter pills use. Applying needs an account — the team
 * has to be able to reach whoever applied — so a signed-out tap routes to
 * sign-in and comes back here, and a signed-in tap opens the form. Once someone
 * has an application in the queue the pill states that instead of inviting a
 * duplicate the API would refuse anyway.
 */
export function ApplyControl() {
  const router = useRouter();
  const { api, signedIn, loading } = useApi();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  // Read the caller's latest application so a pending one shows as pending
  // rather than inviting a second submission.
  useEffect(() => {
    if (!signedIn) return;
    const controller = new AbortController();
    api.applications
      .mine(controller.signal)
      .then((application) => setPending(application?.status === "pending"))
      .catch(() => {
        /* A failed read just means the pill stays in its default state. */
      });
    return () => controller.abort();
  }, [api, signedIn]);

  function onClick() {
    if (loading) return;
    if (!signedIn) {
      // Come back to the home screen once the account exists.
      router.push(`/sign-in?callbackUrl=${encodeURIComponent("/")}`);
      return;
    }
    setOpen(true);
  }

  function onSubmitted() {
    setPending(true);
    setOpen(false);
  }

  if (pending) {
    return (
      <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-fill px-3.5 py-1.5 text-[0.8125rem] font-semibold text-sub">
        <Hourglass size={12} strokeWidth={2.4} aria-hidden />
        Application pending
      </span>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={onClick}
        className="pressable flex shrink-0 items-center gap-1.5 rounded-full bg-accent-soft px-3.5 py-1.5 text-[0.8125rem] font-semibold text-accent"
      >
        <Hammer size={13} strokeWidth={2.4} aria-hidden />
        Are you an artisan?
      </button>

      <ApplySheet
        open={open}
        onClose={() => setOpen(false)}
        onSubmitted={onSubmitted}
      />
    </>
  );
}
