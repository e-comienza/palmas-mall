import type { Metadata } from "next";
import {
  Storefront,
  Megaphone,
  CalendarStar,
  ChartLineUp,
  FilePdf,
  WhatsappLogo,
} from "@phosphor-icons/react/dist/ssr";
import { PageHeader } from "@/components/public/page-header";
import { Container, SectionTitle } from "@/components/public/container";
import { Reveal } from "@/components/public/reveal";
import { Media } from "@/components/public/media";
import { ContactForm } from "@/components/public/contact-form";
import { getSiteSettings } from "@/lib/settings";
import { getPage } from "@/lib/queries";
import { pageMetadata } from "@/lib/page-metadata";
import { heroData } from "@/lib/blocks";
import { ExtraBlocks } from "@/components/public/block-renderer";
import { PageFaqs } from "@/components/public/page-faqs";
import { webPageJsonLd, JsonLdScript } from "@/lib/jsonld";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("patrocinios", "/patrocinios");
}

const OPCIONES = [
  {
    icon: Storefront,
    title: "Locales comerciales",
    text: "Espacios diseñados para marcas gastronómicas, de moda y servicios, en el mall con el público más exigente del sur de Cali.",
  },
  {
    icon: Megaphone,
    title: "Patrocinios y activaciones",
    text: "Activa tu marca en ferias, eventos y temporadas especiales con alto flujo de visitantes.",
  },
  {
    icon: CalendarStar,
    title: "Eventos de marca",
    text: "Produce tu evento en nuestras plazoletas y terrazas: lanzamientos, showrooms y experiencias.",
  },
  {
    icon: ChartLineUp,
    title: "Publicidad en el mall",
    text: "Pantallas, espacios físicos y presencia digital frente a una audiencia premium y familiar.",
  },
];

export default async function PatrociniosPage() {
  const [settings, page] = await Promise.all([getSiteSettings(), getPage("patrocinios")]);
  const hero = heroData(page);

  return (
    <>
      <JsonLdScript
        data={webPageJsonLd({
          path: "/patrocinios",
          name: hero.heading || "Be Our Sponsors",
          description: page?.seoDescription,
        })}
      />
      <PageHeader
        title={hero.heading || "Be Our Sponsors"}
        intro={hero.subheading || "La mejor ubicación para tu marca: haz parte del Lifestyle Mall de Cali."}
        crumbs={[{ name: "Be Our Sponsors", path: "/patrocinios" }]}
      />

      <Container className="py-14 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,340px)_1fr] lg:items-center">
          {settings.sponsorVideoUrl ? (
            <Reveal>
              <div className="relative mx-auto aspect-[9/16] w-full max-w-[340px] overflow-hidden rounded-2xl bg-palm-950 shadow-card">
                <Media
                  src={settings.sponsorVideoUrl}
                  alt="Brochure de Palmas Mall para marcas"
                  fill
                  mode="inline"
                  className="object-cover"
                />
              </div>
            </Reveal>
          ) : null}
          <Reveal delay={0.08}>
            <div>
              <h2 className="text-balance font-display text-[1.7rem] font-bold leading-[1.15] tracking-[-0.02em] text-palm-950 sm:text-4xl">
                Tu marca, en el corazón de la Milla de Oro
              </h2>
              <p className="mt-5 text-[15px] leading-relaxed text-mist-700 sm:text-base">
                Palmas Mall reúne a los mejores exponentes gastronómicos y de
                estilo de vida en una arquitectura premiada, junto a las zonas
                residenciales más exclusivas de Cali. Si buscas visibilidad,
                tráfico calificado y un entorno premium para tu marca, este es
                el lugar.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                {settings.sponsorPdfUrl ? (
                  <a
                    href={settings.sponsorPdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="pressable inline-flex h-12 items-center gap-2 rounded-full bg-palm-700 px-7 text-sm font-semibold text-white transition-colors hover:bg-palm-800"
                  >
                    <FilePdf size={20} weight="bold" /> Descargar brochure (PDF)
                  </a>
                ) : null}
                <a
                  href={`https://wa.me/${settings.sponsorWhatsapp}?text=${encodeURIComponent(
                    "Hola, quiero información para ser sponsor / tener presencia de marca en Palmas Mall.",
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pressable inline-flex h-12 items-center gap-2 rounded-full border border-palm-700/30 bg-white px-7 text-sm font-semibold text-palm-800 transition-colors hover:bg-palm-50"
                >
                  <WhatsappLogo size={20} weight="fill" /> Hablar por WhatsApp
                </a>
              </div>
            </div>
          </Reveal>
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {OPCIONES.map((op, i) => (
            <Reveal key={op.title} delay={i * 0.05}>
              <div className="h-full rounded-2xl bg-white p-6 shadow-card">
                <span className="flex size-11 items-center justify-center rounded-full bg-palm-100 text-palm-700">
                  <op.icon size={22} weight="bold" />
                </span>
                <h3 className="mt-4 font-display text-[17px] font-bold text-palm-950">{op.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-mist-600">{op.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>

      <section className="bg-white py-14 sm:py-20">
        <Container className="max-w-3xl">
          <SectionTitle
            title="Hablemos de tu marca"
            intro="Déjanos tus datos y nuestro equipo comercial te contactará."
            align="center"
          />
          <ContactForm
            subjectOptions={["Local comercial", "Patrocinio", "Activación de marca", "Publicidad"]}
            whatsapp={settings.sponsorWhatsapp}
          />
        </Container>
      </section>
      <PageFaqs faqs={page?.faqs} className="bg-white py-14 sm:py-20" />
      <ExtraBlocks page={page} />
    </>
  );
}
