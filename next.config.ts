import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // No `output: "standalone"` — that's for self-hosting (Docker/VPS) and
  // conflicts with Vercel's own build/deploy flow.
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
};

export default nextConfig;
