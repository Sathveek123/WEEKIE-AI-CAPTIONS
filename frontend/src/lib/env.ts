const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8095";

export const env = {
  BACKEND_URL: backendUrl,
  DATABASE_URL: process.env.DATABASE_URL || "file:./data/captions.db",
};

// Client-safe env — available in browser bundles
export const clientEnv = {
  NEXT_PUBLIC_BACKEND_URL:
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8095",
};

