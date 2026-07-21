import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppProvider } from "../context/AppContext";
import { BottomNav, SiteHeader } from "../components/BottomNav";

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

export const viewport: Viewport = {
  themeColor: "#f2f2f7",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="flex min-h-full flex-col bg-canvas text-ink">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-100 focus:rounded-full focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
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
