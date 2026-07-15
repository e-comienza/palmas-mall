import type { Metadata } from "next";
import { PageHeader } from "@/components/public/page-header";
import { Container } from "@/components/public/container";
import { LocalCard } from "@/components/public/cards";
import { LocalesFilter } from "@/components/public/locales-filter";
import { getPublishedLocales, getCategories, getPage } from "@/lib/queries";
import { pageMetadata } from "@/lib/page-metadata";
import { itemListJsonLd, webPageJsonLd, JsonLdScript } from "@/lib/jsonld";
import { heroData } from "@/lib/blocks";
import { ExtraBlocks } from "@/components/public/block-renderer";
import { PageFaqs } from "@/components/public/page-faqs";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("locales", "/locales");
}

export default async function LocalesPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string; q?: string; grupo?: string }>;
}) {
  const { categoria, q, grupo } = await searchParams;
  const [locales, categories, page] = await Promise.all([
    getPublishedLocales({ categorySlug: categoria, q, group: grupo }),
    getCategories(),
    getPage("locales"),
  ]);

  const hero = heroData(page);
  // El ItemList solo describe el directorio completo; con filtros activos la
  // lista no representa la URL canónica.
  const isUnfiltered = !categoria && !q && !grupo;

  return (
    <>
      <JsonLdScript
        data={[
          webPageJsonLd({
            path: "/locales",
            name: hero.heading || "Directorio de locales",
            description: page?.seoDescription,
          }),
          isUnfiltered
            ? itemListJsonLd({
                path: "/locales",
                name: "Directorio de locales de Palmas Mall",
                items: locales.map((l) => ({
                  name: l.name,
                  path: `/locales/${l.slug}`,
                  image: l.coverUrl || undefined,
                  description: l.shortDescription || undefined,
                })),
              })
            : null,
        ]}
      />
      <PageHeader
        title={hero.heading || "Directorio de locales"}
        intro={hero.subheading || "Restaurantes, tiendas y servicios: todo lo que puedes encontrar en Palmas Mall."}
        crumbs={[{ name: "Locales", path: "/locales" }]}
      />
      <Container className="py-8 sm:py-12">
        <LocalesFilter
          categories={categories.map((c) => ({ slug: c.slug, name: c.name, group: c.group }))}
          activeCategory={categoria}
          activeGroup={grupo}
          query={q}
        />
        {locales.length ? (
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
            {locales.map((local) => (
              <LocalCard key={local.id} local={local} />
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-2xl border border-dashed border-mist-300 bg-white p-10 text-center">
            <p className="font-display text-lg font-bold text-palm-950">
              No encontramos locales con ese filtro
            </p>
            <p className="mt-2 text-sm text-mist-600">
              Intenta con otra palabra o revisa todas las categorías.
            </p>
          </div>
        )}
      </Container>
      <PageFaqs faqs={page?.faqs} className="bg-white py-14 sm:py-20" />
      <ExtraBlocks page={page} />
    </>
  );
}
