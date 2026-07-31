"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Hourglass } from "lucide-react";
import { useApi } from "../lib/api/useApi";
import { ApplySheet } from "./ApplySheet";
import { HammerIcon } from "./HammerIcon";

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
      <span className="flex shrink-0 items-center gap-1.5 rounded-(--pill-radius) bg-fill px-3.5 py-2 text-sm font-bold text-sub max-md:rounded-r-full">
        <Hourglass size={12} strokeWidth={2.4} aria-hidden />
        Application pending
      </span>
    );
  }

  return (
    <>
      <motion.button
        type="button"
        onClick={onClick}
        initial="rest"
        animate="rest"
        whileHover="swing"
        whileFocus="swing"
        whileTap="swing"
        /* This pill always ends the filter row, so it carries the row's right
           bookend itself rather than leaning on a :last-child rule — the sheet
           it renders beside it makes "last child" a thing that could quietly
           stop being true. Capsule on the outer edge, the row's own corner on
           the inner one, and only on a phone. */
        className="pressable flex shrink-0 items-center gap-1.5 rounded-(--pill-radius) bg-accent-soft px-3.5 py-2 text-sm font-bold text-accent max-md:rounded-r-full"
      >
        {/* <HammerIcon size={13} /> */}
        Are you an artisan?
      </motion.button>

      <ApplySheet
        open={open}
        onClose={() => setOpen(false)}
        onSubmitted={onSubmitted}
      />
    </>
  );
}
