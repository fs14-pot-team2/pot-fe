import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.dicebear.com",
        pathname: "/10.x/**",
      },
      {
        protocol: "https",
        hostname: "d2kiyd8xulhedo.cloudfront.net",
        pathname: "/**",
      },
    ],
  },

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
