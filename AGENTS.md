<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Artiza

Visual direction, tokens, components, and voice are defined in `STYLEGUIDE.md`. Read it before writing any UI. Design tokens are implemented in `app/globals.css` — use the token names (`bg-ash`, `text-brass`, `.type-label`), never raw hex or stock Tailwind palette colours (`zinc-*`, `amber-*`).

## Product Scope

## What it is

A local artisan discovery platform where customers find and unlock contact details for vetted hand workers — plumbers, solar installers, tilers, laundry workers, and more — starting in Ilisan, Ogun State.

## Users

- **Customers** — browse artisans, unlock contacts, rate after jobs.
- **Artisans** — listed and managed by the Artiza team; no self-signup at launch.
- **Admin** — Artiza team manages all artisan profiles and vetting.

## Core customer flow

1. Land on Artiza, browse or search artisans by skill and/or location
2. View profile: name, photo, skill, location, years of experience, portfolio photos, ratings
3. Pay ₦500 to unlock contact details (phone/WhatsApp) — or use a bundle
4. Contact artisan directly and handle the job offline
5. Receive a follow-up prompt after a reasonable window to rate the artisan

## Artisan profiles (admin-managed)

- Name, photo, skill category, location
- Years of experience
- Portfolio photos (past work)
- Ratings and review count
- Featured badge (paid promotion)

## Payments

- ₦500 per contact unlock
- Bundle: e.g. 3 unlocks for ₦1,200
- Paystack integration for card/transfer/USSD

## Revenue streams

1. Contact unlock fees (₦500 / bundles)
2. Featured/promoted listings — artisans pay to rank higher in search results

## Rating & credibility system

- Post-job follow-up prompts customer to leave a star rating + short review
- Artiza tracks number of completed/unlocked jobs per artisan for credibility signals
- Ratings visible on profile before unlock

## Launch scope (MVP)

- Web-first (mobile responsive)
- Ilisan, Ogun State only
- Admin dashboard to add/edit/manage artisan profiles
- Search and filter by skill category
- Unlock flow with Paystack
- Bundle purchase flow
- Post-job rating prompt (email or on-platform)
- Featured listing flag on profiles

## Out of scope for MVP

- Artisan self-signup
- In-app messaging
- Escrow or in-app payments to artisans
- Mobile app
- Multi-city expansion logic (foundation can be built in, but not activated)
