/** @type {import('next').NextConfig} */
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["@libsql/client", "sqlite3", "bcrypt", "libsql"],
  },
  webpack(config) {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@libsql/client/web": require.resolve("@libsql/client/web"),
    };
    return config;
  },
};

export default nextConfig;
