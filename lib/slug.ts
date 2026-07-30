import type { Artisan } from "./artisans";

/**
 * Share links read as names, not ids.
 *
 * `/artisan/tunde-adeyemi` is a link someone will paste into a WhatsApp chat
 * with a sentence around it, and a UUID in the middle of that sentence reads
 * as spam. The slug is derived from the name rather than stored, so nothing
 * has to be migrated and an artisan renamed in the console gets the right URL
 * on the next read — old links then 404 into the catalogue page, which is the
 * honest outcome for a name that no longer exists.
 */
export function slugify(value: string): string {
  return (
    value
      // Decompose accents, then drop the combining marks — "Olúwadára"
      // becomes "oluwadara" rather than a run of percent-escapes.
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      // Apostrophes close up ("Ade's" → "ades"); everything else becomes a
      // separator, so "O'Brien & Sons" is `obrien-sons` and not `obrien--sons`.
      .replace(/['\u2018\u2019]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
  );
}

export function artisanSlug(artisan: Pick<Artisan, "name">): string {
  return slugify(artisan.name);
}

/** Where an artisan's own page lives. The one place the route is spelled. */
export function artisanPath(artisan: Pick<Artisan, "name">): string {
  return `/artisan/${artisanSlug(artisan)}`;
}

/**
 * The slug back to an artisan.
 *
 * Two artisans in one town can share a name, and the register is the only
 * thing that knows it — a slug is built from a single profile and cannot. So
 * the first one by id keeps the bare name and the rest answer to `-2`, `-3`,
 * ordered by id so the mapping is stable across reads. The share button emits
 * the bare slug either way: for the overwhelmingly common unique name it is
 * exactly right, and for a collision it lands on a real profile of that name
 * rather than a 404.
 */
export function findArtisanBySlug(
  list: Artisan[],
  slug: string,
): Artisan | null {
  const wanted = slugify(decodeURIComponent(slug));
  if (!wanted) return null;

  const matching = (name: string) =>
    list
      .filter((artisan) => artisanSlug(artisan) === name)
      .sort((a, b) => a.id.localeCompare(b.id));

  const exact = matching(wanted);
  if (exact.length > 0) return exact[0];

  // Nothing answers to the whole slug, so it may be a disambiguated one.
  const suffixed = /^(.+)-(\d+)$/.exec(wanted);
  if (!suffixed) return null;

  const siblings = matching(suffixed[1]);
  return siblings[Number(suffixed[2]) - 1] ?? null;
}

/**
 * The canonical path for an artisan *within a known register* — the same as
 * {@link artisanPath} unless a name is shared, in which case it carries the
 * discriminator {@link findArtisanBySlug} resolves. Only the page itself has
 * the register to hand, which is why it and not the share button sets
 * `canonical`.
 */
export function canonicalArtisanPath(list: Artisan[], artisan: Artisan): string {
  const slug = artisanSlug(artisan);
  const siblings = list
    .filter((other) => artisanSlug(other) === slug)
    .sort((a, b) => a.id.localeCompare(b.id));

  const position = siblings.findIndex((other) => other.id === artisan.id);
  return position > 0 ? `/artisan/${slug}-${position + 1}` : `/artisan/${slug}`;
}
