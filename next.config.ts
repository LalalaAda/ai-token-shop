import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['172.27.64.1', 'localhost'],
  // allowedDevOrigins: ['local-origin.dev', '*.local-origin.dev'],
};

export default nextConfig;
