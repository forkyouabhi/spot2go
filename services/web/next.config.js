/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // Only if you are on a compatible version, otherwise remove
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
}

module.exports = nextConfig