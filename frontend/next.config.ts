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
    // In Vercel multi-service deployments, /_next/image optimizer returns 404
    // because service rewrites intercept the optimizer route.
    // unoptimized: true serves images directly from /public — fixes all broken images.
    unoptimized: true,
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
