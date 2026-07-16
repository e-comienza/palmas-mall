import { prisma } from "@/lib/prisma";
import { getSiteSettings } from "@/lib/settings";
import { ContentStatus, FaqScope } from "@prisma/client";
import { siteUrl, stripHtml, truncate } from "@/lib/utils";

export const dynamic = "force-dynamic";

/** La dirección de la sede ya suele traer la ciudad; no la repitas. */
function formatAddress(address: string, city: string): string {
  const hasCity = address.toLowerCase().includes(city.toLowerCase());
  return `${[address, hasCity ? null : city, "Colombia"].filter(Boolean).join(", ")}.`;
}

/**
 * llms.txt — resumen del sitio en markdown para modelos de lenguaje (AEO).
 * Convención: https://llmstxt.org
 */
export async function GET() {
  const [settings, sedes, locales, events, posts, faqs] = await Promise.all([
    getSiteSettings(),
    prisma.sede.findMany({ orderBy: { isMain: "desc" } }),
    prisma.local.findMany({
      where: { status: ContentStatus.PUBLISHED, deletedAt: null },
      include: { category: { select: { name: true } } },
      orderBy: { name: "asc" },
    }),
    prisma.event.findMany({
      where: { status: ContentStatus.PUBLISHED, deletedAt: null, startsAt: { gte: new Date() } },
      orderBy: { startsAt: "asc" },
      take: 10,
    }),
    prisma.blogPost.findMany({
      where: { status: ContentStatus.PUBLISHED, deletedAt: null },
      orderBy: { publishedAt: "desc" },
      take: 10,
    }),
    prisma.faq.findMany({
      where: { scope: FaqScope.GLOBAL, visible: true, deletedAt: null },
      orderBy: { order: "asc" },
    }),
  ]);

  const main = sedes.find((s) => s.isMain) ?? sedes[0];
  const restaurants = locales.filter((l) => l.isRestaurant);
  const stores = locales.filter((l) => !l.isRestaurant);

  const line = (l: (typeof locales)[number]) =>
    `- [${l.name}](${siteUrl(`/directorio/${l.slug}`)})${
      l.category?.name ? ` — ${l.category.name}` : ""
    }${l.shortDescription ? `: ${l.shortDescription}` : ""}`;

  // `null` = campo ausente (se descarta); `""` = línea en blanco intencional.
  const sections: (string | null)[] = [
    `# ${settings.mallName}`,
    "",
    `> ${settings.seoDefaultDesc}`,
    "",
    settings.tagline ? `Lema: ${settings.tagline}` : null,
    main ? `Dirección: ${formatAddress(main.address, main.city)}` : null,
    settings.openingHours ? `Horario: ${settings.openingHours}` : null,
    settings.phone ? `Teléfono: ${settings.phone}` : null,
    settings.email ? `Correo: ${settings.email}` : null,
    "",
    "## Páginas principales",
    "",
    `- [Inicio](${siteUrl("/")})`,
    `- [Conoce Palmas Mall](${siteUrl("/conoce-palmas-mall")}): historia y concepto de Lifestyle Mall.`,
    `- [Food & Drinks](${siteUrl("/food-drinks")}): el Food Hall y su oferta gastronómica.`,
    `- [Shop & More](${siteUrl("/shop-more")}): tiendas, moda y servicios.`,
    `- [Directorio de locales](${siteUrl("/directorio")}): todos los locales, filtrables por categoría.`,
    `- [Eventos](${siteUrl("/eventos")}): agenda de eventos y experiencias.`,
    `- [Blog](${siteUrl("/blog")}): noticias y guías.`,
    `- [Plano del Mall](${siteUrl("/plano-del-mall")}): mapa de ubicación de los locales.`,
    `- [Cómo llegar](${siteUrl("/como-llegar")}): direcciones, Waze, Google Maps y horarios.`,
    `- [Galardones](${siteUrl("/galardones")}): premios FIABCI e ICSC Silver Award.`,
    `- [Contacto](${siteUrl("/contacto")}): formulario PQRS y datos de contacto.`,
    "",
  ];

  if (restaurants.length) {
    sections.push(
      `## Restaurantes y bares (${restaurants.length})`,
      "",
      ...restaurants.map(line),
      "",
    );
  }

  if (stores.length) {
    sections.push(`## Tiendas y servicios (${stores.length})`, "", ...stores.map(line), "");
  }

  if (events.length) {
    sections.push(
      "## Próximos eventos",
      "",
      ...events.map(
        (e) =>
          `- [${e.title}](${siteUrl(`/eventos/${e.slug}`)}) — ${e.startsAt
            .toISOString()
            .slice(0, 10)}${e.shortDescription ? `: ${e.shortDescription}` : ""}`,
      ),
      "",
    );
  }

  if (posts.length) {
    sections.push(
      "## Artículos recientes",
      "",
      ...posts.map(
        (p) =>
          `- [${p.title}](${siteUrl(`/blog/${p.slug}`)})${
            p.excerpt ? `: ${truncate(stripHtml(p.excerpt), 140)}` : ""
          }`,
      ),
      "",
    );
  }

  if (faqs.length) {
    sections.push(
      "## Preguntas frecuentes",
      "",
      ...faqs.flatMap((f) => [`### ${f.question}`, "", stripHtml(f.answer), ""]),
    );
  }

  const body = `${sections
    .filter((s): s is string => s !== null)
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trimEnd()}\n`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
