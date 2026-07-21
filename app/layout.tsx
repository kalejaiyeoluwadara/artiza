import type { Metadata } from "next";
import { Archivo } from "next/font/google";
import "./globals.css";
import { AppProvider } from "../context/AppContext";
import { BottomNav, SiteHeader } from "../components/BottomNav";

// One family across the whole product. Hierarchy comes from weight and
// width, so the `wdth` axis has to come along for the display styles.
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  axes: ["wdth"],
});

export const metadata: Metadata = {
  title: "Artiza — Vetted artisans in Ilisan, Ogun State",
  description:
    "Plumbers, solar installers, tilers, carpenters and more, visited and verified in person around Ilisan. Read the record for free, unlock a contact for ₦500.",
  keywords: [
    "Ilisan",
    "Ogun State",
    "Babcock University",
    "artisans",
    "plumber",
    "solar installer",
    "tiler",
    "carpenter",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${archivo.variable} h-full`}
    >
      <body className="min-h-full flex flex-col bg-ink font-sans text-bone">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-100 focus:rounded-sm focus:bg-brass focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-ink"
        >
          Skip to main content
        </a>
        <AppProvider>
          <SiteHeader />
          <main id="main-content" className="flex flex-1 flex-col">
            {children}
          </main>
          <BottomNav />
        </AppProvider>
      </body>
    </html>
  );
}
