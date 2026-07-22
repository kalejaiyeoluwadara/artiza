import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { AuthProvider } from "../components/AuthProvider";
import { Toaster } from "../components/Toaster";
import { ConfirmHost } from "../components/ConfirmHost";
import { UnlocksProvider } from "../context/UnlocksContext";
import { BottomNav, SiteHeader } from "../components/BottomNav";
import { PWAInstallPrompt } from "../components/PWAInstallPrompt";

import { PageTransition } from "../components/PageTransition";

/**
 * Satoshi (Fontshare, ITF Free Font License — free for commercial use).
 * Self-hosted rather than CDN-linked: one 42KB variable file covers the
 * whole 300–900 range, so there is no third-party connection to open on
 * a slow connection and no flash of a second weight loading.
 */
const satoshi = localFont({
  src: "./fonts/Satoshi-Variable.woff2",
  variable: "--font-satoshi",
  weight: "300 900",
  display: "swap",
  // Sized so the system fallback occupies nearly the same space and the
  // swap doesn't shove the layout around.
  adjustFontFallback: "Arial",
  fallback: [
    "-apple-system",
    "BlinkMacSystemFont",
    "Segoe UI",
    "Roboto",
    "sans-serif",
  ],
});

/**
 * Clash Display (Fontshare, ITF Free Font License) — Satoshi's sibling from
 * the same foundry, cut for headlines only. Three static weights (~45KB total)
 * rather than the variable file, since display type only ever renders at
 * 500/600/700.
 */
const clash = localFont({
  src: [
    { path: "./fonts/ClashDisplay-500.woff2", weight: "500" },
    { path: "./fonts/ClashDisplay-600.woff2", weight: "600" },
    { path: "./fonts/ClashDisplay-700.woff2", weight: "700" },
  ],
  variable: "--font-clash",
  display: "swap",
  adjustFontFallback: "Arial",
  fallback: ["-apple-system", "BlinkMacSystemFont", "sans-serif"],
});

/**
 * Instrument Serif italic (Google Fonts, OFL) — a single 8KB italic cut used
 * as an accent voice inside display headlines, never for running text.
 */
const instrument = localFont({
  src: "./fonts/InstrumentSerif-Italic.woff2",
  variable: "--font-instrument",
  weight: "400",
  style: "italic",
  display: "swap",
  adjustFontFallback: "Times New Roman",
  fallback: ["Georgia", "serif"],
});

export const metadata: Metadata = {
  title: "Artiza — Vetted artisans in Ilisan, Ogun State",
  description:
    "Plumbers, solar installers, tilers, carpenters and more, visited and verified in person around Ilisan. Read the record for free, unlock a contact for ₦500.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Artiza",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/icon-512.png", type: "image/png", sizes: "512x512" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
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
  themeColor: "#0b0b0e",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${satoshi.variable} ${clash.variable} ${instrument.variable} h-full`}
    >
      <body className="flex min-h-full flex-col bg-canvas text-ink">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-100 focus:rounded-full focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
        >
          Skip to main content
        </a>
        <AuthProvider>
          <UnlocksProvider>
            <SiteHeader />
            <main id="main-content" className="flex flex-1 flex-col">
              <PageTransition>{children}</PageTransition>
            </main>
            <BottomNav />
            <PWAInstallPrompt />
            {/* Both portal to <body>, so they sit above every surface —
                including the sheet — and outside any transformed ancestor. */}
            <Toaster />
            <ConfirmHost />
          </UnlocksProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
