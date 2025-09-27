/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // Handle React Native async storage for browser environment
    config.resolve.alias = {
      ...config.resolve.alias,
      '@react-native-async-storage/async-storage': false,
    };

    // Handle pino-pretty for browser environment
    config.resolve.fallback = {
      ...config.resolve.fallback,
      'pino-pretty': false,
      fs: false,
      net: false,
      tls: false,
      crypto: false,
    };

    // Ignore warnings about missing dependencies that are only needed in Node.js environment
    config.ignoreWarnings = [
      { module: /@react-native-async-storage/ },
      { module: /pino-pretty/ },
      { module: /viem/ },
    ];

    return config;
  },
  experimental: {
    esmExternals: 'loose',
  },
  transpilePackages: [
    '@dynamic-labs/sdk-react-core',
    '@dynamic-labs/ethereum',
    '@dynamic-labs/wagmi-connector',
  ],
};

module.exports = nextConfig;