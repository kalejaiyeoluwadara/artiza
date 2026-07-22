import { NetflixHome } from "../components/NetflixHome";
import { fetchHome } from "../lib/artisan-source";

/**
 * Home is running a Netflix-shaped experiment: a billboard on one promoted
 * artisan, then stacked poster rails. It brings its own top bar and its own
 * palette scope, so it owns the full width of the screen — no page gutter and
 * no shared header above it.
 *
 * The rest of the app is unchanged and still light. See the `.netflix` block
 * in app/globals.css for how the two coexist.
 *
 * The register is read here, on the server, rather than from an effect inside
 * the client tree. That is the whole difference between a page that opens on
 * skeletons and one that opens on artisans: the HTML that arrives already has
 * the rails in it, and Next holds the response for `revalidate` seconds so a
 * burst of visitors costs the API one read between them.
 */
export default async function HomePage() {
  /* If the API can't be reached from the server — it is down, or this is a
     build running without it — home still renders. It falls through to the
     client hooks, which is exactly the behaviour this page had before, right
     down to the retry. A slow origin must not be able to 500 the landing page. */
  const initial = await fetchHome().catch(() => null);

  return (
    <NetflixHome artisans={initial?.artisans} banners={initial?.banners} />
  );
}
