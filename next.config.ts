import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      { source: "/feed", destination: "/api/feed" },
      { source: "/swipe", destination: "/api/swipe" },
      { source: "/matches", destination: "/api/matches" },
      { source: "/reset", destination: "/api/reset" },
    ];
  },
  // Allow better-sqlite3 native module in server components
  serverExternalPackages: ["better-sqlite3"],
};

export default nextConfig;
