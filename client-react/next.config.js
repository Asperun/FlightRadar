module.exports = {
  swcMinify: true,
  reactStrictMode: true,
  experimental: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  images: {
    domains: ["cdn.jetphotos.com","hatscripts.github.io","cdn.planespotters.net"],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
}