import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  webpack(config, { isServer }) {
    if (!isServer) {
      // Tell Webpack: “If any code tries to import these, give me an empty module instead.”
      config.resolve.fallback = {
        ...config.resolve.fallback,
        canvas: false,
        fs: false,
        path: false,
        os: false,
        crypto: false,
      };
    }
    return config;
  },
  turbopack: {},
};

export default nextConfig;
