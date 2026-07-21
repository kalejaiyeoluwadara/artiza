# Artiza — Style Guide

Tokens live in [app/globals.css](app/globals.css). This document explains the reasoning; the CSS is the source of truth. If the two disagree, fix the CSS and update this file.

---

## Direction: The Dossier

Artiza vets artisans. Vetting produces a record, and the one field on that record you actually need — the phone number — is sealed until you pay ₦500.

So the product reads as a **vetted record**, not a marketplace listing: warm-black ground, brass as the mark of verification, artisan profiles laid out as a file rather than a card. The customer is spending money on trust, so the interface has to look like it takes the vetting seriously.

**What this is not:** a card grid on a light background with coloured category chips. That's every classifieds site, and it gives us no way to make ₦500 feel earned.

---

## Colour

Six colours plus two status values. Brass is the only chromatic colour in the system — everything else is a warm neutral.

| Token | Hex | Use |
|---|---|---|
| `ink` | `#0C0B09` | Page ground. Warm-cast black, never neutral grey. |
| `ash` | `#161410` | Raised surfaces: profile cards, sheets, inputs. |
| `ash-hi` | `#1F1C17` | Hover and pressed states on raised surfaces. |
| `line` | `#292520` | Hairlines, dividers, borders. |
| `brass` | `#C39A4E` | Verified marks, prices, unlock actions, focus rings. |
| `brass-hi` | `#D8B064` | Hover on brass. |
| `brass-dim` | `#6B5427` | Brass at rest — inactive rules and marks. |
| `bone` | `#F0EBE0` | Primary text. |
| `smoke` | `#A09A8D` | Secondary text and labels. |
| `mute` | `#6D675D` | Disabled text, placeholders. |
| `clay` | `#D0553F` | Errors, failed payment. State only. |
| `moss` | `#6F9160` | Payment confirmed. State only. |

### Rules

- **Brass is scarce.** If brass appears in more than three places on a screen, one of them is decoration — remove it. Reserve it for verification, money, and the unlock.
- **Featured vs. verified is a treatment difference, not a new hue.** Verified is a brass outline mark. Featured is a solid brass fill. No second accent colour gets added for this.
- **Never a gradient on brass.** It's a metal, not a glow.
- Contrast floor: `bone` and `smoke` on `ink`/`ash` both clear 7:1. `mute` is for disabled only and is deliberately below AA — never use it for content someone has to read.

---

## Type

**Archivo**, one family, hierarchy from weight and width. Loaded with the `wdth` axis in [app/layout.tsx](app/layout.tsx).

Not Inter or Geist: this is the one place a single-family system can still have a voice, and Archivo held slightly narrow at heavy weights reads like signage and registry plates — right for a record, and immediately not-a-default.

| Role | Size | Weight | Notes |
|---|---|---|---|
| `text-display` | 3.5rem / 1.0 | 700 | Hero only, once per page. Pair with `.type-display`. |
| `text-h1` | 2.5rem / 1.05 | 700 | Page title, artisan name. |
| `text-h2` | 1.75rem / 1.15 | 600 | Section heads. |
| `text-h3` | 1.25rem / 1.3 | 600 | Card titles, subsections. |
| `text-body` | 1rem / 1.6 | 400 | Prose, reviews, descriptions. |
| `text-sm` | 0.875rem / 1.5 | 400 | Meta, helper text, timestamps. |
| `.type-label` | 0.75rem / 1.4 | 500 | Uppercase, `+0.09em`. Eyebrows, table headers, field labels. |

Three helper classes carry the personality:

- `.type-display` — sets `font-stretch: 92%` and weight 700. Apply to `text-display`, `text-h1`, `text-h2`. This narrowing is the typographic signature; without it the type is generic.
- `.type-label` — the uppercase tracked micro style. Used for every data label on a profile.
- `.type-figure` — tabular figures, weight 600. Every price, rating, year count, and job count. Naira amounts must never reflow when a digit changes.

Tabular numerals are on globally via `body`. Prices are written `₦500`, no space, no decimals.

