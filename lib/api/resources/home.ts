import { request } from "../client";
import type { HomePayload } from "../types";

/**
 * Short enough that a new artisan appears within a minute of the team adding
 * them, long enough that a burst of visitors costs one origin read between
 * them. Matches the register's own revalidate — the two are the same data.
 */
const HOME_REVALIDATE = 60;

export const homeResource = () => ({
  /**
   * Everything the landing page renders. Read on the server so the HTML ships
   * with the rails already in it; the `next` options only bite there, which is
   * exactly where this is called from.
   */
  get(signal?: AbortSignal): Promise<HomePayload> {
    return request<HomePayload>("/home", {
      next: { revalidate: HOME_REVALIDATE, tags: ["artisans", "banners"] },
      signal,
    });
  },
});
