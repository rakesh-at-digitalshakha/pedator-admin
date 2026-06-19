/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      // Pedator S3 media bucket
      {
        protocol: "https",
        hostname: "pedator-backet.s3.ap-south-1.amazonaws.com",
      },
      // Any S3 bucket in ap-south-1 (virtual-hosted style)
      {
        protocol: "https",
        hostname: "*.s3.ap-south-1.amazonaws.com",
      },
      // Path-style S3 endpoint
      {
        protocol: "https",
        hostname: "s3.ap-south-1.amazonaws.com",
      },
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  experimental: {
    // middlewareNft: true, // Removed invalid option
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
