import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
webpack: (config) => { config.resolve.alias.canvas = false; return config; }