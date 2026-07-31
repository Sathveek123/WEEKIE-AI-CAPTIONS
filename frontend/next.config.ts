import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // NOTE: Remove `output: "standalone"` for Vercel deployments.
  // Uncomment below only for Docker / self-hosted deployments:
  // output: "standalone",
  experimental: {
    serverActions: {
      // Vercel free tier: 4.5MB limit. Upgrade to Pro for larger uploads.
      // Self-hosted / Docker: No limit (500mb set below for local dev).
      bodySizeLimit: "500mb",
    },
  },
  images: {
    // Allow Google profile picture domains for OAuth avatars
    domains: ["lh3.googleusercontent.com"],
  },
};

export default nextConfig;
