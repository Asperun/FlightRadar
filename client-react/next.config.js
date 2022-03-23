const withBundleAnalyzer = require('@next/bundle-analyzer')
({
   enabled: process.env.ANALYZE === 'true'
 })

module.exports = {
  swcMinify: true,
  reactStrictMode: true,
  staticPageGenerationTimeout: 300,
  experimental: {
    outputStandalone: true
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production'
  },
  images: {
    domains: ["cdn.jetphotos.com", "hatscripts.github.io", "cdn.planespotters.net"]
  },
  typescript: {
    ignoreBuildErrors: true
  }
}

module.exports = withBundleAnalyzer(module.exports);