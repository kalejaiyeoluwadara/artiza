import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { AppProvider } from "../context/AppContext";
import { BottomNav, SiteHeader } from "../components/BottomNav";
import { PWAInstallPrompt } from "../components/PWAInstallPrompt";

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

export const metadata: Metadata = {
  title: "Artiza — Vetted artisans in Ilisan, Ogun State",
  description:
    "Plumbers, solar installers, tilers, carpenters and more, visited and verified in person around Ilisan. Read the record for free, unlock a contact for ₦500.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
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
  themeColor: "#f2f2f7",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${satoshi.variable} h-full`}>
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
          <PWAInstallPrompt />
        </AppProvider>
      </body>
    </html>
  );
}
