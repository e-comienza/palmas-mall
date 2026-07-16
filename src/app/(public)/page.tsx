import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  ForkKnife,
  Storefront,
  CalendarStar,
  PawPrint,
  Laptop,
  ArrowRight,
  MapPin,
  Clock,
} from "@phosphor-icons/react/dist/ssr";
import { Container, SectionTitle } from "@/components/public/container";
import { Reveal, RevealStagger } from "@/components/public/reveal";
import { Media } from "@/components/public/media";
import { LocalCard, EventCard, PostCard } from "@/components/public/cards";
import { FaqAccordion } from "@/components/public/faq-section";
import {
  getPage,
  getFeaturedLocales,
  getUpcomingEvents,
  getPublishedPosts,
  getHomeGallery,
  getGlobalFaqs,
  getMainSede,
  getSedes,
} from "@/lib/queries";
import { getSiteSettings } from "@/lib/settings";
import { heroData, richTextData } from "@/lib/blocks";
import { ExtraBlocks } from "@/components/public/block-renderer";
import {
  organizationJsonLd,
  shoppingCenterJsonLd,
  websiteJsonLd,
  itemListJsonLd,
  faqJsonLd,
  JsonLdScript,
} from "@/lib/jsonld";
import { siteUrl } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage("home");
  const settings = await getSiteSettings();
  return {
    title: { absolute: page?.seoTitle || settings.seoDefaultTitle },
    description: page?.seoDescription || settings.seoDefaultDesc,
    alternates: { canonical: siteUrl("/") },
    openGraph: {
      title: page?.seoTitle || settings.seoDefaultTitle,
      description: page?.seoDescription || settings.seoDefaultDesc,
      url: siteUrl("/"),
      images: [{ url: page?.ogImageUrl || settings.ogImageUrl }],
    },
  };
}

const PILLARS = [
  { icon: ForkKnife, label: "Food Hall & gastronomía", href: "/food-drinks" },
  { icon: Storefront, label: "Tiendas y servicios", href: "/shop-more" },
  { icon: CalendarStar, label: "Eventos y experiencias", href: "/eventos" },
  { icon: PawPrint, label: "Petfriendly", href: "/conoce-palmas-mall" },
  { icon: Laptop, label: "Coworking", href: "/conoce-palmas-mall" },
];

const QUE_HACER = [
  {
    title: "Comer",
    text: "El mejor Food Hall de Cali, a la mesa",
    href: "/food-drinks",
    img: "/images/galeria/20241229_020127780_ios-scaled.webp",
    alt: "Food Hall de Palmas Mall iluminado en la noche",
    big: true,
  },
  {
    title: "Comprar",
    text: "Boutiques y marcas exclusivas",
    href: "/shop-more",
    img: "/images/galeria/dsc1837-scaled.webp",
    alt: "Desfile de moda en Palmas Mall",
  },
  {
    title: "Vivir eventos",
    text: "Ferias, música y planes cada semana",
    href: "/eventos",
    img: "/images/galeria/dsc2143-scaled.webp",
    alt: "Evento con público en Palmas Mall",
  },
  {
    title: "Venir con tu mascota",
    text: "Espacios abiertos y petfriendly",
    href: "/conoce-palmas-mall",
    img: "/images/galeria/dsc2168-scaled.webp",
    alt: "Terrazas al aire libre de Palmas Mall",
  },
  {
    title: "Trabajar o reunirte",
    text: "Coworking rodeado de vegetación",
    href: "/conoce-palmas-mall",
    img: "/images/galeria/shopping-cali2.webp",
    alt: "Arquitectura a cielo abierto de Palmas Mall",
  },
  {
    title: "Disfrutar en familia",
    text: "PlayZone y actividades para niños",
    href: "/play-zone",
    img: "/images/galeria/dsc1699-1-scaled.webp",
    alt: "Familias disfrutando en Palmas Mall",
    big: true,
  },
];

