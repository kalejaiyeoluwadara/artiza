import type { Metadata } from "next";
import { SearchScreen } from "../../components/SearchScreen";

export const metadata: Metadata = {
  title: "Search artisans — Artiza",
  description:
    "Search vetted artisans in Ilisan by name, trade, job or area — marble, burst pipes, inverter sizing, Babcock Road.",
};

/**
 * Same shell as the home screen: large title, then the field. Search is
 * its own tab because it answers a different question — not "what's on
 * offer" but "who does this exact thing".
 */
export default function SearchPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 pb-28 pt-6 md:px-6 md:pb-16 md:pt-10">
      <h1 className="title-lg text-ink">Search</h1>

      <SearchScreen />
    </div>
  );
}
