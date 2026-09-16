import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/utils";

// El host sale de PUBLIC_SITE_URL, que solo existe en el servidor. Si esta ruta
// se prerenderiza durante el build (que corre fuera del servidor), quedaría
// congelado el valor por defecto de siteUrl(): http://localhost:3000.
export const dynamic = "force-dynamic";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api"],
      },
    ],
    sitemap: siteUrl("/sitemap.xml"),
    host: siteUrl(),
  };
}
