# Artiza — Style Guide

Tokens live in [app/globals.css](app/globals.css). This document explains the reasoning; the CSS is the source of truth. If the two disagree, fix the CSS and update this file.

---

## Direction: catalogue-grade

Artiza is a **dark, poster-led catalogue**. The reference grammar is Netflix: you are not expected to arrive knowing which artisan you want, so browsing *is* the product. The home screen opens on a full-bleed billboard promoting one artisan, then stacks dense horizontal poster rails — each rail a different cut of the same register, each with a stated reason for existing.

That means: **the art is the interface.** Photography runs edge to edge with no gutter around it, type sits on scrims over the work rather than on plates beside it, and chrome floats over the art instead of boxing it in. Surfaces are near-black; a card is legible because it is a step *lighter* than the ground, never because of a shadow.

What carries over from the previous direction, and is not up for renegotiation: it still has to feel like an app rather than a website. Motion is still physical — instant press feedback, springs, interruptible gestures — and the apple-design skill in `.claude/skills/apple-design/` remains the authority on motion and materials. Netflix supplies the layout grammar and the palette. It does not supply the physics.

---

## Colour

Semantic tokens, one accent. **Dark only** — the app ships a single, deliberate appearance, so components never branch on colour scheme.

| Token | Value | Use |
|---|---|---|
| `canvas` | `#0B0B0E` | Page ground (near-black; cards sit on it by tone, not by shadow). |
| `card` | `#17171C` | Raised surfaces: cards, sheets, fields. |
| `fill` | `rgba(255,255,255,.11)` | Quiet fills: pills, chips, contact module. |
| `line` | `rgba(255,255,255,.13)` | Separators on chrome. |
| `ink` | `#FFFFFF` | Primary label. |
| `sub` | `#A1A1AA` | Secondary label. |
| `faint` | `#6B6B75` | Tertiary label, placeholders, masked digits, grabber. |
| `accent` | `#E50914` | Actions, money, verified. The only accent. |
| `accent-soft` | 18% accent | Tinted fills: avatars, badges, active nav pill. |
| `danger` | `#F5A524` | Errors, failed payment. State only. |
| `chrome` | translucent canvas | Floating headers, sheet footer, and chips floated on photos. |

### Rules

- **One accent.** Red means action, money, and verification. No second hue; Featured is a solid accent tag, verified is an accent checkmark.
- **Danger is amber, not red.** This is the one place the palette refuses the obvious. With a red accent, a red error sits next to a red button and reads as a second action rather than a failure — the hue has to differ or the state doesn't land.
- **Elevation is tone, not shadow.** A card is visible because `card` is a step lighter than `canvas`. A low-alpha black shadow renders literally nothing on a near-black ground, so don't reach for one — the only shadows left in the app are the heavy ones under modals (`0.5`–`0.7` alpha), where the job is separating a floating surface from a dimmed page.
- **White plates take `text-canvas`, never `text-ink`.** `ink` is white now. A white pill on a photo with white type is the single easiest mistake to make in this palette.
- **Chrome is a material.** The desktop header, the sheet footer, and labels floated on photos use `.chrome` (blur + saturate + translucent background) with content scrolling underneath. `prefers-reduced-transparency` makes it solid — already handled in `globals.css`.
- **The bottom tab bar is not chrome.** It is solid `bg-card` with a `border-line` hairline and one soft upward shadow. Photography scrolling under a blurred bar muddied both the bar and the photo; the tab bar is the app's floor, so it stays opaque.
- Never style with raw hex or stock Tailwind palette colours (`zinc-*`, `emerald-*`); always the tokens.

## Type

Three voices, all self-hosted from `app/fonts/` via `next/font/local`:

- **Satoshi** (Fontshare, ITF Free Font License) — the workhorse. Everything from captions to section titles. One 42KB variable file, 300–900.
- **Clash Display** (Fontshare, same license) — the display voice: `.display` and `.title-lg` only. Same foundry as Satoshi, so the geometry agrees, but sharper terminals and a narrower set width give headlines a poster edge Satoshi-at-800 can't. Three static cuts (500/600/700, ~45KB) — display type never needs the full range.
- **Instrument Serif italic** (OFL) — the accent voice, one 8KB cut. A single word inside a `.display` headline via `.display-accent`; never running text, never alone. The grotesque/serif-italic clash is the billboard's signature.

