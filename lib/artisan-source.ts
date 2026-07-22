import { publicApi } from "./api";
import type { Artisan, Banner } from "./artisans";
import type { ArtisanSummary, BannerItem } from "./api/types";

/**
 * Where the register comes from — now the Artiza API rather than a fixture.
 *
 * The mapping below is nearly an identity, and that is deliberate: the API's
 * public artisan shape was defined to match what these screens already
 * rendered. It stays as an explicit function anyway, so the day the two
 * diverge there is one obvious place to reconcile them rather than a cast
 * that silently lies.
 */
function toArtisan(summary: ArtisanSummary): Artisan {
  return {
    id: summary.id,
    name: summary.name,
    trade: summary.trade,
    location: summary.location,
    yearsExperience: summary.yearsExperience,
    jobsCompleted: summary.jobsCompleted,
    recentUnlocks: summary.recentUnlocks,
    rating: summary.rating,
    reviewCount: summary.reviewCount,
    photo: summary.photo,
    work: summary.work,
    featured: summary.featured,
    verifiedSince: summary.verifiedSince,
    note: summary.note,
    services: summary.services,
    respondsIn: summary.respondsIn,
    availability: summary.availability,
  };
}

function toBanner(item: BannerItem): Banner {
  return {
    id: item.id,
    title: item.title,
    body: item.body,
    cta: item.cta,
    href: item.href,
    image: item.image,
  };
}

/**
 * The whole active register. It stays unfiltered on purpose — Ilisan is one
 * town, the list fits in memory, and filtering client-side keeps a chip tap
 * instant instead of dropping the list back into skeletons on every change.
 * When a second city lands, this grows a query argument.
 */
export async function fetchArtisans(signal?: AbortSignal): Promise<Artisan[]> {
  const artisans = await publicApi.artisans.list({}, signal);
  return artisans.map(toArtisan);
}

/** A single profile, for a deep link or a shared card. */
export async function fetchArtisan(
  id: string,
  signal?: AbortSignal,
): Promise<Artisan | null> {
  const artisan = await publicApi.artisans.get(id, signal);
  return toArtisan(artisan);
}

/** The promotional rail. Admin-managed too, so it reads the same way. */
export async function fetchBanners(signal?: AbortSignal): Promise<Banner[]> {
  const banners = await publicApi.banners.list(signal);
  return banners.map(toBanner);
}

/**
 * The landing page's whole payload in one call.
 *
 * It exists separately from `fetchArtisans` + `fetchBanners` because home is
 * the one screen that needs both, and two sequential browser round trips is
 * the difference between a rendered page and a skeleton. Called from the
 * server component, so the response is cached by the framework rather than
 * re-fetched per visitor.
 */
export async function fetchHome(
  signal?: AbortSignal,
): Promise<{ artisans: Artisan[]; banners: Banner[] }> {
  const { artisans, banners } = await publicApi.home.get(signal);
  return { artisans: artisans.map(toArtisan), banners: banners.map(toBanner) };
}
