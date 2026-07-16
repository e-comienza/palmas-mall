import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, MagnifyingGlassPlus } from "@phosphor-icons/react/dist/ssr";
import { PageHeader } from "@/components/public/page-header";
import { Container } from "@/components/public/container";
import { PlanoViewer } from "@/components/public/plano-viewer";
import { getPage } from "@/lib/queries";
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
  const page = await getPage("plano-del-mall");
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

        <div className="mt-10 flex justify-center">
          <Link
            href="/directorio"
            className="pressable inline-flex h-12 items-center gap-2 rounded-full bg-palm-700 px-7 text-sm font-semibold text-white transition-colors hover:bg-palm-800"
          >
            Ver el directorio completo <ArrowRight size={16} weight="bold" />
          </Link>
        </div>
      </Container>
      <PageFaqs faqs={page?.faqs} className="bg-white py-14 sm:py-20" />
      <ExtraBlocks page={page} />
    </>
  );
}
