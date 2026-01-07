/** @type {import('next').NextConfig} */
const nextConfig = {
  // LanceDB uses native Node.js bindings - exclude from webpack bundling
  experimental: {
    serverComponentsExternalPackages: ['@lancedb/lancedb'],
  },

  // Webpack config to handle native modules
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Don't bundle native modules on server
      config.externals = config.externals || [];
      config.externals.push('@lancedb/lancedb');
    }
    return config;
  },
};

export default nextConfig;
