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
/** @type {Record<string, string[]>} */
const CSP_DIRECTIVES = {
  "default-src": ["'self'"],
  "base-uri": ["'self'"],
  "object-src": ["'none'"],
  "frame-ancestors": ["'none'"],
  "form-action": ["'self'"],
  // googletagmanager.com sirve el gtag.js de Google Analytics.
  "script-src": [
    "'self'",
    "'unsafe-inline'",
    "https://www.googletagmanager.com",
    ...(isDev ? ["'unsafe-eval'"] : []),
  ],
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
    // Google Analytics envía algunos eventos como pixel.
    "https://*.google-analytics.com",
    "https://*.googletagmanager.com",
  ],
  "media-src": ["'self'", "blob:", "https://res.cloudinary.com"],
  // Embeds de video del admin (bloques VIDEO y el hero de PlayZone).
  "frame-src": [
    "'self'",
    "https://www.youtube.com",
    "https://www.youtube-nocookie.com",
    "https://player.vimeo.com",
  ],
  "connect-src": [
    "'self'",
    "https://res.cloudinary.com",
    // Envío de mediciones de Google Analytics.
    "https://*.google-analytics.com",
    "https://*.analytics.google.com",
    "https://*.googletagmanager.com",
    ...(isDev ? ["ws:"] : []),
  ],
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

/** @type {import("next").NextConfig} */
const nextConfig = {
  turbopack: {
    root: import.meta.dirname,
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

      // El WordPress viejo quedó archivado en new.palmasmall.com, pero dentro de
      // su contenido las imágenes están escritas con URL absoluta a este dominio
      // (WP_HOME y WP_SITEURL no reescriben lo que está guardado en la base de
      // datos). Esas peticiones llegan aquí, no a WordPress, así que se rebotan
      // al subdominio, que es quien tiene los archivos.
      //
      // Temporal (307) a propósito: si algún día se retira el archivo, se borran
      // estas reglas y ningún buscador se quedó con la redirección memorizada.
      {
        source: "/wp-content/:path*",
        destination: "https://new.palmasmall.com/wp-content/:path*",
        permanent: false,
      },
      {
        source: "/wp-includes/:path*",
        destination: "https://new.palmasmall.com/wp-includes/:path*",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
