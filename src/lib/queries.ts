import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { ContentStatus, FaqScope } from "@prisma/client";

const PUBLISHED = { status: ContentStatus.PUBLISHED, deletedAt: null };

// ── Locales ─────────────────────────────────────────────────

export const getCategories = cache(() =>
  prisma.localCategory.findMany({ orderBy: { order: "asc" } }),
);

export const getPublishedLocales = cache(
  (opts?: { group?: string; categorySlug?: string; q?: string }) =>
    prisma.local.findMany({
      where: {
        ...PUBLISHED,
        ...(opts?.group ? { category: { group: opts.group } } : {}),
        ...(opts?.categorySlug ? { category: { slug: opts.categorySlug } } : {}),
        ...(opts?.q
          ? {
              OR: [
                { name: { contains: opts.q, mode: "insensitive" } },
                { shortDescription: { contains: opts.q, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      include: { category: true },
      orderBy: [{ featured: "desc" }, { order: "asc" }, { name: "asc" }],
    }),
);

export const getLocalBySlug = cache((slug: string) =>
  prisma.local.findFirst({
    where: { slug, ...PUBLISHED },
    include: {
      category: true,
      sede: true,
      faqs: { where: { visible: true, deletedAt: null }, orderBy: { order: "asc" } },
    },
  }),
);

export const getRelatedLocales = cache((categoryId: string | null, excludeId: string) =>
  prisma.local.findMany({
    where: { ...PUBLISHED, id: { not: excludeId }, ...(categoryId ? { categoryId } : {}) },
    include: { category: true },
    take: 4,
    orderBy: [{ featured: "desc" }, { order: "asc" }],
  }),
);

export const getFeaturedLocales = cache(() =>
  prisma.local.findMany({
    where: { ...PUBLISHED, featured: true },
    include: { category: true },
    take: 8,
    orderBy: { order: "asc" },
  }),
);

// ── Eventos ─────────────────────────────────────────────────

export const getUpcomingEvents = cache((take?: number) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return prisma.event.findMany({
    where: {
      ...PUBLISHED,
      OR: [{ endsAt: { gte: today } }, { endsAt: null, startsAt: { gte: today } }],
    },
    orderBy: { startsAt: "asc" },
    take,
  });
});

/** Eventos publicados por lista de ids, preservando el orden recibido. */
export const getEventsByIds = cache(async (ids: string[]) => {
  if (!ids.length) return [];
  const events = await prisma.event.findMany({
    where: { ...PUBLISHED, id: { in: ids } },
  });
  const byId = new Map(events.map((e) => [e.id, e]));
  return ids.map((id) => byId.get(id)).filter((e): e is NonNullable<typeof e> => Boolean(e));
});

export const getPastEvents = cache((take = 6) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return prisma.event.findMany({
    where: {
      ...PUBLISHED,
      AND: [
        { OR: [{ endsAt: { lt: today } }, { endsAt: null, startsAt: { lt: today } }] },
      ],
    },
    orderBy: { startsAt: "desc" },
    take,
  });
});

export const getEventBySlug = cache((slug: string) =>
  prisma.event.findFirst({
    where: { slug, ...PUBLISHED },
    include: {
      sede: true,
      faqs: { where: { visible: true, deletedAt: null }, orderBy: { order: "asc" } },
    },
  }),
);

// ── Blog ────────────────────────────────────────────────────

export const getPublishedPosts = cache((take?: number) =>
  prisma.blogPost.findMany({
    where: PUBLISHED,
    orderBy: { publishedAt: "desc" },
    take,
  }),
);

export const getPostBySlug = cache((slug: string) =>
  prisma.blogPost.findFirst({ where: { slug, ...PUBLISHED } }),
);

// ── Galería ─────────────────────────────────────────────────

export const getHomeGallery = cache(() =>
  prisma.galleryImage.findMany({
    where: { status: ContentStatus.PUBLISHED, deletedAt: null, showOnHome: true },
    orderBy: { order: "asc" },
    take: 8,
  }),
);

export const getGalleryAlbums = cache(() =>
  prisma.galleryAlbum.findMany({
    where: { status: ContentStatus.PUBLISHED, deletedAt: null },
    include: {
      images: {
        where: { status: ContentStatus.PUBLISHED, deletedAt: null },
        orderBy: { order: "asc" },
      },
    },
    orderBy: { order: "asc" },
  }),
);

// ── FAQs / páginas ──────────────────────────────────────────

export const getGlobalFaqs = cache(() =>
  prisma.faq.findMany({
    where: { scope: FaqScope.GLOBAL, visible: true, deletedAt: null },
    orderBy: { order: "asc" },
  }),
);

export const getPage = cache((slug: string) =>
  prisma.page.findFirst({
    where: { slug, deletedAt: null },
    include: {
      blocks: { where: { visible: true }, orderBy: { order: "asc" } },
      faqs: { where: { visible: true, deletedAt: null }, orderBy: { order: "asc" } },
    },
  }),
);

// ── Navegación / sedes ──────────────────────────────────────

export const getNavigation = cache(async (key: string) => {
  const menu = await prisma.navigationMenu.findUnique({
    where: { key },
    include: {
      items: {
        where: { visible: true, parentId: null },
        orderBy: { order: "asc" },
        include: { children: { where: { visible: true }, orderBy: { order: "asc" } } },
      },
    },
  });
  return menu?.items ?? [];
});

export const getSedes = cache(() =>
  prisma.sede.findMany({ orderBy: { order: "asc" } }),
);

export const getMainSede = cache(async () => {
  const sedes = await getSedes();
  return sedes.find((s) => s.isMain) ?? sedes[0] ?? null;
});

// ── Popups ──────────────────────────────────────────────────

export const getActivePopups = cache(async () => {
  const now = new Date();
  return prisma.popup.findMany({
    where: {
      active: true,
      deletedAt: null,
      AND: [
        { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
        { OR: [{ endsAt: null }, { endsAt: { gte: now } }] },
      ],
    },
    orderBy: { updatedAt: "desc" },
  });
});