export default async function HomePage() {
  const [page, settings, locales, events, posts, gallery, faqs, mainSede, sedes] =
    await Promise.all([
      getPage("home"),
      getSiteSettings(),
      getFeaturedLocales(),
      getUpcomingEvents(3),
      getPublishedPosts(3),
      getHomeGallery(),
      getGlobalFaqs(),
      getMainSede(),
      getSedes(),
    ]);

  const hero = heroData(page);
  const intro = richTextData(page);

  return (
    <>
      <JsonLdScript
        data={[
          organizationJsonLd(settings),
          websiteJsonLd(settings),
          shoppingCenterJsonLd(settings, sedes),
          itemListJsonLd({
            path: "/",
            name: "Locales destacados de Palmas Mall",
            items: locales.map((l) => ({
              name: l.name,
              path: `/directorio/${l.slug}`,
              image: l.coverUrl || undefined,
              description: l.shortDescription || undefined,
            })),
          }),
          faqJsonLd(faqs),
        ]}
      />

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative flex min-h-[calc(100dvh-64px)] flex-col justify-end overflow-hidden md:min-h-[calc(100dvh-76px)]">
        <Media
          src={hero.imageUrl || "/images/galeria/20250119_193238112_ios-scaled.webp"}
          alt="Arquitectura a cielo abierto de Palmas Mall al atardecer"
          fill
          mode="background"
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-palm-950/90 via-palm-950/35 to-palm-950/15" />
        <Container className="relative pb-16 pt-24 sm:pb-20">
          <div className="max-w-2xl">
            <h1 data-speakable className="sr-only">
              {hero.heading || "Tus mejores momentos en Palmas Mall"}
            </h1>
            <Image
              src={settings.sloganImageUrl || "/brand/slogan.webp"}
              alt={settings.tagline || "Tus mejores momentos"}
              width={728}
              height={78}
              priority
              aria-hidden
              className="h-auto w-[min(85%,30rem)] brightness-0 invert drop-shadow-[0_2px_10px_rgb(6_33_18/0.35)]"
            />
            <p
              data-speakable
              className="mt-5 max-w-[46ch] text-base leading-relaxed text-white/85 sm:text-lg"
            >
              {hero.subheading ||
                "Gastronomía, compras, eventos y arquitectura a cielo abierto en el Lifestyle Mall de Cali."}
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link
                href={hero.ctaPrimaryUrl || "/directorio"}
                className="pressable inline-flex h-12 items-center rounded-full bg-white px-7 text-base font-semibold text-palm-900 transition-colors hover:bg-mist-100"
              >
                {hero.ctaPrimaryLabel || "Explorar locales"}
              </Link>
              <Link
                href={hero.ctaSecondaryUrl || "/como-llegar"}
                className="pressable inline-flex h-12 items-center gap-2 rounded-full border border-white/40 px-7 text-base font-semibold text-white transition-colors hover:border-white/80 hover:bg-white/10"
              >
                <MapPin size={18} /> {hero.ctaSecondaryLabel || "Cómo llegar"}
              </Link>
              <Link
                href="/eventos"
                className="pressable inline-flex h-12 items-center gap-1.5 px-2 text-base font-semibold text-white/90 transition-colors hover:text-white"
              >
                Ver eventos <ArrowRight size={16} weight="bold" />
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* ── Pilares ──────────────────────────────────────── */}
      <section className="border-b border-mist-200 bg-white">
        <Container>
          <ul className="scrollbar-none -mx-4 flex snap-x gap-2 overflow-x-auto px-4 py-5 sm:mx-0 sm:justify-between sm:gap-4 sm:px-0">
            {PILLARS.map((p) => (
              <li key={p.label} className="snap-start">
                <Link
                  href={p.href}
                  className="pressable flex items-center gap-2.5 whitespace-nowrap rounded-full bg-mist-100 py-2.5 pl-3 pr-5 text-sm font-semibold text-palm-900 transition-colors hover:bg-palm-100"
                >
                  <span className="flex size-8 items-center justify-center rounded-full bg-white text-palm-700 shadow-card">
                    <p.icon size={17} weight="bold" />
                  </span>
                  {p.label}
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* ── Intro editorial ─────────────────────────────── */}
      <section className="py-16 sm:py-24">
        <Container>
          <Reveal>
            <div className="max-w-3xl">
              {settings.sloganImageUrl ? (
                <Image
                  src={settings.sloganImageUrl}
                  alt="Palmas Mall, tus mejores momentos"
                  width={340}
                  height={36}
                  className="mb-6 h-7 w-auto sm:h-8"
                />
              ) : null}
              <h2 className="font-display text-3xl font-bold leading-[1.12] tracking-[-0.02em] text-palm-950 sm:text-[2.6rem]">
                {intro.heading || "Mucho más que un centro comercial"}
              </h2>
              <p className="mt-5 max-w-[62ch] text-base leading-relaxed text-mist-600 sm:text-lg">
                {intro.body ||
                  "Palmas Mall trajo a Colombia el concepto de Lifestyle Mall: arquitectura a cielo abierto, rodeada de vegetación, con el mejor Food Hall de Cali, tiendas exclusivas, coworking, espacios petfriendly y eventos para toda la familia."}
              </p>
              <Link
                href="/conoce-palmas-mall"
                className="mt-6 inline-flex items-center gap-1.5 font-semibold text-palm-700 transition-colors hover:text-palm-900"
              >
                Conoce Palmas Mall <ArrowRight size={16} weight="bold" />
              </Link>
            </div>
          </Reveal>
        </Container>
      </section>

      {/* ── Qué hacer ────────────────────────────────────── */}
      <section className="pb-16 sm:pb-24">
        <Container>
          <SectionTitle
            title="¿Qué hacer en Palmas Mall?"
            intro="Seis maneras de vivir el mall: elige tu plan de hoy."
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {QUE_HACER.map((card, i) => (
              <Reveal
                key={card.title}
                delay={i * 0.04}
                className={card.big ? "lg:col-span-2" : ""}
              >
                <Link
                  href={card.href}
                  className="group relative block h-56 overflow-hidden rounded-2xl sm:h-64"
                >
                  <Image
                    src={card.img}
                    alt={card.alt}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-[1.05]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-palm-950/85 via-palm-950/20 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <h3 className="font-display text-xl font-bold text-white">{card.title}</h3>
                    <p className="mt-0.5 text-sm text-white/80">{card.text}</p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* ── Locales destacados ───────────────────────────── */}
      {locales.length > 0 && (
        <section className="bg-white py-16 sm:py-24">
          <Container>
            <div className="mb-8 flex items-end justify-between gap-4 sm:mb-12">
              <SectionTitle title="Locales destacados" className="mb-0 sm:mb-0" />
              <Link
                href="/directorio"
                className="hidden shrink-0 items-center gap-1.5 font-semibold text-palm-700 transition-colors hover:text-palm-900 sm:inline-flex"
              >
                Ver directorio <ArrowRight size={16} weight="bold" />
              </Link>
            </div>
            <div className="scrollbar-none -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:px-0 lg:grid-cols-4">
              {locales.slice(0, 4).map((local) => (
                <div key={local.id} className="w-[72vw] max-w-[300px] shrink-0 snap-start sm:w-auto sm:max-w-none">
                  <LocalCard local={local} />
                </div>
              ))}
            </div>
            <div className="mt-6 sm:hidden">
              <Link
                href="/directorio"
                className="pressable flex h-12 items-center justify-center rounded-full border border-palm-700/30 bg-white font-semibold text-palm-800"
              >
                Ver directorio completo
              </Link>
            </div>
          </Container>
        </section>
      )}

      {/* ── Eventos + noticias ──────────────────────────── */}
      <section className="py-16 sm:py-24">
        <Container>
          <div className="grid gap-14 lg:grid-cols-2 lg:gap-10">
            <div>
              <SectionTitle title="Próximos eventos" />
              <div className="flex flex-col gap-4">
                {events.length ? (
                  events.map((event) => <EventCard key={event.id} event={event} />)
                ) : (
                  <p className="rounded-2xl border border-dashed border-mist-300 p-6 text-center text-sm text-mist-500">
                    Pronto anunciaremos nuevos eventos. ¡Síguenos en redes!
                  </p>
                )}
              </div>
              <Link
                href="/eventos"
                className="mt-6 inline-flex items-center gap-1.5 font-semibold text-palm-700 transition-colors hover:text-palm-900"
              >
                Ver toda la agenda <ArrowRight size={16} weight="bold" />
              </Link>
            </div>
            <div>
              <SectionTitle title="Noticias del mall" />
              <div className="flex flex-col gap-4">
                {posts.slice(0, 2).map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
              <Link
                href="/blog"
                className="mt-6 inline-flex items-center gap-1.5 font-semibold text-palm-700 transition-colors hover:text-palm-900"
              >
                Ver blog y noticias <ArrowRight size={16} weight="bold" />
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* ── Galería ─────────────────────────────────────── */}
      {gallery.length > 0 && (
        <section className="bg-white py-16 sm:py-24">
          <Container>
            <SectionTitle
              title="Momentos Palmas Mall"
              intro="Ferias, gastronomía, moda y noches que se vuelven recuerdos."
            />
            <RevealStagger
              className="grid grid-cols-2 gap-3 sm:grid-cols-4"
              items={gallery.map((img, i) => (
                <Link
                  key={img.id}
                  href="/momentos-palmas-mall"
                  aria-label={`Ver la galería de momentos: ${img.alt || "Palmas Mall"}`}
                  className={`relative block overflow-hidden rounded-2xl ${
                    i % 4 === 0 || i % 4 === 3 ? "aspect-[3/4]" : "aspect-square"
                  }`}
                >
                  <Media
                    src={img.url}
                    alt={img.alt || "Momentos en Palmas Mall"}
                    fill
                    mode="poster"
                    sizes="(max-width: 640px) 50vw, 25vw"
                    className="object-cover transition-transform duration-700 hover:scale-[1.04]"
                  />
                </Link>
              ))}
            />
            <div className="mt-8">
              <Link
                href="/momentos-palmas-mall"
                className="inline-flex items-center gap-1.5 font-semibold text-palm-700 transition-colors hover:text-palm-900"
              >
                Ver toda la galería <ArrowRight size={16} weight="bold" />
              </Link>
            </div>
          </Container>
        </section>
      )}

      {/* ── Galardones ──────────────────────────────────── */}
      <section className="bg-palm-950 py-16 text-white sm:py-24">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:items-center">
            <Reveal>
              <div>
                <h2 className="font-display text-3xl font-bold leading-[1.12] tracking-[-0.02em] sm:text-4xl">
                  Un diseño premiado en el mundo
                </h2>
                <p className="mt-4 max-w-[48ch] text-[15px] leading-relaxed text-mist-300 sm:text-base">
                  La arquitectura de Palmas Mall ha sido reconocida por las
                  organizaciones más importantes del sector inmobiliario y de
                  centros comerciales.
                </p>
                <Link
                  href="/galardones"
                  className="mt-6 inline-flex items-center gap-1.5 font-semibold text-leaf-300 transition-colors hover:text-leaf-400"
                >
                  Conoce los galardones <ArrowRight size={16} weight="bold" />
                </Link>
              </div>
            </Reveal>
            <div className="grid gap-4 sm:grid-cols-2">
              <Reveal delay={0.08}>
                <div className="h-full rounded-2xl bg-white/5 p-6 ring-1 ring-white/10">
                  <Image src="/brand/G1.png" alt="Premio FIABCI a la excelencia inmobiliaria" width={96} height={96} className="h-16 w-auto rounded-lg bg-white p-1.5" />
                  <p className="mt-4 font-display text-lg font-bold">FIABCI</p>
                  <p className="mt-1 text-sm leading-relaxed text-mist-300">
                    Premio a la Excelencia Inmobiliaria, categoría comercio,
                    otorgado por la Federación Internacional de Profesionales
                    Inmobiliarios.
                  </p>
                </div>
              </Reveal>
              <Reveal delay={0.16}>
                <div className="h-full rounded-2xl bg-white/5 p-6 ring-1 ring-white/10">
                  <Image src="/brand/G2.png" alt="ICSC Silver Award 2009 for Development and Design Excellence" width={96} height={96} className="h-16 w-auto rounded-lg bg-white p-1.5" />
                  <p className="mt-4 font-display text-lg font-bold">ICSC Silver Award</p>
                  <p className="mt-1 text-sm leading-relaxed text-mist-300">
                    Silver Award 2009 for Development & Design Excellence del
                    International Council of Shopping Centers.
                  </p>
                </div>
              </Reveal>
            </div>
          </div>
        </Container>
      </section>

      {/* ── Ubicación ───────────────────────────────────── */}
      <section className="py-16 sm:py-24">
        <Container>
          <div className="overflow-hidden rounded-2xl bg-white shadow-card lg:grid lg:grid-cols-2">
            <div className="relative h-56 lg:h-auto">
              <Image
                src="/images/fachada-palmas.webp"
                alt="Fachada de Palmas Mall en Ciudad Jardín, Cali"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            <div className="p-6 sm:p-10">
              <h2 className="font-display text-2xl font-bold tracking-[-0.02em] text-palm-950 sm:text-3xl">
                Te esperamos en Ciudad Jardín
              </h2>
              <ul className="mt-6 space-y-4 text-[15px] text-mist-700">
                <li className="flex items-start gap-3">
                  <MapPin size={20} className="mt-0.5 shrink-0 text-palm-700" weight="bold" />
                  <span>{mainSede?.address ?? settings.address}</span>
                </li>
                <li className="flex items-start gap-3">
                  <Clock size={20} className="mt-0.5 shrink-0 text-palm-700" weight="bold" />
                  <span>{mainSede?.openingHours || settings.openingHours}</span>
                </li>
              </ul>
              <div className="mt-7 flex flex-wrap gap-3">
                <a
                  href={mainSede?.wazeUrl || settings.wazeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pressable inline-flex h-11 items-center rounded-full bg-palm-700 px-6 text-sm font-semibold text-white transition-colors hover:bg-palm-800"
                >
                  Abrir en Waze
                </a>
                <a
                  href={mainSede?.mapsUrl || settings.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pressable inline-flex h-11 items-center rounded-full border border-palm-700/30 bg-white px-6 text-sm font-semibold text-palm-800 transition-colors hover:bg-palm-50"
                >
                  Google Maps
                </a>
              </div>
              <Link
                href="/como-llegar"
                className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-palm-700 transition-colors hover:text-palm-900"
              >
                Más opciones para llegar <ArrowRight size={15} weight="bold" />
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* ── FAQ (AEO) ───────────────────────────────────── */}
      {faqs.length > 0 && (
        <section className="pb-20 sm:pb-28">
          <Container className="max-w-3xl">
            <SectionTitle
              title="Preguntas frecuentes"
              intro="Lo que más nos preguntan sobre Palmas Mall."
              align="center"
            />
            <FaqAccordion
              faqs={faqs.map((f) => ({ id: f.id, question: f.question, answer: f.answer }))}
            />
          </Container>
        </section>
      )}
      <ExtraBlocks page={page} consumed={["HERO", "RICH_TEXT"]} />
    </>
  );
}
