const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

const withPreact = require("next-plugin-preact");

module.exports = {
  basePath: "/flight-tracker",
  swcMinify: true,
  reactStrictMode: true,
  compress: false,
  staticPageGenerationTimeout: 300,
  experimental: {
    outputStandalone: true,
    concurrentFeatures: true,
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  images: {
    domains: ["cdn.jetphotos.com", "hatscripts.github.io", "cdn.planespotters.net"],
    formats: ["image/avif", "image/webp"],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

// module.exports = withBundleAnalyzer(module.exports);
module.exports = withPreact(module.exports);
