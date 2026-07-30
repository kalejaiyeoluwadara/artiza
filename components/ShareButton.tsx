"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Artisan } from "../lib/artisans";
import { artisanPath } from "../lib/slug";
import { toast } from "../lib/toast";

/**
 * Pass an artisan on.
 *
 * Recommending a hand worker is the thing that already happens in Ilisan —
 * it happens in a WhatsApp chat, as a name and a phone number typed from
 * memory. This is that, with the record attached: the link opens the same
 * profile the sheet shows, so the person receiving it sees the rating, the
 * years and the work before they decide.
 *
 * It copies the link, always, rather than calling the Web Share API. Share is
 * advertised by desktop browsers too, where it hands the tap to an OS menu of
 * AirDrop, Notes, Reminders and Freeform — a list of places nobody sends an
 * artisan, in a popover that covers the profile being shared. Copy is the one
 * behaviour that is right on every surface: the link goes to the clipboard and
 * the person pastes it wherever they were already going to paste it. And the
 * URL is the artisan's name, which is what makes it worth pasting — see
 * `lib/slug.ts`.
 */
export function ShareButton({
  artisan,
  className = "",
}: {
  artisan: Artisan;
  className?: string;
}) {
  const reduced = useReducedMotion();

  // The check that replaces the glyph once the link is on the clipboard. It
  // says it at the button, where the finger already is; the toast says it
  // again with the sentence, for anyone who looked away.
  const [done, setDone] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const confirm = () => {
    setDone(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setDone(false), 1600);
  };

  async function copyLink() {
    // Built from the live origin rather than a configured base, so a preview
    // deployment shares a link into itself instead of into production.
    const url = `${window.location.origin}${artisanPath(artisan)}`;

    if (await writeToClipboard(url)) {
      confirm();
      toast.success("Link copied", {
        description: `Paste it anywhere to share ${artisan.name}'s profile.`,
      });
      return;
    }

    // Nothing left to try, so the link itself is the message — it can still be
    // selected out of the toast and copied by hand.
    toast.error("Couldn't copy the link", { description: url });
  }

  return (
    <motion.button
      type="button"
      onClick={(event) => {
        // Every surface this sits on is itself a tap target somewhere.
        event.stopPropagation();
        void copyLink();
      }}
      // Names what actually happens. The glyph says share, and the two agree
      // — the link is how you share someone — but a screen reader announcing
      // "share" and then landing on a clipboard is a small lie.
      aria-label={`Copy a link to ${artisan.name}'s profile`}
      // Feedback on press, matching the heart it sits beside.
      whileTap={reduced ? undefined : { scale: 0.88 }}
      // The glyph's own states ride on the button's variants, so hover and
      // press propagate down to the drawing rather than being wired twice.
      initial="rest"
      animate="rest"
      whileHover={reduced ? undefined : "spread"}
      transition={{ type: "spring", bounce: 0, duration: 0.2 }}
      className={`grid size-9 shrink-0 place-items-center rounded-full bg-fill text-ink ${className}`}
    >
      <ShareGlyph done={done} reduced={Boolean(reduced)} />
    </motion.button>
  );
}

/**
 * The clipboard, with the old way behind the new one.
 *
 * `navigator.clipboard` needs a secure context and a permission that Safari
 * hands out only inside the gesture that asked for it — both of which hold
 * here, but neither of which is guaranteed on an in-app browser or a phone
 * reaching the dev server over the LAN. The offscreen textarea is deprecated
 * and works everywhere, which is exactly what a fallback is for.
 */
async function writeToClipboard(value: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    // Falls through.
  }

  try {
    const field = document.createElement("textarea");
    field.value = value;
    // Off screen rather than hidden: `display: none` is not selectable, and
    // `readOnly` keeps iOS from raising the keyboard on the way past.
    field.readOnly = true;
    field.setAttribute("aria-hidden", "true");
    field.style.cssText = "position:fixed;top:0;left:-9999px;opacity:0";

    document.body.append(field);
    field.select();
    field.setSelectionRange(0, value.length);
    const copied = document.execCommand("copy");
    field.remove();

    return copied;
  } catch {
    return false;
  }
}

/**
 * Artiza's share mark, drawn to the house icon grid (24 units, ~16-unit live
 * box, 1.75 stroke, round caps) rather than pulled from a set.
 *
 * Three nodes and two arcs: one thing here, two things over there. The arcs
 * are curved where every stock share glyph draws them straight — that curve is
 * the whole character, and it is also what makes the motion legible: on hover
 * the two far nodes travel outward and the arcs stretch after them, so the
 * icon performs the verb before it is even pressed. On success the graph
 * cross-fades to a check that draws itself in one stroke.
 */
function ShareGlyph({
  done,
  reduced,
  size = 17,
}: {
  done: boolean;
  reduced: boolean;
  size?: number;
}) {
  // Node travel and arc shape are two halves of one movement: the arc
  // animates its own `d` rather than being transformed, so it stays anchored
  // to the origin node while its far end follows the node exactly. The
  // `spread` variant is simply never triggered under reduced motion — the
  // button withholds `whileHover` — so the drawing needs no branch of its own.
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden
      focusable="false"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* A plain <g> with a CSS fade, deliberately: a motion component that
          declares its own `animate` stops variant propagation, and the nodes
          inside it are the things listening for `spread`. */}
      <g
        style={{
          opacity: done ? 0 : 1,
          transition: `opacity ${reduced ? 0 : 140}ms var(--ease-out)`,
        }}
      >
        <motion.path
          variants={{
            rest: { d: "M9.5 10.6 Q12 9.1 14.2 7.9" },
            spread: { d: "M9.4 10.8 Q12.2 8.7 15 7.2" },
          }}
          transition={ARC}
        />
        <motion.path
          variants={{
            rest: { d: "M9.5 13.4 Q12 14.9 14.2 16.1" },
            spread: { d: "M9.4 13.2 Q12.2 15.3 15 16.8" },
          }}
          transition={ARC}
        />

        {/* The one you're holding. It gives a little ground as the other two
            leave, which is what makes the pair read as being sent. */}
        <motion.circle
          cx="6.6"
          cy="12"
          r="2.6"
          variants={{ rest: { x: 0 }, spread: { x: -0.5 } }}
          transition={NODE}
        />
        <motion.circle
          cx="17"
          cy="6.6"
          r="2.6"
          variants={{
            rest: { x: 0, y: 0 },
            spread: { x: 0.8, y: -0.6 },
          }}
          transition={NODE}
        />
        <motion.circle
          cx="17"
          cy="17.4"
          r="2.6"
          variants={{
            rest: { x: 0, y: 0 },
            spread: { x: 0.8, y: 0.6 },
          }}
          transition={NODE}
        />
      </g>

      {/* Sent. Drawn rather than faded in, so the confirmation has the same
          hand as the mark it replaces. */}
      <motion.path
        d="M6.5 12.4 L10.2 16 L17.5 8.4"
        initial={false}
        animate={{ pathLength: done ? 1 : 0, opacity: done ? 1 : 0 }}
        transition={{
          duration: reduced ? 0 : 0.34,
          ease: [0.22, 1, 0.36, 1],
          opacity: { duration: reduced ? 0 : 0.12 },
        }}
      />
    </svg>
  );
}

/** Nodes settle, they don't bounce — a tap carries no momentum into this. */
const NODE = { type: "spring" as const, bounce: 0, duration: 0.32 };
/** The arcs trail the nodes by a hair, so the line reads as being pulled. */
const ARC = { type: "spring" as const, bounce: 0, duration: 0.38 };
