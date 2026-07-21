# Artiza — Style Guide

Tokens live in [app/globals.css](app/globals.css). This document explains the reasoning; the CSS is the source of truth. If the two disagree, fix the CSS and update this file.

---

## Direction: app-grade

Artiza should feel like a native app that happens to run in the browser — not a website. That means: **no marketing hero, content first.** The home screen opens with a large title, the search bar and its trade rail, then the artisan list itself. Chrome is translucent and floats over scrolling content. Buttons are pills. Surfaces are white cards on a soft grouped background. Motion feels physical: instant press feedback, springs, nothing scripted or slow.

Reference grammar: iOS system apps and the best marketplace apps (Airbnb, Thumbtack). The apple-design skill in `.claude/skills/apple-design/` is the authority on motion and materials — follow it.

---

## Colour

Semantic tokens, one accent. **Light only** — the app ships a single, deliberate appearance, so components never branch on colour scheme.

| Token | Value | Use |
|---|---|---|
| `canvas` | `#F2F2F7` | Page ground (grouped background). |
| `card` | `#FFFFFF` | Raised surfaces: cards, sheets, fields. |
| `fill` | `rgba(120,120,128,.10)` | Quiet fills: search, chips, contact module. |
| `line` | `rgba(60,60,67,.10)` | Separators on chrome. |
| `ink` | `#0E0E11` | Primary label. |
| `sub` | `#7D7D84` | Secondary label. |
| `faint` | `#B9B9C0` | Tertiary label, placeholders, masked digits, grabber. |
| `accent` | `#0D7A5F` | Actions, money, verified. The only accent. |
| `accent-soft` | 10% accent | Tinted fills: avatars, badges, active nav pill. |
| `danger` | `#E5484D` | Errors, failed payment. State only. |
| `chrome` | translucent canvas | Desktop header, sheet footer, and chips floated on photos. |

### Rules

- **One accent.** Emerald means action, money, and verification. No second hue; Featured is `accent-soft` fill, verified is an accent checkmark.
- **Elevation is a whisper.** Cards get `shadow-[0_1px_2px_rgba(0,0,0,0.04)]` at most. Depth comes from surface layering (canvas → card), not drop shadows.
- **Chrome is a material.** The desktop header, the sheet footer, and labels floated on photos use `.chrome` (blur + saturate + translucent background) with content scrolling underneath. `prefers-reduced-transparency` makes it solid — already handled in `globals.css`.
- **The bottom tab bar is not chrome.** It is solid `bg-card` with a `border-line` hairline and one soft upward shadow. Photography scrolling under a blurred bar muddied both the bar and the photo; the tab bar is the app's floor, so it stays opaque.
- Never style with raw hex or stock Tailwind palette colours (`zinc-*`, `emerald-*`); always the tokens.

## Type

**Satoshi** (Fontshare, ITF Free Font License — free for commercial use), self-hosted from `app/fonts/` via `next/font/local`.

Why not the system stack: it ships excellent metrics but zero brand — it makes every app look like every other app. Satoshi is a geometric sans with a large x-height, so it stays legible at 13px captions while carrying real presence at 800 on a title. One 42KB variable file covers 300–900, there's no third-party connection to open on a slow network, and `adjustFontFallback` generates a metric-matched Arial fallback so the swap doesn't shift the layout.

Tracking is size-specific — tight when large, near-neutral when small. A single fixed `letter-spacing` would be wrong at one end or the other. Geometric sans sets loose by default, so the body carries a global `-0.006em` and each step tightens further:

| Class | Size | Weight | Tracking | Use |
|---|---|---|---|---|
| `.title-lg` | 34→40px (clamp) | 800 | −0.038em | One per screen, large-title style. |
| `.title` | 22px | 700 | −0.026em | Section headings. |
| `.headline` | 17px | 600 | −0.016em | Card titles, row titles. |
| body | 15–17px | 400 | −0.006em | Prose, notes. Use Tailwind text sizes. |
| `.caption` | 13px | 500 | +0.001em | Meta, secondary rows. Preset `sub` colour. |
| `.figure` | inherit | 600 | −0.014em | Tabular numerals: prices, ratings, counts. |

Hierarchy comes from **weight and tracking together**, not size alone — 800 at the top against 400 body is what reads as premium rather than merely large.

Satoshi ships real `tnum`, so `.figure` sets `font-feature-settings: "tnum" 1` and prices, ratings, and counts never reflow when a digit changes. Prices are written `₦500` — no space, no decimals, always in `.figure`.

## Shape & layout

- Radius: **16px (`rounded-2xl`) for cards and fields, full-round for buttons and chips.** Soft and app-like — nothing sharp, nothing 4px.
- Content max width `max-w-5xl`, gutters 16px mobile / 24px desktop.
- Mobile is the primary surface: bottom tab bar, edge-to-edge horizontal scroll rails (`-mx-4 px-4` + `.no-scrollbar`), safe-area padding, 44px+ targets.
- Desktop gets the same content in a wider grid plus a translucent top header; the tab bar disappears at `md`.
- Lists: single column mobile, 2-up `sm`, 3-up `lg`.

## Motion

The apple-design skill governs. House rules:

- **Feedback on pointer-down, instantly.** `.pressable` scales to 0.97 with a 60ms in / 160ms out — press feels immediate, release feels smooth.
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

