import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      new URL("https://picsum.photos/**"),
      new URL("https://i.pinimg.com/**"),
    ],
  },
};

export default nextConfig;
