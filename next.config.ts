import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disabled cacheComponents for dynamic routes compatibility
  // Can be re-enabled when all routes are properly optimized
  cacheComponents: false,
};

export default nextConfig;
