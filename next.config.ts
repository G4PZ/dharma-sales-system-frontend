import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination:
          "https://dharma-sales-system-backend.vercel.app/api/:path*",
      },
    ];
  },
};

export default nextConfig;