/* eslint-disable import/no-extraneous-dependencies */
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true'
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '/flight-tracker',
  swcMinify: true,
  poweredByHeader: false,
  reactStrictMode: false,
  compress: false, // compression is done in nginx
  staticPageGenerationTimeout: 300,
  output: 'standalone',
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production'
  },
  images: {
    domains: ['cdn.jetphotos.com', 'hatscripts.github.io', 'cdn.planespotters.net', 't.plnspttrs.net']
  }
};

module.exports = withBundleAnalyzer(nextConfig);
