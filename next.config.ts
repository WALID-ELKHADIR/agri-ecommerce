import type { NextConfig } from "next";

/**
 * Images hébergées dans Supabase Storage (bucket public `product-images`) :
 * seul le chemin public de ce bucket, sur le projet configuré, est autorisé.
 */
function supabaseImagePatterns(): URL[] {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return [];
  try {
    return [new URL("/storage/v1/object/public/product-images/**", url)];
  } catch {
    return [];
  }
}

const nextConfig: NextConfig = {
  cacheComponents: true,
  images: {
    remotePatterns: supabaseImagePatterns(),
  },
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
