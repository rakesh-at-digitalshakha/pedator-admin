/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  experimental: {
    middlewareNft: true,
  },
  async redirects() {
    return [
      {
        source: "/dashboard",
        destination: "/dashboard",
        permanent: false,
      },
    ];
  },
}

export default nextConfig
