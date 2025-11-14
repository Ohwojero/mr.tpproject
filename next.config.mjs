/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {},
  webpack(config) {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@libsql/client/web": require.resolve("@libsql/client/web"),
    };
    return config;
  },
};

export default nextConfig;
