import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  Tree,
  ForkKnife,
  PawPrint,
  Laptop,
  UsersThree,
  Storefront,
  ArrowRight,
} from "@phosphor-icons/react/dist/ssr";
import { PageHeader } from "@/components/public/page-header";
import { Container, SectionTitle } from "@/components/public/container";
import { Reveal } from "@/components/public/reveal";
import { FaqAccordion } from "@/components/public/faq-section";
import { getPage, getGlobalFaqs } from "@/lib/queries";
import { pageMetadata } from "@/lib/page-metadata";
import { faqJsonLd, JsonLdScript } from "@/lib/jsonld";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("conoce-palmas-mall", "/conoce-palmas-mall");
}

const EXPERIENCIAS = [
  {
    icon: ForkKnife,
    title: "Food Hall único en el país",
    text: "Distintas plazas gastronómicas se articulan con restaurantes seleccionados y servicio a la mesa, ideales para el slow food.",
  },
  {
    icon: Storefront,
    title: "Moda y marcas con historia",
    text: "Boutiques exclusivas y concept stores donde cada elección cuenta una historia personal.",
  },
  {
    icon: Tree,
    title: "Arquitectura a cielo abierto",
    text: "Espacios envueltos en vegetación tropical, diseñados para quedarse: terrazas, jardines y plazoletas.",
  },
  {
    icon: PawPrint,
    title: "Petfriendly de verdad",
    text: "Tu mascota es bienvenida en los corredores, jardines y terrazas del mall.",
  },
  {
    icon: Laptop,
    title: "Coworking con aire libre",
    text: "Zonas para trabajar o reunirte rodeado de verde, con la mejor oferta de café cerca.",
  },
  {
    icon: UsersThree,
    title: "Planes para toda la familia",
    text: "PlayZone para los niños, eventos cada semana y espacios pensados para compartir.",
  },
];

export default async function ConocePage() {
  const [page, faqs] = await Promise.all([getPage("conoce-palmas-mall"), getGlobalFaqs()]);

  return (
    <>
      {faqs.length ? <JsonLdScript data={faqJsonLd(faqs)} /> : null}
      <PageHeader
        title="Conoce Palmas Mall"
        intro="El primer Lifestyle Mall de Colombia: un lugar diseñado para vivir la ciudad de otra manera."
        crumbs={[{ name: "Conoce Palmas Mall", path: "/conoce-palmas-mall" }]}
      />

      {/* Historia / concepto */}
      <Container className="py-14 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <Reveal>
            <div>
              <h2 className="font-display text-[1.75rem] font-bold leading-[1.12] tracking-[-0.02em] text-palm-950 sm:text-4xl">
                El Lifestyle Mall que cambió la forma de vivir la ciudad
              </h2>
              <div className="mt-5 space-y-4 text-[15px] leading-relaxed text-mist-700 sm:text-base">
                <p>
                  Palmas Mall® trajo a Colombia el concepto de arquitectura
                  comercial conocido como <strong className="text-palm-950">Lifestyle Mall</strong>:
                  un centro comercial que se implanta cerca de las mejores zonas
                  residenciales de la ciudad para atender y sorprender a sus
                  exigentes residentes.
                </p>
                <p>
                  Representa un estilo de vida: te sorprende con su hermosa
                  arquitectura y te atrapa con una filosofía construida en torno
                  a las experiencias. Todo, para que disfrutes lo que promete
                  nuestro slogan: <em>tus mejores momentos</em>.
                </p>
              </div>
              <Link
                href="/galardones"
                className="mt-6 inline-flex items-center gap-1.5 font-semibold text-palm-700 transition-colors hover:text-palm-900"
              >
                Un diseño premiado internacionalmente <ArrowRight size={16} weight="bold" />
              </Link>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="grid grid-cols-2 gap-3">
              <div className="relative aspect-[3/4] overflow-hidden rounded-2xl">
                <Image
                  src="/images/galeria/shopping-cali2.webp"
                  alt="Arquitectura a cielo abierto de Palmas Mall"
                  fill
                  sizes="(max-width: 1024px) 50vw, 300px"
                  className="object-cover"
                />
              </div>
              <div className="relative mt-8 aspect-[3/4] overflow-hidden rounded-2xl">
                <Image
                  src="/images/galeria/20250119_193238112_ios-scaled.webp"
                  alt="Atardecer en Palmas Mall"
                  fill
                  sizes="(max-width: 1024px) 50vw, 300px"
                  className="object-cover"
                />
              </div>
            </div>
          </Reveal>
        </div>
      </Container>

      {/* Experiencias */}
      <section className="bg-white py-14 sm:py-20">
        <Container>
          <SectionTitle
            title="Un mall diseñado alrededor de experiencias"
            intro="Seis razones por las que Palmas Mall es mucho más que un centro comercial."
          />
          <div className="grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
            {EXPERIENCIAS.map((exp, i) => (
              <Reveal key={exp.title} delay={i * 0.05}>
                <div className="flex gap-4">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-palm-100 text-palm-700">
                    <exp.icon size={22} weight="bold" />
                  </span>
                  <div>
                    <h3 className="font-display text-[17px] font-bold text-palm-950">{exp.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-mist-600">{exp.text}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* CTA + FAQ */}
      <Container className="py-14 sm:py-20">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.3fr]">
          <div>
            <h2 className="font-display text-2xl font-bold tracking-[-0.02em] text-palm-950 sm:text-3xl">
              Ven a conocerlo en persona
            </h2>
            <p className="mt-3 max-w-[46ch] text-[15px] leading-relaxed text-mist-600">
              Estamos en Ciudad Jardín, al sur de Cali. Te esperamos todos los
              días con parqueadero, espacios petfriendly y el mejor plan.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/como-llegar"
                className="pressable inline-flex h-11 items-center rounded-full bg-palm-700 px-6 text-sm font-semibold text-white transition-colors hover:bg-palm-800"
              >
                Cómo llegar
              </Link>
              <Link
                href="/locales"
                className="pressable inline-flex h-11 items-center rounded-full border border-palm-700/30 bg-white px-6 text-sm font-semibold text-palm-800 transition-colors hover:bg-palm-50"
              >
                Explorar locales
              </Link>
            </div>
          </div>
          <div>
            <h2 className="mb-4 font-display text-xl font-bold text-palm-950">
              Preguntas frecuentes
            </h2>
            <FaqAccordion
              faqs={(page?.faqs.length ? page.faqs : faqs).map((f) => ({
                id: f.id,
                question: f.question,
                answer: f.answer,
              }))}
            />
          </div>
        </div>
      </Container>
    </>
  );
}
