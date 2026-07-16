import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { ContentStatus } from "@prisma/client";
import { siteUrl } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [locales, events, posts, customPages] = await Promise.all([
    prisma.local.findMany({
      where: { status: ContentStatus.PUBLISHED, deletedAt: null },
      select: { slug: true, updatedAt: true },
    }),
    prisma.event.findMany({
      where: { status: ContentStatus.PUBLISHED, deletedAt: null },
      select: { slug: true, updatedAt: true },
    }),
    prisma.blogPost.findMany({
      where: { status: ContentStatus.PUBLISHED, deletedAt: null },
      select: { slug: true, updatedAt: true },
    }),
    prisma.page.findMany({
      where: { system: false, status: ContentStatus.PUBLISHED, deletedAt: null },
      select: { slug: true, updatedAt: true },
    }),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: siteUrl("/"), changeFrequency: "daily", priority: 1 },
    { url: siteUrl("/conoce-palmas-mall"), changeFrequency: "monthly", priority: 0.8 },
    { url: siteUrl("/food-drinks"), changeFrequency: "weekly", priority: 0.9 },
    { url: siteUrl("/shop-more"), changeFrequency: "weekly", priority: 0.9 },
    { url: siteUrl("/directorio"), changeFrequency: "weekly", priority: 0.9 },
    { url: siteUrl("/eventos"), changeFrequency: "daily", priority: 0.9 },
    { url: siteUrl("/blog"), changeFrequency: "weekly", priority: 0.7 },
    { url: siteUrl("/momentos-palmas-mall"), changeFrequency: "monthly", priority: 0.6 },
    { url: siteUrl("/galardones"), changeFrequency: "yearly", priority: 0.6 },
    { url: siteUrl("/patrocinios"), changeFrequency: "monthly", priority: 0.7 },
    { url: siteUrl("/plano-del-mall"), changeFrequency: "monthly", priority: 0.7 },
    { url: siteUrl("/como-llegar"), changeFrequency: "monthly", priority: 0.8 },
    { url: siteUrl("/contacto"), changeFrequency: "yearly", priority: 0.6 },
    { url: siteUrl("/politica-tratamiento-datos"), changeFrequency: "yearly", priority: 0.2 },
  ];

  return [
    ...staticRoutes,
    ...locales.map((l) => ({
      url: siteUrl(`/directorio/${l.slug}`),
      lastModified: l.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...events.map((e) => ({
      url: siteUrl(`/eventos/${e.slug}`),
      lastModified: e.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...posts.map((p) => ({
      url: siteUrl(`/blog/${p.slug}`),
      lastModified: p.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...customPages.map((p) => ({
      url: siteUrl(`/${p.slug}`),
      lastModified: p.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
  ];
}
