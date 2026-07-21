/**
 * Artiza's own tab icons.
 *
 * The metaphors stay familiar on purpose — a tab bar is not the place to
 * make people guess, and a search that isn't a magnifier costs more than
 * it earns. The character comes from the drawing, not from novelty:
 *
 *   Grid        24 units. Every icon is drawn to roughly a 16-unit box so
 *               none looks larger than its neighbour, with the solid
 *               shapes sized down slightly — weight reads as size.
 *   Stroke      1.75 with round caps and joins. Lucide's default is 2 on
 *               a squarer geometry, which is what reads as stock.
 *   Radius      2.4 minimum on any corner, matching the rounded-2xl
 *               cards, so the icons belong to the interface around them.
 *   States      Outline when inactive, solid when active, both drawn in
 *               one SVG and cross-faded. Nothing moves or resizes: this
 *               is the most-tapped surface in the app, and movement here
 *               would make every navigation feel slower than it is.
 *
 * The set's signature is the knockout — the lens, the keyhole, the gap
 * under the open shackle survive into the solid state instead of filling
 * in, so an active icon still reads as a drawing rather than a blob.
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
 * Browse — the bento of one tall tile and two stacked is literally the
 * layout underneath it: a featured rail beside the list.
 */
export function BrowseIcon({ active = false, size = 20 }: TabIconProps) {
  const tiles = (
    <>
      <rect x="4" y="4" width="6.5" height="16" rx="2.4" />
      <rect x="13.5" y="4" width="6.5" height="6.5" rx="2.4" />
      <rect x="13.5" y="13.5" width="6.5" height="6.5" rx="2.4" />
    </>
  );

  return (
    <svg width={size} height={size} {...SVG_PROPS}>
      <g style={layer(!active)} {...OUTLINE_PROPS}>
        {tiles}
      </g>
      <g style={layer(active)} fill="currentColor">
        {tiles}
      </g>
    </svg>
  );
}

/**
 * Search — a magnifier, but with a bigger lens and a shorter handle than
 * the stock one, so it holds its weight beside the solid tiles.
 */
export function SearchIcon({ active = false, size = 20 }: TabIconProps) {
  return (
    <svg width={size} height={size} {...SVG_PROPS}>
      <g style={layer(!active)} {...OUTLINE_PROPS}>
        <circle cx="10.9" cy="10.9" r="6.75" />
        <path d="M15.7 15.7 20.25 20.25" />
      </g>
      <g style={layer(active)} fill="currentColor">
        {/* Even-odd keeps the lens open at full weight. */}
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M10.9 3.75a7.15 7.15 0 1 0 0 14.3 7.15 7.15 0 0 0 0-14.3Zm0 2.45a4.7 4.7 0 1 1 0 9.4 4.7 4.7 0 0 1 0-9.4Z"
        />
        <path
          d="M15.7 15.7 20.25 20.25"
          stroke="currentColor"
          strokeWidth={2.6}
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}

/**
 * Unlocked — an open padlock, not a key. The contact panel already uses a
 * lock to say "Locked", so this is the same object with the shackle swung
 * open: the tab is where those locks ended up. A key would also have been
 * apt, but a key is long and flat and reads as a runt beside three
 * upright icons.
 *
 * The shackle's left leg is absent entirely rather than shortened — a
 * stub is ambiguous at 21px, an open arc is not.
 */
export function UnlockedIcon({ active = false, size = 20 }: TabIconProps) {
  const shackle = "M15.75 10.5V8a3.75 3.75 0 0 0-7.5 0";

  return (
    <svg width={size} height={size} {...SVG_PROPS}>
      <g style={layer(!active)} {...OUTLINE_PROPS}>
        <rect x="4.75" y="10.5" width="14.5" height="10" rx="2.75" />
        <path d={shackle} />
      </g>
      <g style={layer(active)}>
        <path
          fill="currentColor"
          fillRule="evenodd"
          clipRule="evenodd"
          d="M7.5 10.5h9a2.75 2.75 0 0 1 2.75 2.75v4.5A2.75 2.75 0 0 1 16.5 20.5h-9a2.75 2.75 0 0 1-2.75-2.75v-4.5A2.75 2.75 0 0 1 7.5 10.5Zm4.5 3.25a1.55 1.55 0 1 0 0 3.1 1.55 1.55 0 0 0 0-3.1Z"
        />
        <path
          d={shackle}
          fill="none"
          stroke="currentColor"
          strokeWidth={2.2}
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}

/**
 * Account — a flatter, wider shoulder than the stock silhouette, whose
 * semicircle reads as a bust. This one reads as a person.
 */
export function AccountIcon({ active = false, size = 20 }: TabIconProps) {
  return (
    <svg width={size} height={size} {...SVG_PROPS}>
      <g style={layer(!active)} {...OUTLINE_PROPS}>
        <circle cx="12" cy="8.5" r="3.9" />
        <path d="M4.75 20.25c0-3.75 3.25-6.35 7.25-6.35s7.25 2.6 7.25 6.35" />
      </g>
      <g style={layer(active)} fill="currentColor">
        <circle cx="12" cy="8.4" r="4" />
        <path d="M12 13.9c-4.3 0-7.75 2.85-7.75 6.55 0 .44.36.8.8.8h13.9c.44 0 .8-.36.8-.8 0-3.7-3.45-6.55-7.75-6.55Z" />
      </g>
    </svg>
  );
}
