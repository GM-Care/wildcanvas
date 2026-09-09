/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "*.r2.dev",
      },
      {
        protocol: "https",
        hostname: "*.cloudflarestorage.com",
      },
    ],
  },
  webpack: (config) => {
    // Disable file-system caching to prevent Google Drive virtual filesystem write errors
    config.cache = false;
    return config;
  },
};

export default nextConfig;
