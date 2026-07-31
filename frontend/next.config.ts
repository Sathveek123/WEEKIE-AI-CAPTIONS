import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // NOTE: `output: "standalone"` is for Docker/self-hosted only.
  // Vercel does NOT need this — keep commented out for Vercel deploys.
  // output: "standalone",
  experimental: {
    serverActions: {
      // Vercel free tier: 4.5MB body limit per request.
      // Self-hosted / Docker: No limit (500mb set here for local dev).
      bodySizeLimit: "500mb",
    },
  },
  images: {
    // Allow Google profile picture CDN for real Google OAuth avatars
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
