/** @type {import('next').NextConfig} */
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["@libsql/client", "sqlite3", "bcrypt", "libsql", "@prisma/client", "prisma"],
  },
  outputFileTracingExcludes: {
    "*": ["node_modules/@libsql", "node_modules/libsql"],
  },
  webpack(config, { isServer }) {
    if (isServer) {
      config.externals = [
        ...(Array.isArray(config.externals) ? config.externals : [config.externals].filter(Boolean)),
        "@libsql/client",
        "libsql",
        "sqlite3",
        "bcrypt",
      ];
    }
    config.resolve.alias = {
      ...config.resolve.alias,
      "@libsql/client/web": require.resolve("@libsql/client/web"),
    };
    return config;
  },
};

export default nextConfig;
