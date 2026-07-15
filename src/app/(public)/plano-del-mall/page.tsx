import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, MagnifyingGlassPlus } from "@phosphor-icons/react/dist/ssr";
import { PageHeader } from "@/components/public/page-header";
import { Container } from "@/components/public/container";
import { PlanoViewer } from "@/components/public/plano-viewer";
import { getPublishedLocales, getPage } from "@/lib/queries";
import { heroData } from "@/lib/blocks";
import { ExtraBlocks } from "@/components/public/block-renderer";
import { PageFaqs } from "@/components/public/page-faqs";
import { webPageJsonLd, JsonLdScript } from "@/lib/jsonld";
import { pageMetadata } from "@/lib/page-metadata";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("plano-del-mall", "/plano-del-mall");
}

export default async function PlanoPage() {
  const [locales, page] = await Promise.all([
    getPublishedLocales(),
    getPage("plano-del-mall"),
  ]);
  const hero = heroData(page);

  return (
    <>
      <JsonLdScript
        data={webPageJsonLd({
          path: "/plano-del-mall",
          name: hero.heading || "Plano del Mall",
          description: page?.seoDescription,
        })}
      />
      <PageHeader
        title={hero.heading || "Plano del Mall"}
        intro={hero.subheading || "Ubica restaurantes, tiendas y servicios dentro de Palmas Mall."}
        crumbs={[{ name: "Plano del Mall", path: "/plano-del-mall" }]}
      />
      <Container className="py-10 sm:py-14">
        <div className="rounded-2xl bg-white p-3 shadow-card sm:p-4">
          <PlanoViewer src="/images/plano-del-mall.webp" alt="Plano general de Palmas Mall Cali con la ubicación de todos los locales" />
          <p className="flex items-center justify-center gap-1.5 px-4 pb-2 pt-3 text-center text-[13px] text-mist-500">
            <MagnifyingGlassPlus size={15} /> Pellizca o usa la rueda del mouse para acercar el plano
          </p>
        </div>

        <div className="mt-12">
          <h2 className="font-display text-2xl font-bold tracking-[-0.02em] text-palm-950">
            Locales por número
          </h2>
          <p className="mt-2 text-sm text-mist-600">
            Los locales con número asignado aparecen aquí; el resto puedes encontrarlos en el directorio.
          </p>
          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {locales
              .filter((l) => l.unitNumber)
              .map((l) => (
                <Link
                  key={l.id}
                  href={`/locales/${l.slug}`}
                  className="pressable flex items-center gap-4 rounded-2xl bg-white p-4 shadow-card transition-shadow hover:shadow-card-hover"
                >
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-palm-100 font-display text-sm font-bold text-palm-800">
                    {l.unitNumber}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-palm-950">{l.name}</p>
                    <p className="text-[13px] text-mist-500">{l.category?.name}</p>
                  </div>
                </Link>
              ))}
          </div>
          <Link
            href="/locales"
            className="mt-8 inline-flex items-center gap-1.5 font-semibold text-palm-700 transition-colors hover:text-palm-900"
          >
            Ver directorio completo <ArrowRight size={16} weight="bold" />
          </Link>
        </div>
      </Container>
      <PageFaqs faqs={page?.faqs} className="bg-white py-14 sm:py-20" />
      <ExtraBlocks page={page} />
    </>
  );
}
