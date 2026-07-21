import Link from "next/link";
import { Search } from "lucide-react";
import { BannerRail } from "../components/BannerRail";
import { BrowseScreen } from "../components/BrowseScreen";

/**
 * App-shaped home: no marketing hero. Large title, search, featured
 * carousel, then the full list — content is the interface.
 */
export default function HomePage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 pb-28 pt-6 md:px-6 md:pb-16 md:pt-10">
      <header>
        <p className="caption font-medium text-accent">Ilisan · Ogun State</p>
        <h1 className="title-lg mt-1 text-ink">Find trusted hands.</h1>
      </header>

      {/* Search is a doorway, not a form — the field routes to /search. */}
      <Link
        href="/search"
        className="pressable mt-4 flex items-center gap-2.5 rounded-2xl bg-card px-4 py-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
      >
        <Search size={17} strokeWidth={2} className="text-sub" />
        <span className="text-[0.9375rem] text-faint">
          Plumber, tiler, solar installer…
        </span>
      </Link>

      <BannerRail />

      <BrowseScreen />
    </div>
  );
}
