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
  return pageMetadata("food-drinks", "/food-drinks");
}

export default async function FoodDrinksPage() {
  const [locales, categories] = await Promise.all([
    getPublishedLocales({ group: "food-drinks" }),
    getCategories(),
  ]);
  const foodCategories = categories.filter((c) => c.group === "food-drinks");

  return (
    <>
      {/* Hero gastronómico */}
      <section className="relative flex min-h-[62vh] flex-col justify-end overflow-hidden bg-palm-950">
        <Image
          src="/images/galeria/20241229_020127780_ios-scaled.webp"
          alt="Food Hall de Palmas Mall iluminado en la noche"
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-palm-950/90 via-palm-950/30 to-palm-950/30" />
        <Container className="relative pb-12 pt-24 sm:pb-16">
          <Breadcrumbs items={[{ name: "Food & Drinks", path: "/food-drinks" }]} />
          <h1 className="mt-4 max-w-2xl font-display text-[2.3rem] font-bold leading-[1.06] tracking-[-0.02em] text-white sm:text-6xl">
            El mejor Food Hall de Cali
          </h1>
          <p className="mt-4 max-w-[52ch] text-base leading-relaxed text-white/85 sm:text-lg">
            Restaurantes seleccionados, servicio a la mesa y una arquitectura a
            cielo abierto hecha para el slow food.
          </p>
        </Container>
      </section>

      {/* Concepto */}
      <Container className="py-14 sm:py-20">
        <Reveal>
          <div className="max-w-3xl">
            <h2 className="font-display text-[1.7rem] font-bold leading-[1.15] tracking-[-0.02em] text-palm-950 sm:text-4xl">
              Varias plazas, todas las cocinas, una sola mesa
            </h2>
            <div className="mt-5 space-y-4 text-[15px] leading-relaxed text-mist-700 sm:text-base">
              <p>
                Palmas Mall® Cali ofrece un Food Hall único en el país: distintas
                plazas se unen y articulan ofreciendo un mix de restaurantes
                seleccionados con diversas corrientes gastronómicas, todo{" "}
                <strong className="text-palm-950">a la mesa</strong>.
              </p>
              <p>
                Su arquitectura de cielo abierto, envuelta en vegetación y
                creativamente decorada, es el lugar perfecto para disfrutar la
                corriente slow food: a tu mesa llegan los platos de uno o de
                todos los restaurantes, atendidos por sus propios meseros.
              </p>
            </div>
          </div>
        </Reveal>

        {/* Categorías gastronómicas */}
        <div className="mt-10 flex flex-wrap gap-2">
          {foodCategories.map((c) => (
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

      {/* Restaurantes */}
      <section className="bg-white py-14 sm:py-20">
        <Container>
          <div className="mb-8 flex items-end justify-between gap-4 sm:mb-12">
            <SectionTitle title="Restaurantes y bares" className="mb-0 sm:mb-0" />
            <Link
              href="/locales?grupo=food-drinks"
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
