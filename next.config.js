/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['firebasestorage.googleapis.com'],
    formats: ['image/webp', 'image/avif'],
  },
  // Enable compression
  compress: true,
  // Optimize production builds
  swcMinify: true,
  // Enable experimental features for speed
  experimental: {
    optimizeCss: true,
  },
}

module.exports = nextConfig
