/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {},
  webpack: (config) => {
    config.cache = false;
    return config;
  },
  experimental: {
    workerThreads: false,
    cpus: 1,
  },
};

export default nextConfig;