Why not the system stack: it ships excellent metrics but zero brand — it makes every app look like every other app. Satoshi is a geometric sans with a large x-height, so it stays legible at 13px captions while carrying real presence on a title. There's no third-party connection to open on a slow network, and `adjustFontFallback` generates metric-matched fallbacks so the swap doesn't shift the layout.

Tracking is size-specific — tight when large, near-neutral when small. A single fixed `letter-spacing` would be wrong at one end or the other. Geometric sans sets loose by default, so the body carries a global `-0.006em` and each step tightens further:

| Class | Face | Size | Weight | Tracking | Use |
|---|---|---|---|---|---|
| `.display` | Clash | 38→52px (clamp) | 600 | −0.02em | Billboard/banner headlines only. |
| `.display-accent` | Instrument it. | 1.04em | 400 | 0 | One word inside a `.display`. |
| `.title-lg` | Clash | 34→40px (clamp) | 600 | −0.024em | One per screen, large-title style. |
| `.title` | Satoshi | 22px | 700 | −0.026em | Section headings. |
| `.headline` | Satoshi | 17px | 600 | −0.016em | Card titles, row titles. |
| body | Satoshi | 15–17px | 400 | −0.006em | Prose, notes. Use Tailwind text sizes. |
| `.caption` | Satoshi | 13px | 500 | +0.001em | Meta, secondary rows. Preset `sub` colour. |
| `.figure` | Satoshi | inherit | 600 | −0.014em | Tabular numerals: prices, ratings, counts. |

Hierarchy comes from **contrast of face and weight together**, not size alone — Clash at the top against Satoshi body is what reads as designed rather than merely large. Clash never appears below `.title-lg`; Satoshi never carries a billboard.

Satoshi ships real `tnum`, so `.figure` sets `font-feature-settings: "tnum" 1` and prices, ratings, and counts never reflow when a digit changes. Prices are written `₦500` — no space, no decimals, always in `.figure`.

## Shape & layout

- Radius, two scales and a reason: **8px (`rounded-lg`) for posters, 16px (`rounded-2xl`) for cards, sheets and fields, full-round for buttons and chips.** Posters tile densely and are almost entirely photograph, so a soft 16px corner eats visible art and makes a rail read as a row of lozenges; every other surface is a content card and keeps the softer corner.
- Content max width `max-w-5xl`, gutters 16px mobile / 24px desktop — **except the billboard and the rails, which are full-bleed.** Art that stops short of the screen edge is the difference between a catalogue and a web page.
- Mobile is the primary surface: bottom tab bar, edge-to-edge horizontal scroll rails (`-mx-4 px-4` + `.no-scrollbar`), safe-area padding, 44px+ targets.
- Desktop gets the same content in a wider grid plus a translucent top header; the tab bar disappears at `md`.
- Lists: single column mobile, 2-up `sm`, 3-up `lg`.

## Motion

The apple-design skill governs. House rules:

- **Feedback on pointer-down, instantly.** `.pressable` scales to 0.97 with a 60ms in / 160ms out — press feels immediate, release feels smooth.
- **The billboard is the one thing that moves on its own.** It advances every 6s, and it is a scroll-snap rail rather than an animated index — the swipe and the timer are the same mechanism, so they can never disagree about which slide is showing. It stops for any deliberate attention (touch, hover, focus) and resumes 4s after that ends, stops entirely in a background tab, and never auto-advances under `prefers-reduced-motion`. There is no dot indicator: with a handful of slides that each fill the frame, dots add a second thing to read in the loudest spot on the page and say nothing the swipe doesn't already.
- **Frequency budget.** Tab switches and chip toggles animate colour only. Browse-list items never stagger. The unlock reveal is the app's one orchestrated moment: masked digit groups resolve left→right, 90ms apart, blur burning off.
- Springs (Framer Motion) for anything gesture-driven or interruptible; CSS `--ease-out` for simple state changes. Never `ease-in`.
- `prefers-reduced-motion` collapses everything to cuts — global, in `globals.css`. The sheet additionally drops drag entirely and cross-fades.

### The sheet

`components/Sheet.tsx` is the app's one modal surface and its most physical interaction. Rules it encodes, straight from apple-design:

