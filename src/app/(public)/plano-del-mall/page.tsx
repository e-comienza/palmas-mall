import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, MagnifyingGlassPlus, WhatsappLogo } from "@phosphor-icons/react/dist/ssr";
import { PageHeader } from "@/components/public/page-header";
import { Container } from "@/components/public/container";
import { PlanoViewer } from "@/components/public/plano-viewer";
import { getPage } from "@/lib/queries";
import { getSiteSettings } from "@/lib/settings";
import { planoImageSrc } from "@/lib/media";
import { withHeart } from "@/lib/heart-text";
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
  const [page, settings] = await Promise.all([getPage("plano-del-mall"), getSiteSettings()]);
  const hero = heroData(page);
  const planoSrc = planoImageSrc(settings.planoImageUrl);

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
        imageUrl={hero.imageUrl}
      />
      <Container className="py-10 sm:py-14">
        <div className="rounded-2xl bg-white p-3 shadow-card sm:p-4">
          <PlanoViewer src={planoSrc} alt="Plano general de Palmas Mall Cali con la ubicación de todos los locales" />
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

        {/* Averiguar por disponibilidad de locales */}
        <div className="mt-10 overflow-hidden rounded-2xl bg-palm-950 px-6 py-8 text-white sm:px-10 sm:py-10">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-xl">
              <h2 className="font-display text-xl font-bold tracking-[-0.01em] sm:text-2xl">¿Quieres tu marca en Palmas Mall?</h2>
              <p className="mt-2 text-[15px] leading-relaxed text-mist-200">
                {withHeart(
                  "Escríbenos por WhatsApp para conocer la disponibilidad de locales y llevar tu negocio al corazón de la Milla de Oro.",
                )}
              </p>
            </div>
            <a
              href={`https://wa.me/${settings.rentalWhatsapp}?text=${encodeURIComponent(
                "Hola, quiero información sobre la disponibilidad de locales en Palmas Mall.",
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="pressable inline-flex h-12 shrink-0 items-center gap-2 self-start rounded-full bg-white px-7 text-sm font-semibold text-palm-900 transition-colors hover:bg-mist-100 sm:self-auto"
            >
              <WhatsappLogo size={20} weight="fill" /> Averiguar por un local
            </a>
          </div>
        </div>
      </Container>
      <PageFaqs faqs={page?.faqs} className="bg-white py-14 sm:py-20" />
      <ExtraBlocks page={page} />
    </>
  );
}
