/**
 * Artiza's own tab icons.
 *
 * The metaphors stay familiar on purpose — a tab bar is not the place to
 * make people guess, and a search that isn't a magnifier costs more than
 * it earns. The character comes from the drawing, not from novelty:
 *
 *   Grid        24 units, live area 3.25–20.75, so every icon fills the
 *               same optical box and none looks larger than its neighbour.
 *   Stroke      1.75 with round caps and joins. Lucide's default is 2 at
 *               a squarer geometry, which is exactly what reads as stock.
 *   Radius      2.5 minimum on any corner — the same softness as the
 *               app's rounded-2xl cards, so the icons belong to the UI.
 *   States      Outline when inactive, solid when active, both drawn in
 *               one SVG and cross-faded. Nothing moves or resizes: the
 *               tab bar is the most-tapped thing in the app and movement
 *               there would make every navigation feel slower.
 *
 * The set's signature is the knockout — the keyhole, the lens, the gap at
 * the shoulders survive into the solid state instead of filling in, so an
 * active icon still reads as a drawing rather than a blob.
 */

type TabIconProps = {
  active?: boolean;
  size?: number;
};

const SVG_PROPS = {
  viewBox: "0 0 24 24",
  "aria-hidden": true,
  focusable: "false" as const,
};

const OUTLINE_PROPS = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

/** Cross-fade only — no transform, so nothing shifts on tap. */
function layer(visible: boolean) {
  return {
    opacity: visible ? 1 : 0,
    transition: "opacity 150ms var(--ease-out)",
  };
}

/**
 * Browse — the bento of one tall tile and two stacked, which is literally
 * the layout underneath it: a featured rail beside the list.
 */
export function BrowseIcon({ active = false, size = 20 }: TabIconProps) {
  return (
    <svg width={size} height={size} {...SVG_PROPS}>
      <g style={layer(!active)} {...OUTLINE_PROPS}>
        <rect x="3.5" y="3.5" width="7" height="17" rx="2.5" />
        <rect x="13.5" y="3.5" width="7" height="7" rx="2.5" />
        <rect x="13.5" y="13.5" width="7" height="7" rx="2.5" />
      </g>
      <g style={layer(active)} fill="currentColor">
        <rect x="3.5" y="3.5" width="7" height="17" rx="2.5" />
        <rect x="13.5" y="3.5" width="7" height="7" rx="2.5" />
        <rect x="13.5" y="13.5" width="7" height="7" rx="2.5" />
      </g>
    </svg>
  );
}

/**
 * Search — a magnifier, but stubbier than the stock one: a larger lens
 * and a shorter handle, so it holds its weight next to the solid tiles.
 */
export function SearchIcon({ active = false, size = 20 }: TabIconProps) {
  return (
    <svg width={size} height={size} {...SVG_PROPS}>
      <g style={layer(!active)} {...OUTLINE_PROPS}>
        <circle cx="10.75" cy="10.75" r="7" />
        <path d="M15.9 15.9 20.5 20.5" />
      </g>
      <g style={layer(active)} fill="currentColor">
        {/* Even-odd keeps the lens open at full weight. */}
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M10.75 3.25a7.5 7.5 0 1 0 0 15 7.5 7.5 0 0 0 0-15Zm0 2.6a4.9 4.9 0 1 1 0 9.8 4.9 4.9 0 0 1 0-9.8Z"
        />
        <path
          d="M15.9 15.9 20.5 20.5"
          stroke="currentColor"
          strokeWidth={2.6}
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}

/**
 * Unlocked — a key rather than an open padlock. The app's verb is
 * "unlock contact", and a key is the thing you are actually buying.
 */
export function UnlockedIcon({ active = false, size = 20 }: TabIconProps) {
  return (
    <svg width={size} height={size} {...SVG_PROPS}>
      <g style={layer(!active)} {...OUTLINE_PROPS}>
        <circle cx="8" cy="12" r="4.75" />
        <circle cx="8" cy="12" r="1.6" />
        <path d="M12.75 12h7.75" />
        <path d="M17.25 12v3.25" />
      </g>
      <g style={layer(active)} fill="currentColor">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M8 6.75a5.25 5.25 0 1 0 0 10.5 5.25 5.25 0 0 0 0-10.5Zm0 3.4a1.85 1.85 0 1 1 0 3.7 1.85 1.85 0 0 1 0-3.7Z"
        />
        <rect x="12.25" y="10.75" width="8.25" height="2.5" rx="1.25" />
        <rect x="16" y="12.25" width="2.5" height="4" rx="1.25" />
      </g>
    </svg>
  );
}

/**
 * Account — a flatter, wider shoulder line than the stock silhouette.
 * The stock one is a semicircle, which reads as a bust; this one reads
 * as a person.
 */
export function AccountIcon({ active = false, size = 20 }: TabIconProps) {
  return (
    <svg width={size} height={size} {...SVG_PROPS}>
      <g style={layer(!active)} {...OUTLINE_PROPS}>
        <circle cx="12" cy="8.5" r="3.9" />
        <path d="M4.75 20.25c0-3.75 3.25-6.35 7.25-6.35s7.25 2.6 7.25 6.35" />
      </g>
      <g style={layer(active)} fill="currentColor">
        <circle cx="12" cy="8.5" r="4.1" />
        <path d="M12 13.9c-4.3 0-7.75 2.85-7.75 6.55 0 .44.36.8.8.8h13.9c.44 0 .8-.36.8-.8 0-3.7-3.45-6.55-7.75-6.55Z" />
      </g>
    </svg>
  );
}
