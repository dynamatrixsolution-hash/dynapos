import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: ["192.168.86.4", "192.168.86.4:3000", "localhost:3000"],
  experimental: {
    allowedDevOrigins: ["192.168.86.4", "192.168.86.4:3000", "localhost:3000"],
  } as any,
  turbopack: {
    root: path.resolve(process.cwd()),
  },
};

export default nextConfig;
