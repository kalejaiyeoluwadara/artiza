import { adminResource } from "./resources/admin";
import { artisansResource } from "./resources/artisans";
import { authResource } from "./resources/auth";
import { bannersResource } from "./resources/banners";
import { homeResource } from "./resources/home";
import { reviewsResource } from "./resources/reviews";
import { unlocksResource } from "./resources/unlocks";

/**
 * Builds the API surface bound to one access token.
 *
 * A factory rather than a singleton because the token differs per caller: a
 * Server Component reads it from the session on the server, a Client Component
 * from `useSession()`. Both end up here, so the request logic is shared and
 * neither has to remember to attach a header.
 */
export function createApi(token?: string) {
  return {
    auth: authResource(token),
    artisans: artisansResource(token),
    banners: bannersResource(),
    /** The landing page's single read. Public, and prerendered on the server. */
    home: homeResource(),
    unlocks: unlocksResource(token),
    reviews: reviewsResource(token),
    /** Management routes. Every one of them 403s without an admin token. */
    admin: adminResource(token),
  };
}

export type Api = ReturnType<typeof createApi>;

/**
 * For the endpoints that need no session — the register, a profile, the promo
 * rail. Safe to import anywhere, including Server Components that render for
 * signed-out visitors.
 */
export const publicApi = createApi();

export { ApiError } from "./error";
export { BASE_URL } from "./client";
export type * from "./types";