- **Search bar** — the home screen's query, always readable back. Mobile is one full-round `bg-card` pill: search glyph, the trade as a semibold line, "Ilisan · rating" as a caption under it, and a `bg-fill` circle carrying an accent count badge when filters are on. From `sm` the same query opens out into segments — **Trade · Rating**, each a `.caption` label over a semibold value, split by `w-px bg-line` hairlines — closed by an accent circle button. Every part opens the same filter sheet; nothing here is a text input.
- **Filter sheet** — grouped option chips (trade, rating floor) that apply on tap, with a pinned `.chrome` footer button that carries the live count ("Show 6 artisans") and only closes. Reset sits top-right, disabled at zero.
- **Trade rail** — the fast lane under the search bar: horizontally scrolling icon-over-label items, active is `text-ink` plus a 2px ink underline. Underline rather than a filled chip, so it doesn't compete with the bar above it. Tapping the active trade clears it.
- **Promotion yields to intent.** The featured carousel, the banner rail and the discovery rails only render on an unfiltered screen. Once someone has said what they want, a rail that ignores it is noise — and the results they asked for should be the next thing they see.
- **Discovery rails** — Trending, New on Artiza, Top rated: three sorted cuts of the same register, under Featured, all from one component (`components/DiscoveryRail.tsx`). Each heading carries a right-aligned `.caption` naming the rule that put artisans there ("Last 30 days", "Recently verified", "15+ reviews") — a ranked rail with no stated rule is just an assertion. The card is deliberately quieter than the featured slot: `w-44`, 4:3 work photo, the same portrait lapping it at `size-10`, name, trade · location, and **one** `.figure` line — the number the rail actually sorted on, with an accent glyph. Rails hide themselves when empty, so a quiet month drops the rail rather than filling it with stale names.
- **Buttons** — pills. Primary: `bg-accent text-white`, semibold, only for the paid action or the screen's single main action. Quiet actions are `bg-fill text-ink` or plain text.
- **Artisan card** — `bg-card rounded-2xl overflow-hidden`: a 16:10 cover photo of the artisan's work with the trade chip (`.chrome`) and any Featured badge floated on it, then the round portrait lapping the cover edge (`-mt-12`, `relative z-10`, `ring-4 ring-card` — the positioned cover paints over anything static, so only the portrait laps it and it carries its own stacking context). Below the photo, clear of it: name + verified check, location caption, two-line note, figure row (rating · yrs · jobs), and a footer showing the price with a chevron. The whole card is one tap target that opens the sheet.
- **Featured card** — the promoted slot, so it's the most image-forward surface: photo fills the card, type sits on a bottom-up scrim in white, portrait ringed in `white/70`.
- **Banner rail** — the app's one promotional surface, under the search field. Full-bleed photo cards (`aspect-2/1`, `5/2` from `sm`) at 85% viewport width so the next one peeks, snap-centre scrolling, white type on a `from-black/80` bottom-up scrim, one white pill CTA. Dots below are a **position readout, not a control**, derived from real `scrollLeft` — nothing auto-advances.
- **Sealed contact** — `bg-fill rounded-2xl` module: masked number at full tabular width (`+234 8•• ••• ••••`) with a small "Locked" tag, and one pill button that carries the price: "Unlock contact · ₦500". Redaction, never blur — the number's shape is honest about what you're buying.
- **Bottom tab bar** — solid `bg-card`, hairline top border, soft upward shadow, safe-area padding. The active tab is an `accent-soft` pill behind the icon plus an accent semibold label; colour is the only thing that transitions (200ms), never size or position.
- **Chips** — full-round; active is `bg-ink text-canvas` (inverted, not accent — accent stays reserved for actions/money). They live inside the filter sheet now; the home screen filters through the search bar and trade rail.
- **Artisan detail sheet** — the list is for choosing, the sheet is for buying. Cards open it; unlocking only happens inside it, with the contact module pinned to a translucent footer so the paid action is never scrolled away.
- **Icons** — tab bar uses Artiza's own set in `components/TabIcons.tsx`: 24-unit grid, ~16-unit live box, 1.75 stroke, 2.4 minimum corner radius, outline when inactive and solid when active, cross-faded with no movement. Metaphors stay familiar; the character is in the drawing. Brand marks (WhatsApp, Instagram) live in `components/BrandIcons.tsx`. Lucide covers the rest — extend `TabIcons` before adding a custom one-off.
- **The register** — the full list, headed "Every artisan in Ilisan" (a trade filter narrows the same sentence, singular: "Every tiler in Ilisan"). Every rail above it is a slice someone chose — promoted, busiest, newest, best reviewed — so this heading's job is to say the choosing stops here. It shows **one page of six**, with the count on the right turned into the control that reveals the rest: "View all 24" → "Show fewer". The rails above already argue for who's worth seeing first, so the list is a browse surface, not an index.
- **Loading** — every surface fed by the database has a skeleton in `components/Skeleton.tsx` that mirrors its geometry exactly: same aspect ratios, same paddings, same lapping portrait, so the swap to real content is a fade and never a jump. Section headings and rules are copy rather than data, so skeletons render them for real and only the cards are placeheld. `.skeleton` is `bg-fill` with a slow, low-contrast sweep, and **fades in after 120ms** — a fast read paints content before any grey is ever seen. `prefers-reduced-motion` drops the sweep and keeps the fill.
- **Empty states** — say what to do next, never just that nothing is here. No illustrations.
- **Failed reads are not empty states.** A read that fell over says so and offers "Try again" — never "nobody listed here", which is a lie that also hides the retry. Promotion is the exception: a failed offers read removes the banner rail rather than apologising for it.

## Photography

Photos are the product's evidence — the work is what's being judged, so it leads every surface. Two kinds, and they never swap roles:

- **Portrait** — square, face-aware crop, always circular. Shot by the team on the verification visit. The `accent-soft` initials circle stays as the fallback for anyone not yet photographed; it is a fallback, not the default.
- **Work** — the artisan's own portfolio. `work[0]` is the card cover, the rest fill the "Past work" rail in the sheet. `TRADE_COVERS[trade]` backs up any artisan with no photos yet, so a card is never a blank slab.

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
