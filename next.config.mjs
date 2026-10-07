/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // wagmi's connector barrel pulls in optional peers (x402, pino-pretty, etc.) that this app never uses.
    config.resolve.alias = {
      ...config.resolve.alias,
      "@x402/core/client": false,
      "@x402/evm": false,
      "@x402/evm/exact/client": false,
      "@x402/evm/upto/client": false,
      "@x402/svm/exact/client": false,
      "pino-pretty": false,
      "@react-native-async-storage/async-storage": false,
    };
    config.externals.push("lokijs", "encoding");
    return config;
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Strict-Transport-Security", value: "max-age=63072000" },
        ],
      },
    ];
  },
};

export default nextConfig;
