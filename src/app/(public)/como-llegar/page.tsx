import type { Metadata } from "next";
import Image from "next/image";
import { Car, Taxi, Bus, Clock, MapPin, PawPrint } from "@phosphor-icons/react/dist/ssr";
import { PageHeader } from "@/components/public/page-header";
import { Container } from "@/components/public/container";
import { FaqAccordion } from "@/components/public/faq-section";
import { getSedes, getPage } from "@/lib/queries";
import { pageMetadata } from "@/lib/page-metadata";
import { faqJsonLd, JsonLdScript } from "@/lib/jsonld";
import { heroData } from "@/lib/blocks";
import { webPageJsonLd } from "@/lib/jsonld";
import { ExtraBlocks } from "@/components/public/block-renderer";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("como-llegar", "/como-llegar");
}

const MEDIOS = [
  {
    icon: Car,
    title: "En carro o moto",
    text: "Contamos con parqueadero dentro del mall. Usa Waze o Google Maps para la ruta más rápida.",
  },
  {
    icon: Taxi,
    title: "En taxi o apps",
    text: "Indica “Palmas Mall” como destino: todos los conductores de la ciudad lo conocen.",
  },
  {
    icon: Bus,
    title: "En transporte público",
    text: "Llega por las rutas que cubren la Carrera 105 y el sector de Ciudad Jardín, al sur de Cali.",
  },
  {
    icon: PawPrint,
    title: "Con tu mascota",
    text: "Somos petfriendly: tu mascota es bienvenida en los espacios abiertos del mall.",
  },
];

export default async function ComoLlegarPage() {
  const [sedes, page] = await Promise.all([getSedes(), getPage("como-llegar")]);
  const hero = heroData(page);

  return (
    <>
      <JsonLdScript
        data={webPageJsonLd({
          path: "/como-llegar",
          name: hero.heading || "Cómo llegar",
          description: page?.seoDescription,
        })}
      />
      {page?.faqs.length ? <JsonLdScript data={faqJsonLd(page.faqs)} /> : null}
      <PageHeader
        title={hero.heading || "Cómo llegar"}
        intro={hero.subheading || "Estamos en el corazón de la Milla de Oro, Ciudad Jardín. Abre la navegación y ven a vivir tus mejores momentos."}
        crumbs={[{ name: "Cómo llegar", path: "/como-llegar" }]}
      />

      <Container className="py-10 sm:py-14">
        {/* Sede + fachada */}
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="relative order-last min-h-[240px] overflow-hidden rounded-2xl lg:order-first">
            <Image
              src="/images/fachada-palmas.webp"
              alt="Fachada de Palmas Mall sobre la Carrera 105 en Ciudad Jardín, Cali"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          {sedes.map((sede) => (
            <div key={sede.id} className="rounded-2xl bg-white p-6 shadow-card sm:p-8">
              <h2 className="font-display text-2xl font-bold tracking-[-0.02em] text-palm-950">
                {sede.name}
              </h2>
              <ul className="mt-5 space-y-3.5 text-[15px] text-mist-700">
                <li className="flex items-start gap-3">
                  <MapPin size={20} weight="bold" className="mt-0.5 shrink-0 text-palm-700" />
                  <span>{sede.address}</span>
                </li>
                {sede.openingHours ? (
                  <li className="flex items-start gap-3">
                    <Clock size={20} weight="bold" className="mt-0.5 shrink-0 text-palm-700" />
                    <span>{sede.openingHours}</span>
                  </li>
                ) : null}
              </ul>
              <div className="mt-6 flex flex-wrap gap-3">
                {sede.wazeUrl ? (
                  <a
                    href={sede.wazeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="pressable inline-flex h-11 items-center rounded-full bg-palm-700 px-6 text-sm font-semibold text-white transition-colors hover:bg-palm-800"
                  >
                    Abrir en Waze
                  </a>
                ) : null}
                {sede.mapsUrl ? (
                  <a
                    href={sede.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="pressable inline-flex h-11 items-center rounded-full border border-palm-700/30 bg-white px-6 text-sm font-semibold text-palm-800 transition-colors hover:bg-palm-50"
                  >
                    Google Maps
                  </a>
                ) : null}
                {sede.whatsapp ? (
                  <a
                    href={`https://wa.me/${sede.whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="pressable inline-flex h-11 items-center rounded-full border border-palm-700/30 bg-white px-6 text-sm font-semibold text-palm-800 transition-colors hover:bg-palm-50"
                  >
                    WhatsApp
                  </a>
                ) : null}
              </div>
            </div>
          ))}
        </div>

        {/* Medios de transporte */}
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {MEDIOS.map((m) => (
            <div key={m.title} className="rounded-2xl bg-white p-6 shadow-card">
              <span className="flex size-11 items-center justify-center rounded-full bg-palm-100 text-palm-700">
                <m.icon size={22} weight="bold" />
              </span>
              <h3 className="mt-4 font-display text-[16px] font-bold text-palm-950">{m.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-mist-600">{m.text}</p>
            </div>
          ))}
        </div>

        {/* FAQ de la página */}
        {page?.faqs.length ? (
          <div className="mx-auto mt-14 max-w-3xl">
            <h2 className="mb-4 font-display text-xl font-bold text-palm-950">
              Preguntas frecuentes
            </h2>
            <FaqAccordion
              faqs={page.faqs.map((f) => ({ id: f.id, question: f.question, answer: f.answer }))}
            />
          </div>
        ) : null}
      </Container>
      <ExtraBlocks page={page} consumed={["HERO", "FAQ"]} />
    </>
  );
}