- **Drag starts only from the grabber** (`useDragControls` + `dragListener={false}`), so sheet content scrolls without the two gestures ever needing disambiguation.
- **Dismiss is decided by momentum projection**, not distance: `offset + (v/1000)·d/(1−d)` with `d = 0.998`. A fast flick dismisses; a slow long drag snaps back.
- **Release velocity is handed to the exit spring**, so there's no seam between the finger letting go and the sheet flying out.
- **Rubber-band upward** (`dragConstraints={{ top: 0 }}`, `dragElastic={0.04}`) — resistance, never a hard stop.
- **Enter and exit share one path**: up from the bottom, down to the bottom.
- Drawer spring is `bounce: 0.2`, `duration: 0.35` — the apple-design drawer row (damping 0.8 / response 0.3). Bounce is earned here because a drag preceded it.
- Sheet height is measured in a **ref callback, not after the enter animation** — the scrim ramp and dismiss threshold both divide by it, and both would be wrong on a first-open drag otherwise.

## Components

- **Billboard** — the home screen's opening move, full bleed and pulled up under the floating header so the art starts at the very top of the screen. It carries the **offers** from `/admin/banners` as an auto-advancing swipe carousel: eyebrow, `.title-lg` title, body, one accent CTA pill. Two scrims do different jobs — one at the top so the header stays legible, one at the bottom that dissolves the art into the canvas, so the first rail scrolls out of the photo instead of off a seam. If the offers read fails or comes back empty it falls back to a spotlight on the top-ranked artisan in the same frame: credentials row (trade · years · jobs · rating) in place of the body, **View profile** and **Save** in place of the CTA. Home always opens on something.
- **Poster** — the unit of browse: a 2:3 crop of the artisan's work at `w-40` (`w-48` from `sm`), `rounded-lg`, name + verified check + `trade · location` on a bottom-up scrim, the heart top-right, a solid accent **Featured** tag top-left. Netflix prints its titles into the artwork; Artiza composes the poster instead, because the art is an unlabelled photo of a real job. Posters are deliberately large — a poster is a photograph plus three lines of type, and at thumbnail width neither the work nor the record is legible enough to choose from, which is the only thing the rail is for. Type inside it uses the app's real steps (15px name, 13px meta), never shrunken one-offs. Every poster carries **one** `.figure` line — the number the rail actually sorted on. A poster with no evidence on it is just a photograph.
- **Poster rails** — heading left, optional `See all ›` right, then a full-bleed horizontal scroll (`px-4` scroll padding, `.no-scrollbar`) so the next poster peeks and the invitation to scroll is visible. Rails hide themselves when empty rather than padding — Ilisan is one town, so they genuinely run out, and that is not a bug to fill. The order is: **Your list** (saved, and it goes first because a thing you chose beats a thing chosen for you), Trending now, Top 10 in Ilisan today, the offers rail, New on Artiza, Top rated, then one rail per trade with three or more artisans.
- **No rank numerals.** Netflix's Top 10 prints a giant numeral behind each poster. Artiza tried it and took it out: the numeral covers the job photo, which is the evidence the poster exists to show. The row keeps the cut and drops the numbering — the order already is the rank.
- **Category pills** — the row under the header, Netflix's *Tv Series / Movies / Categories*. Every pill is a live filter: an active trade (tap to clear), a **Top rated** toggle, and **Categories** opening the filter sheet. An outlined pill in the most prominent control slot on the page that only says a word is decoration, and this row is too valuable for that.
- **Promotion yields to intent.** The billboard, the offers rail and every discovery rail only render on an unfiltered screen. Once someone has said what they want, a rail that ignores it is noise — filtering swaps the whole stack for a plain poster grid under "Every artisan in Ilisan".
- **Header** — floats over the billboard art with nothing behind it and takes on `.chrome` only once the page has scrolled. On desktop the shared site header does the same thing on home and keeps its material everywhere else; it never hides, because the tab bar is mobile-only and hiding it would leave desktop with no primary navigation.
- **Buttons** — pills. Primary: `bg-accent text-white`, semibold, only for the paid action or the screen's single main action. Quiet actions are `bg-fill text-ink` or plain text.
- **Artisan card** — `bg-card rounded-2xl overflow-hidden`: a 16:10 cover photo of the artisan's work with the trade chip (`.chrome`) and any Featured badge floated on it, then the round portrait lapping the cover edge (`-mt-12`, `relative z-10`, `ring-4 ring-card` — the positioned cover paints over anything static, so only the portrait laps it and it carries its own stacking context). Below the photo, clear of it: name + verified check, location caption, two-line note, figure row (rating · yrs · jobs), and a footer showing the price with a chevron. The whole card is one tap target that opens the sheet.
- **Sealed contact** — `bg-fill rounded-2xl` module: masked number at full tabular width (`+234 8•• ••• ••••`) with a small "Locked" tag, and one pill button that carries the price: "Unlock contact · ₦500". Redaction, never blur — the number's shape is honest about what you're buying.
- **Bottom tab bar** — solid `bg-card`, hairline top border, soft upward shadow, safe-area padding. The active tab is an `accent-soft` pill behind the icon plus an accent semibold label; colour is the only thing that transitions (200ms), never size or position.
- **Chips** — full-round; active is `bg-ink text-canvas` (inverted, not accent — accent stays reserved for actions/money). They live inside the filter sheet; home filters through the category pill row.
- **Artisan detail sheet** — the list is for choosing, the sheet is for buying. Cards open it; unlocking only happens inside it, with the contact module pinned to a translucent footer so the paid action is never scrolled away.
- **Icons** — tab bar uses Artiza's own set in `components/TabIcons.tsx`: 24-unit grid, ~16-unit live box, 1.75 stroke, 2.4 minimum corner radius, outline when inactive and solid when active, cross-faded with no movement. Metaphors stay familiar; the character is in the drawing. Brand marks (WhatsApp, Instagram) live in `components/BrandIcons.tsx`. Lucide covers the rest — extend `TabIcons` before adding a custom one-off.
- **The register** — what a filtered home becomes: the rails and billboard drop away entirely and the results arrive as a plain poster grid (3-up mobile, 6-up large) headed "Every artisan in Ilisan" — a trade filter narrows the same sentence, singular: "Every tiler in Ilisan". Every rail on the unfiltered screen is a slice someone chose; this heading's job is to say the choosing stops here.
- **Loading** — every surface fed by the database has a skeleton in `components/Skeleton.tsx` that mirrors its geometry exactly: same aspect ratios, same paddings, same lapping portrait, so the swap to real content is a fade and never a jump. Section headings and rules are copy rather than data, so skeletons render them for real and only the cards are placeheld. `.skeleton` is `bg-fill` with a slow, low-contrast sweep, and **fades in after 120ms** — a fast read paints content before any grey is ever seen. `prefers-reduced-motion` drops the sweep and keeps the fill.
- **Empty states** — say what to do next, never just that nothing is here. No illustrations.
- **Failed reads are not empty states.** A read that fell over says so and offers "Try again" — never "nobody listed here", which is a lie that also hides the retry. Promotion is the exception: a failed offers read removes the banner rail rather than apologising for it.

