import type { Metadata } from "next";
import { getPage } from "@/lib/queries";
import { getSiteSettings } from "@/lib/settings";
import { siteUrl } from "@/lib/utils";

/** Metadata de una página del sitio a partir de su registro en BD. */
export async function pageMetadata(slug: string, path: string): Promise<Metadata> {
  const [page, settings] = await Promise.all([getPage(slug), getSiteSettings()]);
  const title = page?.seoTitle || page?.title || settings.seoDefaultTitle;
  const description = page?.seoDescription || settings.seoDefaultDesc;
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: page?.canonicalUrl || siteUrl(path) },
    robots: page?.noIndex ? { index: false, follow: false } : undefined,
    openGraph: {
      title,
      description,
      url: siteUrl(path),
      images: [{ url: page?.ogImageUrl || settings.ogImageUrl }],
    },
  };
}