---

## Layout

- Content max width **1200px**. Gutters: 24px mobile, 40px from `md`.
- Grid: 4 columns mobile, 12 columns from `lg`.
- **Profile pages split 7/5**, not 50/50 — portfolio and reviews left, the sealed contact panel right. The asymmetry keeps the paid action from reading as an equal-weight sidebar.
- Spacing is an 8px rhythm (Tailwind's default scale). Section vertical rhythm: 64px mobile, 96px desktop.
- Radius: `xs` 2px, `sm` 4px, `md` 8px. Tight and document-like. Full-round only on filter chips, where the pill shape means "toggle". No large radii anywhere.
- Borders are `1px solid line`. Elevation comes from surface colour (`ink` → `ash` → `ash-hi`), not shadow. There are no drop shadows in this system except on the unlock modal.

Balanced responsive: design desktop and mobile in parallel. Tap targets 44px minimum everywhere, since a large share of traffic is phone-first.

---

## The signature: the seal

The one element Artiza is remembered by. Every artisan profile shows the contact line as **present but withheld** — a hairline-ruled brass strip with the digits redacted:

```
┌──────────────────────────────────────────┐
│ CONTACT                          ⬢ SEALED│
│ +234 8•• ••• ••••                        │
│ ──────────────────────────────────────── │
│ Unlock for ₦500        [ Unlock contact ]│
└──────────────────────────────────────────┘
```

- Redaction, not blur. Blur is the generic SaaS paywall and looks like a rendering bug on a slow phone. Withheld digits become brass dots at the same tabular width, so the number's shape is honest about what you're buying.
- The first four digits and country code stay visible. It proves the record is real.
- The seal mark (⬢) is the same glyph used for the verified badge, at label size.
- **Unlock animation:** digits resolve left to right in groups, 90ms apart, ~400ms total, `--ease-quiet`. This is the only orchestrated motion in the product. Everything else is a 150ms opacity or transform.
- Respect `prefers-reduced-motion` — the reveal becomes a straight cut. Already handled globally in `globals.css`.

---

## Components

Hand-rolled with Tailwind. No component library. Keep the primitive set small:

**Buttons**
- Primary — `bg-brass text-ink`, weight 600, radius `sm`. Only for the paid action: unlock, buy bundle, submit rating.
- Secondary — `bg-ash border border-line text-bone`, hover `bg-ash-hi`.
- Ghost — text only, `text-smoke`, hover `text-bone`.
- One primary button per screen. If two things look equally primary, neither is.

**Artisan card** — `bg-ash`, `border-line`, radius `sm`. Photo, name (`h3`), skill (`.type-label`), location, then a data strip of rating / years / jobs done in `.type-figure`. Featured cards get a solid brass top rule, 2px.

**Rating** — filled brass, empty `brass-dim`. Always paired with a numeric count in `.type-figure` — five stars with no count is a credibility claim we haven't earned.

**Empty states** — say what to do, not that nothing is here. "No tilers listed in Ilisan yet. Try plumbers or carpenters." Never an illustration.

---

## Voice

- Plain verbs, sentence case, no exclamation marks.
- The action keeps its name through the flow: the button says **Unlock contact**, the confirmation says **Contact unlocked**.
- Naming is customer-side. "Unlock contact", not "purchase credit". "Rate this artisan", not "submit review".
- Errors state what happened and what to do: "Payment didn't go through. Your card wasn't charged — try again or use transfer." No apologies, no vagueness.
- Never call artisans "service providers", "vendors", or "listings". They're artisans, or named by trade — plumber, tiler, solar installer.

---

## Quality floor

Non-negotiable on every screen, and not worth mentioning in the UI:

- Responsive to 360px wide.
- Visible brass focus ring on every interactive element (global, in `globals.css` — don't override it per-component).
- `prefers-reduced-motion` respected.
- Images optimised through `next/image`; portfolio photos lazy-loaded below the fold. Assume a slow connection.
- Every icon-only button has an accessible name.
