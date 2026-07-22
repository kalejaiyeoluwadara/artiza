import type { Metadata } from "next";
import { PageHeader } from "../../components/PageHeader";
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
      <PageHeader
        title="Search"
        subtitle="Names, trades, jobs and areas — all read at once, as you type."
      />

      <SearchScreen />
    </div>
  );
}
