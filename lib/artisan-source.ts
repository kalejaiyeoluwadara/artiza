import { ARTISANS, Artisan, BANNERS, Banner } from "./artisans";

/**
 * Where the register comes from. One function, so the database swap is one
 * edit: replace the body with the fetch and every screen upstream already
 * renders the loading, error and empty branches it needs.
 *
 * It returns the whole register rather than a filtered slice on purpose.
 * Ilisan is one town — the list is small enough to hold in memory, and
 * filtering client-side keeps a chip tap instant instead of dropping the
 * list back into skeletons on every trade change. When a second city
 * lands, this grows a query argument and the callers pass their filters.
 */
export async function fetchArtisans(): Promise<Artisan[]> {
  return ARTISANS;
}

/**
 * A single profile, for the detail sheet and any future deep link. Today
 * the register is already in memory so callers rarely need it; with a
 * database it becomes the row read.
 */
export async function fetchArtisan(id: string): Promise<Artisan | null> {
  return ARTISANS.find((a) => a.id === id) ?? null;
}

/** The promotional rail. Admin-managed too, so it reads the same way. */
export async function fetchBanners(): Promise<Banner[]> {
  return BANNERS;
}
