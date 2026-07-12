import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { Container, SectionTitle } from "@/components/public/container";
import { Breadcrumbs } from "@/components/public/breadcrumbs";
import { Reveal } from "@/components/public/reveal";
import { LocalCard } from "@/components/public/cards";
import { getPublishedLocales, getCategories } from "@/lib/queries";
import { pageMetadata } from "@/lib/page-metadata";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("shop-more", "/shop-more");
}

export default async function ShopMorePage() {
  const [locales, categories] = await Promise.all([
    getPublishedLocales({ group: "shop-more" }),
    getCategories(),
  ]);
  const shopCategories = categories.filter((c) => c.group === "shop-more");

  return (
    <>
      <section className="relative flex min-h-[62vh] flex-col justify-end overflow-hidden bg-palm-950">
        <Image
          src="/images/galeria/dsc1837-scaled.webp"
          alt="Desfile de moda en Palmas Mall"
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-palm-950/90 via-palm-950/30 to-palm-950/30" />
        <Container className="relative pb-12 pt-24 sm:pb-16">
          <Breadcrumbs items={[{ name: "Shop & More", path: "/shop-more" }]} />
          <h1 className="mt-4 max-w-2xl font-display text-[2.3rem] font-bold leading-[1.06] tracking-[-0.02em] text-white sm:text-6xl">
            Donde la moda cobra vida
          </h1>
          <p className="mt-4 max-w-[52ch] text-base leading-relaxed text-white/85 sm:text-lg">
            Boutiques exclusivas, concept stores y servicios seleccionados para
            una experiencia de compra única.
          </p>
        </Container>
      </section>

      <Container className="py-14 sm:py-20">
        <Reveal>
          <div className="max-w-3xl">
            <h2 className="font-display text-[1.7rem] font-bold leading-[1.15] tracking-[-0.02em] text-palm-950 sm:text-4xl">
              Marcas que crean tendencias
            </h2>
            <p className="mt-5 max-w-[62ch] text-[15px] leading-relaxed text-mist-700 sm:text-base">
              Explora tendencias globales en boutiques exclusivas y concept
              stores seleccionadas. Bienvenido a un destino donde cada elección
              de moda cuenta una historia personal, y donde también encuentras
              servicios que te simplifican el día.
            </p>
          </div>
        </Reveal>

        <div className="mt-10 flex flex-wrap gap-2">
          {shopCategories.map((c) => (
            <Link
              key={c.id}
              href={`/locales?categoria=${c.slug}`}
              className="pressable rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-palm-800 shadow-card transition-colors hover:bg-palm-50"
            >
              {c.name}
            </Link>
          ))}
        </div>
      </Container>

      <section className="bg-white py-14 sm:py-20">
        <Container>
          <div className="mb-8 flex items-end justify-between gap-4 sm:mb-12">
            <SectionTitle title="Tiendas y servicios" className="mb-0 sm:mb-0" />
            <Link
              href="/locales?grupo=shop-more"
              className="hidden shrink-0 items-center gap-1.5 font-semibold text-palm-700 transition-colors hover:text-palm-900 sm:inline-flex"
            >
              Ver todos <ArrowRight size={16} weight="bold" />
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
            {locales.map((local) => (
              <LocalCard key={local.id} local={local} />
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
