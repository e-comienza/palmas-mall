import type { SiteSettings, Local, Event, BlogPost, Faq, Sede } from "@prisma/client";
import { siteUrl, stripHtml, truncate, asHours, asStringArray } from "@/lib/utils";

type JsonLd = Record<string, unknown>;

export function organizationJsonLd(settings: SiteSettings): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": siteUrl("/#organization"),
    name: settings.mallName,
    url: siteUrl(),
    logo: {
      "@type": "ImageObject",
      url: siteUrl(settings.logoUrl),
    },
    slogan: settings.tagline,
    email: settings.email,
    telephone: settings.phone,
    sameAs: [
      settings.instagramUrl,
      settings.facebookUrl,
      settings.tiktokUrl,
      settings.twitterUrl,
    ].filter(Boolean),
  };
}

export function shoppingCenterJsonLd(settings: SiteSettings, sedes: Sede[]): JsonLd {
  const main = sedes.find((s) => s.isMain) ?? sedes[0];
  return {
    "@context": "https://schema.org",
    "@type": "ShoppingCenter",
    "@id": siteUrl("/#shoppingcenter"),
    name: settings.mallName,
    description: settings.seoDefaultDesc,
    url: siteUrl(),
    image: siteUrl(settings.ogImageUrl),
    telephone: settings.phone,
    email: settings.email,
    slogan: settings.tagline,
    address: main
      ? {
          "@type": "PostalAddress",
          streetAddress: main.address,
          addressLocality: main.city,
          addressCountry: "CO",
        }
      : undefined,
    openingHours: settings.openingHours,
    hasMap: settings.googleMapsUrl || settings.wazeUrl || undefined,
    amenityFeature: [
      { "@type": "LocationFeatureSpecification", name: "Food Hall", value: true },
      { "@type": "LocationFeatureSpecification", name: "Petfriendly", value: true },
      { "@type": "LocationFeatureSpecification", name: "Coworking", value: true },
      { "@type": "LocationFeatureSpecification", name: "Zona infantil PlayZone", value: true },
      { "@type": "LocationFeatureSpecification", name: "Parqueadero", value: true },
    ],
    sameAs: [settings.instagramUrl, settings.facebookUrl, settings.tiktokUrl].filter(Boolean),
  };
}

export function localJsonLd(local: Local & { category?: { name: string } | null }, settings: SiteSettings): JsonLd {
  const type = local.isRestaurant ? "Restaurant" : "Store";
  const hours = asHours(local.openingHours);
  const gallery = Array.from(
    new Set([local.coverUrl, ...asStringArray(local.gallery)].filter(Boolean)),
  ) as string[];
  return {
    "@context": "https://schema.org",
    "@type": type,
    "@id": siteUrl(`/locales/${local.slug}#local`),
    name: local.name,
    url: siteUrl(`/locales/${local.slug}`),
    image: gallery.length
      ? gallery.map((url, i) => ({
          "@type": "ImageObject",
          url: absoluteUrl(url),
          caption: i === 0 ? `${local.name} en Palmas Mall Cali` : `Foto de ${local.name}`,
        }))
      : undefined,
    logo: local.logoUrl ? absoluteUrl(local.logoUrl) : undefined,
    description: local.longDescription || local.shortDescription || undefined,
    telephone: local.phone || undefined,
    email: local.email || undefined,
    menu: local.isRestaurant && local.menuUrl ? local.menuUrl : undefined,
    acceptsReservations: local.isRestaurant
      ? Boolean(local.reservationUrl || local.whatsapp) || undefined
      : undefined,
    servesCuisine: local.isRestaurant && local.category?.name ? local.category.name : undefined,
    address: {
      "@type": "PostalAddress",
      streetAddress: `${settings.address}${local.unitNumber ? `, Local ${local.unitNumber}` : ""}`,
      addressLocality: "Cali",
      addressCountry: "CO",
    },
    containedInPlace: { "@id": siteUrl("/#shoppingcenter") },
    openingHours: hours.length ? hours.map((h) => `${h.days}: ${h.hours}`) : undefined,
    sameAs: [local.instagramUrl, local.facebookUrl, local.tiktokUrl, local.websiteUrl].filter(Boolean),
  };
}

export function eventJsonLd(event: Event, settings: SiteSettings): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    url: siteUrl(`/eventos/${event.slug}`),
    description: event.shortDescription || truncate(stripHtml(event.longDescription), 300),
    image: event.coverUrl ? absoluteUrl(event.coverUrl) : undefined,
    startDate: event.startsAt.toISOString(),
    endDate: event.endsAt?.toISOString(),
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: {
      "@type": "Place",
      name: `${settings.mallName}${event.location ? ` · ${event.location}` : ""}`,
      address: {
        "@type": "PostalAddress",
        streetAddress: settings.address,
        addressLocality: "Cali",
        addressCountry: "CO",
      },
    },
    organizer: {
      "@type": "Organization",
      name: event.organizer || settings.mallName,
      url: siteUrl(),
    },
    offers:
      event.price === "FREE"
        ? {
            "@type": "Offer",
            price: 0,
            priceCurrency: "COP",
            availability: "https://schema.org/InStock",
            url: event.registrationUrl || siteUrl(`/eventos/${event.slug}`),
          }
        : undefined,
  };
}

export function blogPostJsonLd(post: BlogPost, settings: SiteSettings): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    url: siteUrl(`/blog/${post.slug}`),
    image: post.coverUrl ? absoluteUrl(post.coverUrl) : undefined,
    datePublished: post.publishedAt.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    author: { "@type": "Organization", name: post.author || settings.mallName },
    publisher: {
      "@type": "Organization",
      name: settings.mallName,
      logo: { "@type": "ImageObject", url: siteUrl(settings.logoUrl) },
    },
    description: post.excerpt || truncate(stripHtml(post.content), 300),
    mainEntityOfPage: siteUrl(`/blog/${post.slug}`),
  };
}

export function faqJsonLd(faqs: Pick<Faq, "question" | "answer">[]): JsonLd | null {
  if (!faqs.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: siteUrl(item.path),
    })),
  };
}

function absoluteUrl(url: string): string {
  return url.startsWith("http") ? url : siteUrl(url);
}

/** Render helper: <script type="application/ld+json"> */
export function JsonLdScript({ data }: { data: JsonLd | null | (JsonLd | null)[] }) {
  const items = (Array.isArray(data) ? data : [data]).filter(Boolean);
  if (!items.length) return null;
  return (
    <script
      type="application/ld+json"
      // JSON.stringify escapa <, así que es seguro
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(items.length === 1 ? items[0] : items).replace(/</g, "\\u003c"),
      }}
    />
  );
}
