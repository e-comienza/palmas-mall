import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "palmasmall.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "*.giphy.com" },
    ],
    formats: ["image/avif", "image/webp"],
    // Cache largo para las imágenes que aún pasan por el optimizador de Next
    // (locales /images, /brand, unsplash). Las de Cloudinary lo saltan vía
    // loader propio (ver src/lib/media.ts) y se sirven desde el CDN de Cloudinary.
    minimumCacheTTL: 31536000,
  },
  poweredByHeader: false,
  async redirects() {
    return [
      // Renombre público /locales -> /directorio (preserva SEO de las URLs viejas)
      { source: "/locales", destination: "/directorio", permanent: true },
      { source: "/locales/:slug", destination: "/directorio/:slug", permanent: true },
    ];
  },
};

export default nextConfig;
