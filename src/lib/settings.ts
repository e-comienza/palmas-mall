import { cache } from "react";
import { prisma } from "@/lib/prisma";
import type { SiteSettings } from "@prisma/client";

/**
 * Site-wide settings, memoized per request. There is always exactly one row
 * (id = 1); if the table is empty (fresh database) defaults are created.
 */
export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  const existing = await prisma.siteSettings.findUnique({ where: { id: 1 } });
  if (existing) return existing;
  return prisma.siteSettings.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1 },
  });
});
