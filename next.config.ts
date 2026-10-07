import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/restaurant",
        destination: "/takeaway&delivery",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
