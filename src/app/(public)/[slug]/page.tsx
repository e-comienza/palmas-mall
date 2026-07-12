import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ContentStatus } from "@prisma/client";
import { PageHeader } from "@/components/public/page-header";
import { BlockRenderer } from "@/components/public/block-renderer";
import { faqJsonLd, JsonLdScript } from "@/lib/jsonld";
import { siteUrl } from "@/lib/utils";
import { cache } from "react";

export const dynamic = "force-dynamic";

/**
 * Páginas creadas desde el admin (no-sistema): se renderizan a partir de
 * sus bloques. Las rutas fijas del sitio tienen prioridad sobre esta.
 */
const getCustomPage = cache((slug: string) =>
  prisma.page.findFirst({
    where: { slug, system: false, status: ContentStatus.PUBLISHED, deletedAt: null },
    include: {
      blocks: { where: { visible: true }, orderBy: { order: "asc" } },
      faqs: { where: { visible: true, deletedAt: null }, orderBy: { order: "asc" } },
    },
  }),
);

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = await getCustomPage(slug);
  if (!page) return { title: "Página no encontrada" };
  return {
    title: { absolute: page.seoTitle || page.title },
    description: page.seoDescription || page.description,
    alternates: { canonical: page.canonicalUrl || siteUrl(`/${page.slug}`) },
    robots: page.noIndex ? { index: false, follow: false } : undefined,
    openGraph: {
      title: page.seoTitle || page.title,
      description: page.seoDescription || page.description,
      url: siteUrl(`/${page.slug}`),
      images: page.ogImageUrl ? [{ url: page.ogImageUrl }] : undefined,
    },
  };
}

export default async function CustomPage({ params }: Props) {
  const { slug } = await params;
  const page = await getCustomPage(slug);
  if (!page) notFound();

  const hasHero = page.blocks.some((b) => b.type === "HERO");

  return (
    <>
      {page.faqs.length ? <JsonLdScript data={faqJsonLd(page.faqs)} /> : null}
      {!hasHero ? (
        <PageHeader
          title={page.title}
          intro={page.description || undefined}
          crumbs={[{ name: page.title, path: `/${page.slug}` }]}
        />
      ) : null}
      <div className="pb-16">
        <BlockRenderer blocks={page.blocks} pageFaqs={page.faqs} />
      </div>
    </>
  );
}
