import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppProvider } from "../context/AppContext";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "IlisanHands | Local Skills & Artisans Marketplace (Ilisan, Nigeria)",
  description: "Connect with verified local nannies, tilers, painters, carpenters, electricians, and labourers in Ilisan, Ogun State. Read reviews and contact workers instantly on WhatsApp.",
  keywords: ["Ilisan", "Babcock University", "Artisans", "Local Labour", "Nigeria", "Nanny", "Tiler", "Painter", "Carpenter"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-zinc-50 font-sans text-zinc-950">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:rounded-xl focus:bg-amber-500 focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-white"
        >
          Skip to main content
        </a>
        <AppProvider>
          <main id="main-content" className="flex-1 flex flex-col">{children}</main>
        </AppProvider>
      </body>
    </html>
  );
}
