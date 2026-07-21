import { Trade } from "../lib/artisans";

/**
 * Hand-built trade illustrations. One drawing grammar across all seven so
 * the rail reads as a set and not as clip art: a 40×40 box, flat shapes
 * with no outlines, 3px minimum thickness so nothing disappears at 40px,
 * and depth carried by a `deep` shade rather than a shadow.
 *
 * Colour comes from the illustration palette in globals.css — see the
 * note there. These are pictures of the work, like the photography; the
 * one-accent rule still governs every actual control.
 */
export function TradeIllustration({ trade }: { trade: Trade }) {
  const Art = ART[trade];
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden
      focusable="false"
      className="size-9"
    >
      <Art />
    </svg>
  );
}

/** The "All" tile. Neutral by design — it is the absence of a trade. */
export function AllIllustration() {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden
      focusable="false"
      className="size-9"
    >
      <rect x="6" y="6" width="12.5" height="12.5" rx="4" fill="var(--ink)" />
      <rect
        x="21.5"
        y="6"
        width="12.5"
        height="12.5"
        rx="4"
        fill="var(--faint)"
      />
      <rect
        x="6"
        y="21.5"
        width="12.5"
        height="12.5"
        rx="4"
        fill="var(--faint)"
      />
      <rect
        x="21.5"
        y="21.5"
        width="12.5"
        height="12.5"
        rx="4"
        fill="var(--ink)"
      />
    </svg>
  );
}

/** Elbow of pipe with a drip. */
function Plumber() {
  return (
    <>
      <path
        d="M11 31V21a7 7 0 0 1 7-7h11"
        stroke="var(--t-plumber)"
        strokeWidth="6.5"
        strokeLinecap="round"
      />
      <rect
        x="6.5"
        y="28.5"
        width="9"
        height="6"
        rx="2"
        fill="var(--t-plumber-deep)"
      />
      <rect
        x="26"
        y="9.5"
        width="6"
        height="9"
        rx="2"
        fill="var(--t-plumber-deep)"
      />
      <path
        d="M24 22c2.1 2.5 3.2 4.1 3.2 5.4a3.2 3.2 0 1 1-6.4 0c0-1.3 1.1-2.9 3.2-5.4Z"
        fill="var(--t-plumber-light)"
      />
    </>
  );
}

/** Panel in perspective under a sun. */
function SolarInstaller() {
  return (
    <>
      <circle cx="28.5" cy="9.5" r="5" fill="var(--t-solar)" />
      <path
        d="M28.5 1.8v1.6M35.4 4.4l-1.1 1.1M21.6 4.4l1.1 1.1M37.5 11.5h-1.6"
        stroke="var(--t-solar)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path d="M13 19h22l-5 13H6l7-13Z" fill="var(--t-solar-deep)" />
      <path
        d="M20 19l-7 13M27 19l-7 13M9.5 25.5h23"
        stroke="var(--t-solar-light)"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </>
  );
}

/** Three tiles laid, the fourth going down. */
function Tiler() {
  return (
    <>
      <rect x="5" y="5" width="14" height="14" rx="3.5" fill="var(--t-tiler)" />
      <rect
        x="21"
        y="5"
        width="14"
        height="14"
        rx="3.5"
        fill="var(--t-tiler-light)"
      />
      <rect
        x="5"
        y="21"
        width="14"
        height="14"
        rx="3.5"
        fill="var(--t-tiler-light)"
      />
      <g transform="rotate(11 28 28)">
        <rect
          x="21"
          y="21"
          width="14"
          height="14"
          rx="3.5"
          fill="var(--t-tiler-deep)"
        />
      </g>
    </>
  );
}

/** Hammer resting on a plank. */
function Carpenter() {
  return (
    <>
      <rect
        x="3"
        y="24"
        width="34"
        height="10"
        rx="3"
        fill="var(--t-carpenter)"
      />
      <path
        d="M8 27.5h8M20 27.5h9M8 31h13M25 31h5"
        stroke="var(--t-carpenter-deep)"
        strokeWidth="1.6"
        strokeLinecap="round"
        opacity=".5"
      />
      <g transform="rotate(-24 20 16)">
        <rect
          x="18.2"
          y="12"
          width="3.6"
          height="15"
          rx="1.8"
          fill="var(--t-carpenter-deep)"
        />
        <rect
          x="11"
          y="6"
          width="17"
          height="8"
          rx="2.5"
          fill="var(--t-steel)"
        />
        <rect
          x="11"
          y="6"
          width="4.5"
          height="8"
          rx="2.2"
          fill="var(--t-steel-deep)"
        />
      </g>
    </>
  );
}

/** Live socket with its lead. */
function Electrician() {
  return (
    <>
      <rect
        x="6.5"
        y="4"
        width="27"
        height="26"
        rx="8"
        fill="var(--t-electrician)"
      />
      <path
        d="M21.8 9.5 15 19.8h4.4L18.2 28 25.4 17.6H21z"
        fill="var(--card)"
      />
      <path
        d="M20 30v3.2a3.2 3.2 0 0 0 3.2 3.2H26"
        stroke="var(--t-electrician-deep)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <rect
        x="26"
        y="32.5"
        width="8"
        height="7.5"
        rx="2.5"
        fill="var(--t-electrician-deep)"
      />
    </>
  );
}

/** Roller, still wet. */
function Painter() {
  return (
    <>
      <rect x="5" y="6" width="23" height="10" rx="3.5" fill="var(--t-painter)" />
      <path
        d="M28 11h4a2.5 2.5 0 0 1 2.5 2.5v3.5a3 3 0 0 1-3 3h-9a3 3 0 0 0-3 3v3"
        stroke="var(--t-painter-deep)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect
        x="16.5"
        y="26"
        width="7"
        height="11"
        rx="3.5"
        fill="var(--t-painter-deep)"
      />
      <path
        d="M9.5 17.5v4"
        stroke="var(--t-painter-light)"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <circle cx="14.5" cy="20" r="1.8" fill="var(--t-painter-light)" />
    </>
  );
}

/** Front-loader mid-cycle. */
function Laundry() {
  return (
    <>
      <rect x="7" y="3" width="26" height="34" rx="7" fill="var(--t-laundry)" />
      <rect
        x="11"
        y="7.5"
        width="9"
        height="3"
        rx="1.5"
        fill="var(--t-laundry-deep)"
      />
      <circle cx="27.5" cy="9" r="2" fill="var(--t-laundry-deep)" />
      <circle cx="20" cy="24" r="9" fill="var(--t-laundry-deep)" />
      <circle cx="20" cy="24" r="6.3" fill="var(--t-laundry-light)" />
      <circle cx="17.6" cy="22" r="1.8" fill="var(--card)" />
      <circle cx="22.3" cy="26.4" r="1.3" fill="var(--card)" />
    </>
  );
}

const ART: Record<Trade, () => React.JSX.Element> = {
  plumber: Plumber,
  "solar-installer": SolarInstaller,
  tiler: Tiler,
  carpenter: Carpenter,
  electrician: Electrician,
  painter: Painter,
  laundry: Laundry,
};

/** The tile wash behind each drawing. */
export const TRADE_TINTS: Record<Trade, string> = {
  plumber: "var(--t-plumber-soft)",
  "solar-installer": "var(--t-solar-soft)",
  tiler: "var(--t-tiler-soft)",
  carpenter: "var(--t-carpenter-soft)",
  electrician: "var(--t-electrician-soft)",
  painter: "var(--t-painter-soft)",
  laundry: "var(--t-laundry-soft)",
};
