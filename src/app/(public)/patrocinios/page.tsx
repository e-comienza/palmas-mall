import type { Metadata } from "next";
import Image from "next/image";
import {
  Storefront,
  Megaphone,
  CalendarStar,
  ChartLineUp,
} from "@phosphor-icons/react/dist/ssr";
import { PageHeader } from "@/components/public/page-header";
import { Container, SectionTitle } from "@/components/public/container";
import { Reveal } from "@/components/public/reveal";
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
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <Reveal>
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
              <Image
                src="/images/galeria/dsc1563-scaled.webp"
                alt="Feria de marcas en Palmas Mall"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <div>
              <h2 className="font-display text-[1.7rem] font-bold leading-[1.15] tracking-[-0.02em] text-palm-950 sm:text-4xl">
                Tu marca, en el corazón de Ciudad Jardín
              </h2>
              <p className="mt-5 text-[15px] leading-relaxed text-mist-700 sm:text-base">
                Palmas Mall reúne a los mejores exponentes gastronómicos y de
                estilo de vida en una arquitectura premiada, junto a las zonas
                residenciales más exclusivas de Cali. Si buscas visibilidad,
                tráfico calificado y un entorno premium para tu marca, este es
                el lugar.
              </p>
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
            whatsapp={settings.whatsapp}
          />
        </Container>
      </section>
      <PageFaqs faqs={page?.faqs} className="bg-white py-14 sm:py-20" />
      <ExtraBlocks page={page} />
    </>
  );
}
