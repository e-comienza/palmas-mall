import type { Metadata } from "next";
import { MagnifyingGlassPlus } from "@phosphor-icons/react/dist/ssr";
import { PageHeader } from "@/components/public/page-header";
import { Container } from "@/components/public/container";
import { LocalCard } from "@/components/public/cards";
import { LocalesFilter } from "@/components/public/locales-filter";
import { PlanoViewer } from "@/components/public/plano-viewer";
import { getPublishedLocales, getCategories, getPage } from "@/lib/queries";
import { getSiteSettings } from "@/lib/settings";
import { planoImageSrc } from "@/lib/media";
import { pageMetadata } from "@/lib/page-metadata";
import { itemListJsonLd, webPageJsonLd, JsonLdScript } from "@/lib/jsonld";
import { heroData } from "@/lib/blocks";
import { ExtraBlocks } from "@/components/public/block-renderer";
import { PageFaqs } from "@/components/public/page-faqs";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("directorio", "/directorio");
}

export default async function DirectorioPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string; q?: string; grupo?: string }>;
}) {
  const { categoria, q, grupo } = await searchParams;
  const [locales, categories, page, settings] = await Promise.all([
    getPublishedLocales({ categorySlug: categoria, q, group: grupo }),
    getCategories(),
    getPage("directorio"),
    getSiteSettings(),
  ]);

  const hero = heroData(page);
  const planoSrc = planoImageSrc(settings.planoImageUrl);
  const isUnfiltered = !categoria && !q && !grupo;

  return (
    <>
      <JsonLdScript
        data={[
          webPageJsonLd({
            path: "/directorio",
            name: hero.heading || "Directorio",
            description: page?.seoDescription,
          }),
          isUnfiltered
            ? itemListJsonLd({
                path: "/directorio",
                name: "Directorio de locales de Palmas Mall",
                items: locales.map((l) => ({
                  name: l.name,
                  path: `/directorio/${l.slug}`,
                  image: l.coverUrl || undefined,
                  description: l.shortDescription || undefined,
                })),
              })
            : null,
        ]}
      />
      <PageHeader
        title={hero.heading || "Directorio"}
        intro={hero.subheading || "Restaurantes, tiendas y servicios: todo lo que puedes encontrar en Palmas Mall."}
        crumbs={[{ name: "Directorio", path: "/directorio" }]}
      />

      <Container className="py-8 sm:py-12">
        {/* Directorio de locales arriba, el plano debajo */}
        <div>
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
        </div>

        {/* Plano del mall debajo del directorio */}
        <div className="mt-14">
          <h2 className="mb-4 font-display text-2xl font-bold tracking-[-0.02em] text-palm-950">
            Plano del mall
          </h2>
          <div className="overflow-hidden rounded-2xl bg-white p-3 shadow-card sm:p-4">
            <PlanoViewer
              src={planoSrc}
              alt="Plano general de Palmas Mall Cali con la ubicación de todos los locales"
            />
            <p className="flex items-center justify-center gap-1.5 px-4 pb-1 pt-3 text-center text-[13px] text-mist-500">
              <MagnifyingGlassPlus size={15} /> Pellizca o usa la rueda del mouse para acercar el plano
            </p>
          </div>
        </div>
      </Container>

      <PageFaqs faqs={page?.faqs} className="bg-white py-14 sm:py-20" />
      <ExtraBlocks page={page} />
    </>
  );
}
