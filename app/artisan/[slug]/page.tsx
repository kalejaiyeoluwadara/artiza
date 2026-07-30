import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { tradeName } from "../../../lib/artisans";
import { fetchArtisans } from "../../../lib/artisan-source";
import { canonicalArtisanPath, findArtisanBySlug } from "../../../lib/slug";
import { ArtisanScreen } from "./ArtisanScreen";

type Props = { params: Promise<{ slug: string }> };

/**
 * One artisan, at their own address.
 *
 * This is where a shared link lands, so it is read on the server: the HTML
 * that arrives already has the name, the record and the work in it, which is
 * what a link preview scrapes and what someone opening it on a slow phone in
 * Ilisan sees first. The register read is the same cached one home makes, so a
 * profile passed around a group chat costs the API one read between all of them.
 *
 * Resolution goes through the whole register rather than an id lookup, because
 * the URL is a name — `lib/slug.ts` owns that trade-off.
 */
async function load(params: Props["params"]) {
  const { slug } = await params;
  const artisans = await fetchArtisans();
  return { artisan: findArtisanBySlug(artisans, slug), artisans };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // A missing artisan gets no metadata worth writing — the page itself renders
  // the 404, and this must not throw on the way there.
  const { artisan, artisans } = await load(params).catch(() => ({
    artisan: null,
    artisans: [],
  }));

  if (!artisan) {
    return {
      title: "Artisan not found — Artiza",
      robots: { index: false, follow: true },
    };
  }

  const title = `${artisan.name} — ${tradeName(artisan)} in ${artisan.location}`;
  const description = `${artisan.note} Verified in person by the Artiza team, ${artisan.verifiedSince}. ${artisan.rating.toFixed(
    1,
  )}★ over ${artisan.reviewCount} reviews · ${artisan.yearsExperience} years.`;

  // The work leads the preview, and the portrait is the fallback — the same
  // order the card uses, for the same reason: you judge a hand worker by the job.
  const image = artisan.work[0] ?? artisan.photo;

  return {
    title: `${title} · Artiza`,
    description,
    alternates: { canonical: canonicalArtisanPath(artisans, artisan) },
    openGraph: {
      type: "profile",
      title,
      description,
      siteName: "Artiza",
      url: canonicalArtisanPath(artisans, artisan),
      images: image ? [{ url: image, alt: `${artisan.name}, ${tradeName(artisan)}` }] : [],
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      images: image ? [image] : [],
    },
  };
}

export default async function ArtisanPage({ params }: Props) {
  const { artisan } = await load(params);
  if (!artisan) notFound();

  return <ArtisanScreen artisan={artisan} />;
}
