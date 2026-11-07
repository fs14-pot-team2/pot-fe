import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://pot-api.duckdns.org/:path*",
      },
    ];
  },
};

export default nextConfig;
