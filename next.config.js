/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['lucide-react'],
  reactStrictMode: false,
  allowedDevOrigins: ['dev.devlomatix.com', 'https://dev.devlomatix.com'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com'
      },
      {
        protocol: 'https',
        hostname: 'uploadthing.com'
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com'
      },
      {
        protocol: 'https',
        hostname: 'uploadthing.com'
      },
      {
        protocol: 'https',
        hostname: 'utfs.io'
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com'
      },
      {
        protocol: 'https',
        hostname: '2ysdv7kqqjhyq5jp.public.blob.vercel-storage.com'
      },
      {
        protocol: 'https',
        hostname: 'aonetheme.com'
      },
      {
        protocol: 'https',
        hostname: 'cpjjmcqftkgnmrghgsfq.supabase.co'
      },
      {
        protocol: 'https',
        hostname: '**.supabase.co'
      }
    ]
  },
  turbopack: {},
  experimental: {
    turbopackFileSystemCacheForDev: false,
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-icons',
      'date-fns',
      'framer-motion',
      'recharts',
      'lodash',
      'react-icons',
    ],
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  async headers() {
    return [
      {
        // matching all API routes
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "https://dev.devlomatix.com" },
          { key: "Access-Control-Allow-Methods", value: "GET,POST,PUT,DELETE,OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization, X-Requested-With" },
          { key: "Access-Control-Allow-Credentials", value: "true" },
        ],
      }
    ]
  },
  webpack(config, options) {
    config.module.rules.push({
      test: /\.(mp3)$/,
      use: {
        loader: 'file-loader',
        options: {
          publicPath: '/_next/static/sounds/',
          outputPath: 'static/sounds/',
          name: '[name].[ext]',
          esModule: false,
        },
      },
    });

    config.stats = {
      warningsFilter: (warning) => {
        if (warning.message && warning.message.includes('handlebars')) {
          return false;
        }
        return true;
      },
    };

    return config;
  },
};

export default nextConfig;
