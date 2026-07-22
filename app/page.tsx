import { NetflixHome } from "../components/NetflixHome";

/**
 * Home is running a Netflix-shaped experiment: a billboard on one promoted
 * artisan, then stacked poster rails. It brings its own top bar and its own
 * palette scope, so it owns the full width of the screen — no page gutter and
 * no shared header above it.
 *
 * The rest of the app is unchanged and still light. See the `.netflix` block
 * in app/globals.css for how the two coexist.
 */
export default function HomePage() {
  return <NetflixHome />;
}