## Photography

Photos are the product's evidence — the work is what's being judged, so it leads every surface. Two kinds, and they never swap roles:

- **Portrait** — square, face-aware crop, always circular. Shot by the team on the verification visit. The `accent-soft` initials circle stays as the fallback for anyone not yet photographed; it is a fallback, not the default.
- **Work** — the artisan's own portfolio, and now the single most load-bearing asset in the app. `work[0]` is the poster art and the billboard art; the rest fill the "Past work" rail in the sheet. Because the poster is a 2:3 crop of a landscape photo, **the subject has to survive a tall centre crop** — a wide shot of a finished room loses its subject where a card never would. `TRADE_COVERS[trade]` backs up any artisan with no photos yet, so a poster is never a blank slab.

Rules: photos always sit on `bg-fill` while loading, always through `next/image` with a `sizes` hint, and always under a gradient **scrim** (never a flat tint) when type sits on top — the scrim keeps labels legible without draining colour out of the work. Only the first banner is `priority`. Hover scale is `1.03` over 500ms, desktop only, and never on the portrait.

## Voice

- Plain verbs, sentence case, no exclamation marks.
- The action keeps its name through the flow: **Unlock contact** → **Contact unlocked**.
- Customer-side naming: "Unlock contact", not "purchase credit". "Rate this artisan", not "submit review".
- Errors say what happened and what to do: "Payment didn't go through. Your card wasn't charged — try again or use transfer."
- They're artisans, or named by trade — never "service providers", "vendors", or "listings".

## Quality floor

- Responsive to 360px; layout spacing in rem so Dynamic Type doesn't break it.
- Visible accent focus ring on everything interactive (global — don't override).
- `prefers-reduced-motion` and `prefers-reduced-transparency` respected (global).
- Hover states gated behind `@media (hover: hover) and (pointer: fine)`.
- Images via `next/image`, lazy below the fold. Assume a slow connection.
- Every icon-only control has an accessible name.
