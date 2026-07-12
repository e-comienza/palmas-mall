import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { Container } from "@/components/public/container";
import { Breadcrumbs } from "@/components/public/breadcrumbs";
import { Reveal } from "@/components/public/reveal";
import { pageMetadata } from "@/lib/page-metadata";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("galardones", "/galardones");
}

const AWARDS = [
  {
    img: "/brand/G1.png",
    alt: "Premio FIABCI a la excelencia inmobiliaria",
    name: "FIABCI · Premio a la Excelencia Inmobiliaria",
    org: "Federación Internacional de Profesionales Inmobiliarios",
    text: "Palmas Mall® Cali recibió el premio nacional en la categoría comercio, otorgado por FIABCI, que reconoce los proyectos inmobiliarios más destacados por su concepción, diseño y aporte a la ciudad.",
  },
  {
    img: "/brand/G2.png",
    alt: "ICSC Silver Award 2009 for Development and Design Excellence",
    name: "ICSC · Silver Award 2009",
    org: "International Council of Shopping Centers",
    text: "El ICSC, la agremiación de centros comerciales más importante y grande del mundo, otorgó a Palmas Mall el Silver Award 2009 en la categoría Innovative Design and Development of a New Project, por la excelencia en diseño y desarrollo.",
  },
];

export default function GalardonesPage() {
  return (
    <>
      <div className="bg-palm-950 pb-14 pt-12 text-white sm:pb-20 sm:pt-16">
        <Container>
          <Breadcrumbs items={[{ name: "Galardones", path: "/galardones" }]} />
          <h1 className="mt-4 max-w-2xl font-display text-[2.1rem] font-bold leading-[1.08] tracking-[-0.02em] sm:text-5xl">
            Un diseño reconocido en el mundo
          </h1>
          <p className="mt-4 max-w-[58ch] text-[15px] leading-relaxed text-mist-300 sm:text-lg">
            La arquitectura y el concepto de Palmas Mall han sido premiados por
            las organizaciones más importantes del sector inmobiliario y de
            centros comerciales a nivel internacional.
          </p>
        </Container>
      </div>

      <Container className="py-14 sm:py-20">
        <div className="grid gap-6 lg:grid-cols-2">
          {AWARDS.map((award, i) => (
            <Reveal key={award.name} delay={i * 0.08}>
              <article className="flex h-full flex-col rounded-2xl bg-white p-7 shadow-card sm:p-9">
                <Image
                  src={award.img}
                  alt={award.alt}
                  width={140}
                  height={140}
                  className="h-24 w-auto self-start"
                />
                <h2 className="mt-6 font-display text-xl font-bold leading-snug text-palm-950 sm:text-2xl">
                  {award.name}
                </h2>
                <p className="mt-1 text-sm font-semibold text-palm-600">{award.org}</p>
                <p className="mt-4 text-[15px] leading-relaxed text-mist-600">{award.text}</p>
              </article>
            </Reveal>
          ))}
        </div>

        <div className="mt-14 rounded-2xl bg-palm-100/60 p-8 text-center sm:p-12">
          <h2 className="font-display text-2xl font-bold tracking-[-0.02em] text-palm-950 sm:text-3xl">
            Ven a conocer la arquitectura premiada
          </h2>
          <p className="mx-auto mt-3 max-w-[52ch] text-[15px] leading-relaxed text-mist-700">
            Nada como recorrer los jardines, plazoletas y terrazas que hicieron
            de Palmas Mall un referente del diseño comercial en América Latina.
          </p>
          <Link
            href="/como-llegar"
            className="pressable mt-6 inline-flex h-12 items-center gap-2 rounded-full bg-palm-700 px-7 text-base font-semibold text-white transition-colors hover:bg-palm-800"
          >
            Cómo llegar <ArrowRight size={17} weight="bold" />
          </Link>
        </div>
      </Container>
    </>
  );
}
