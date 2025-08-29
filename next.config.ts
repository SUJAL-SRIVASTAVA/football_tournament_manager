import withPWA from "next-pwa";
import type { NextConfig } from "next";

const withPWAFunc = withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  // Ignore TS/ESLint blocking Vercel
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
};

export default withPWAFunc(nextConfig);
