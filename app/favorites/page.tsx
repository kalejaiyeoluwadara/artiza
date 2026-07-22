import type { Metadata } from "next";
import { FavoritesScreen } from "../../components/FavoritesScreen";

export const metadata: Metadata = {
  title: "Favourites — Artiza",
  description: "Artisans you've saved to come back to.",
  // Saved locally and personal to the device, so there is nothing here worth
  // indexing — and no stable page for a crawler to find.
  robots: { index: false, follow: true },
};

export default function FavoritesPage() {
  return <FavoritesScreen />;
}
