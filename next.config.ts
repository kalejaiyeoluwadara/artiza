import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // React's <ViewTransition> — drives the cross-fade between tab pages
    // (see components/PageTransition.tsx).
    viewTransition: true,
  },
  images: {
    // Portraits and portfolio photography are hosted on Unsplash until the
    // team's own shoots land in the CMS.
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      // Where POST /uploads puts everything the console shoots — portraits,
      // portfolio work and banner art all come back as res.cloudinary.com URLs.
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },
};

export default nextConfig;
