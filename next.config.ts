import type { NextConfig } from "next";

// Static export: the whole app becomes plain files in ./out,
// which is exactly what Capacitor wraps for iOS/Android later.
const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;
