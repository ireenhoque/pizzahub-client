import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  images: {
    // Menu item photos are uploaded server-side to ImgBB (see
    // pizzahub-server/src/app/utils/imgbb.ts).
    remotePatterns: [
      { protocol: "https", hostname: "i.ibb.com" },
      { protocol: "https", hostname: "i.ibb.co" },
    ],
  },
}

export default nextConfig
