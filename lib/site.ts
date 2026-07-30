/**
 * Where this deployment lives, as an absolute origin.
 *
 * Only metadata needs it: a canonical link and an OG `url` have to be absolute
 * or the scraper on the other end of a shared link resolves them against its
 * own host. Everything in the app itself uses relative paths, and the share
 * button reads `window.location.origin`, so this is not a second source of
 * truth for routing.
 *
 * `NEXTAUTH_URL` is already declared as "the canonical URL of this app" in
 * `.env.example` and is set in production, so it is the value rather than a
 * third variable to keep in sync. Preview deployments fall through to the one
 * Vercel injects, which is what makes a preview share a preview link.
 */
export const SITE_URL = (
  process.env.NEXTAUTH_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : undefined) ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined) ??
  "http://localhost:3000"
).replace(/\/$/, "");
