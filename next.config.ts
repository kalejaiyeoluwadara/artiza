import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Portraits and portfolio photography are hosted on Unsplash until the
    // team's own shoots land in the CMS.
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }],
  },
};

export default nextConfig;
