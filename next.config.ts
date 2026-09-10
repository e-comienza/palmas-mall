import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

/**
 * Content-Security-Policy.
 *
 * `script-src` lleva `'unsafe-inline'` porque Next inyecta el bootstrap de
 * hidratación como script inline y este sitio mezcla páginas estáticas y
 * dinámicas, así que no se puede usar un nonce por petición (el nonce obliga a
 * renderizar todo en dinámico). La defensa principal contra XSS es el saneado
 * del HTML del admin (src/lib/sanitize.ts); esta cabecera es defensa en
 * profundidad: bloquea cargar scripts de otros orígenes, `eval`, plugins,
 * formularios hacia fuera y el enmarcado del sitio.
 */
const CSP_DIRECTIVES: Record<string, string[]> = {
  "default-src": ["'self'"],
  "base-uri": ["'self'"],
  "object-src": ["'none'"],
  "frame-ancestors": ["'none'"],
  "form-action": ["'self'"],
  "script-src": ["'self'", "'unsafe-inline'", ...(isDev ? ["'unsafe-eval'"] : [])],
  // Tailwind y next/font emiten estilos inline.
  "style-src": ["'self'", "'unsafe-inline'"],
  "font-src": ["'self'", "data:"],
  "img-src": [
    "'self'",
    "data:",
    "blob:",
    "https://res.cloudinary.com",
    "https://palmasmall.com",
    "https://images.unsplash.com",
    "https://*.giphy.com",
  ],
  "media-src": ["'self'", "blob:", "https://res.cloudinary.com"],
  // Embeds de video del admin (bloques VIDEO y el hero de PlayZone).
  "frame-src": [
    "'self'",
    "https://www.youtube.com",
    "https://www.youtube-nocookie.com",
    "https://player.vimeo.com",
  ],
  "connect-src": ["'self'", "https://res.cloudinary.com", ...(isDev ? ["ws:"] : [])],
  "worker-src": ["'self'", "blob:"],
  "manifest-src": ["'self'"],
};

const csp = Object.entries(CSP_DIRECTIVES)
  .map(([directive, values]) => `${directive} ${values.join(" ")}`)
  .join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  // Redundante con frame-ancestors, pero cubre navegadores viejos.
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  // Solo en producción: en local no hay HTTPS y HSTS dejaría el dominio fijado.
  ...(isDev
    ? []
    : [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }]),
];

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
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  async redirects() {
    return [
      // Renombre público /locales -> /directorio (preserva SEO de las URLs viejas)
      { source: "/locales", destination: "/directorio", permanent: true },
      { source: "/locales/:slug", destination: "/directorio/:slug", permanent: true },
    ];
  },
};

export default nextConfig;
