import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Allow all dev origins. In production you should not use a wildcard —
   * this setting only affects Next.js dev server cross-origin access to
   * dev resources (HMR / _next static files). Restart the dev server
   * after changing this value.
   */
  // WARNING: using '*' permits any origin to load dev resources.
  // Use only for local development/testing.

  allowedDevOrigins: ['192.168.1.109', 'localhost:3000', '*.ngrok-free.app'],
};

export default nextConfig;
