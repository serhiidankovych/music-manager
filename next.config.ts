import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/:path((?!$|tracks$).*)",
        destination: "/",
        permanent: false,
      },
    ];
  },
  images: {
    remotePatterns: [
      new URL("https://picsum.photos/**"),
      new URL("https://i.pinimg.com/**"),
    ],
  },
};

export default nextConfig;
