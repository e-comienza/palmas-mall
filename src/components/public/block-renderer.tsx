import Image from "next/image";
import Link from "next/link";
import type { PageBlock, Faq } from "@prisma/client";
import { Container, SectionTitle } from "./container";
import { FaqAccordion } from "./faq-section";
import { LocalCard, EventCard, PostCard } from "./cards";
import { ContactForm } from "./contact-form";
import {
  getFeaturedLocales,
  getUpcomingEvents,
  getPublishedPosts,
} from "@/lib/queries";
import { getSiteSettings } from "@/lib/settings";

type BlockData = Record<string, unknown>;

const str = (data: BlockData, key: string): string =>
  typeof data[key] === "string" ? (data[key] as string) : "";

const arr = (data: BlockData, key: string): string[] =>
  Array.isArray(data[key]) ? (data[key] as unknown[]).filter((v): v is string => typeof v === "string") : [];

/**
 * Renderiza los bloques de una página creada desde el admin.
 * Cada tipo de bloque tiene un diseño consistente con el resto del sitio.
 */
export async function BlockRenderer({
  blocks,
  pageFaqs,
}: {
  blocks: PageBlock[];
  pageFaqs?: Faq[];
}) {
  const settings = await getSiteSettings();

  const rendered = await Promise.all(
    blocks.map(async (block) => {
      const data = (block.data ?? {}) as BlockData;
      switch (block.type) {
        case "HERO":
          return (
            <section key={block.id} className="relative flex min-h-[52vh] flex-col justify-end overflow-hidden bg-palm-950">
              {str(data, "imageUrl") ? (
                <Image src={str(data, "imageUrl")} alt={str(data, "heading")} fill sizes="100vw" className="object-cover opacity-80" priority />
              ) : null}
              <div className="absolute inset-0 bg-gradient-to-t from-palm-950/90 via-palm-950/30 to-palm-950/20" />
              <Container className="relative pb-12 pt-36">
                <h1 className="max-w-2xl font-display text-[2.2rem] font-bold leading-[1.08] tracking-[-0.02em] text-white sm:text-5xl">
                  {str(data, "heading")}
                </h1>
                {str(data, "subheading") ? (
                  <p className="mt-4 max-w-[52ch] text-base leading-relaxed text-white/85 sm:text-lg">
                    {str(data, "subheading")}
                  </p>
                ) : null}
                {str(data, "ctaPrimaryLabel") && str(data, "ctaPrimaryUrl") ? (
                  <Link
                    href={str(data, "ctaPrimaryUrl")}
                    className="pressable mt-7 inline-flex h-12 items-center rounded-full bg-white px-7 text-base font-semibold text-palm-900 hover:bg-mist-100"
                  >
                    {str(data, "ctaPrimaryLabel")}
                  </Link>
                ) : null}
              </Container>
            </section>
          );

        case "RICH_TEXT":
          return (
            <Container key={block.id} className="max-w-3xl py-10">
              {str(data, "heading") ? (
                <h2 className="mb-4 font-display text-2xl font-bold tracking-[-0.02em] text-palm-950 sm:text-3xl">
                  {str(data, "heading")}
                </h2>
              ) : null}
              <div className="prose-pm text-mist-700" dangerouslySetInnerHTML={{ __html: str(data, "body") }} />
            </Container>
          );

        case "IMAGE":
          return (
            <Container key={block.id} className="py-8">
              <figure>
                <div className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-mist-100">
                  {str(data, "url") ? (
                    <Image src={str(data, "url")} alt={str(data, "alt")} fill sizes="(max-width: 1152px) 100vw, 1152px" className="object-cover" />
                  ) : null}
                </div>
                {str(data, "caption") ? (
                  <figcaption className="mt-2 text-center text-sm text-mist-500">{str(data, "caption")}</figcaption>
                ) : null}
              </figure>
            </Container>
          );

        case "GALLERY": {
          const urls = arr(data, "urls");
          if (!urls.length) return null;
          return (
            <Container key={block.id} className="py-8">
              {str(data, "heading") ? <SectionTitle title={str(data, "heading")} /> : null}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {urls.map((url, i) => (
                  <div key={`${url}-${i}`} className="relative aspect-square overflow-hidden rounded-2xl bg-mist-100">
                    <Image src={url} alt={str(data, "alt") || "Galería Palmas Mall"} fill sizes="(max-width: 640px) 50vw, 25vw" className="object-cover" />
                  </div>
                ))}
              </div>
            </Container>
          );
        }

        case "CTA":
          return (
            <Container key={block.id} className="py-10">
              <div className="rounded-2xl bg-palm-950 p-8 text-center text-white sm:p-12">
                <h2 className="font-display text-2xl font-bold tracking-[-0.02em] sm:text-3xl">
                  {str(data, "heading")}
                </h2>
                {str(data, "body") ? (
                  <p className="mx-auto mt-3 max-w-[52ch] text-[15px] leading-relaxed text-mist-300">
                    {str(data, "body")}
                  </p>
                ) : null}
                {str(data, "ctaLabel") && str(data, "ctaUrl") ? (
                  <Link
                    href={str(data, "ctaUrl")}
                    className="pressable mt-6 inline-flex h-12 items-center rounded-full bg-white px-7 text-base font-semibold text-palm-900 hover:bg-mist-100"
                  >
                    {str(data, "ctaLabel")}
                  </Link>
                ) : null}
              </div>
            </Container>
          );

        case "FAQ": {
          const faqs = pageFaqs ?? [];
          if (!faqs.length) return null;
          return (
            <Container key={block.id} className="max-w-3xl py-10">
              <SectionTitle title={str(data, "heading") || "Preguntas frecuentes"} align="center" />
              <FaqAccordion faqs={faqs.map((f) => ({ id: f.id, question: f.question, answer: f.answer }))} />
            </Container>
          );
        }

        case "FEATURED_LOCALES": {
          const locales = await getFeaturedLocales();
          if (!locales.length) return null;
          return (
            <Container key={block.id} className="py-10">
              <SectionTitle title={str(data, "heading") || "Locales destacados"} />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {locales.slice(0, 4).map((l) => (
                  <LocalCard key={l.id} local={l} />
                ))}
              </div>
            </Container>
          );
        }

        case "FEATURED_EVENTS": {
          const events = await getUpcomingEvents(4);
          if (!events.length) return null;
          return (
            <Container key={block.id} className="py-10">
              <SectionTitle title={str(data, "heading") || "Próximos eventos"} />
              <div className="grid gap-4 sm:grid-cols-2">
                {events.map((e) => (
                  <EventCard key={e.id} event={e} />
                ))}
              </div>
            </Container>
          );
        }

        case "FEATURED_POSTS": {
          const posts = await getPublishedPosts(3);
          if (!posts.length) return null;
          return (
            <Container key={block.id} className="py-10">
              <SectionTitle title={str(data, "heading") || "Noticias"} />
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                {posts.map((p) => (
                  <PostCard key={p.id} post={p} />
                ))}
              </div>
            </Container>
          );
        }

        case "MAP":
          return (
            <Container key={block.id} className="py-10">
              <div className="rounded-2xl bg-white p-6 shadow-card sm:p-8">
                <h2 className="font-display text-xl font-bold text-palm-950">
                  {str(data, "heading") || "Dónde estamos"}
                </h2>
                <p className="mt-2 text-[15px] text-mist-600">{settings.address}</p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <a href={settings.wazeUrl} target="_blank" rel="noopener noreferrer" className="pressable inline-flex h-11 items-center rounded-full bg-palm-700 px-6 text-sm font-semibold text-white hover:bg-palm-800">
                    Abrir en Waze
                  </a>
                  <a href={settings.googleMapsUrl} target="_blank" rel="noopener noreferrer" className="pressable inline-flex h-11 items-center rounded-full border border-palm-700/30 bg-white px-6 text-sm font-semibold text-palm-800 hover:bg-palm-50">
                    Google Maps
                  </a>
                </div>
              </div>
            </Container>
          );

        case "FORM":
          return (
            <Container key={block.id} className="max-w-3xl py-10">
              {str(data, "heading") ? <SectionTitle title={str(data, "heading")} align="center" /> : null}
              <ContactForm whatsapp={settings.whatsapp} />
            </Container>
          );

        case "AWARDS":
          return (
            <Container key={block.id} className="py-10">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-white p-6 shadow-card">
                  <Image src="/brand/G1.png" alt="Premio FIABCI" width={96} height={96} className="h-16 w-auto" />
                  <p className="mt-4 font-display text-lg font-bold text-palm-950">FIABCI · Excelencia Inmobiliaria</p>
                </div>
                <div className="rounded-2xl bg-white p-6 shadow-card">
                  <Image src="/brand/G2.png" alt="ICSC Silver Award" width={96} height={96} className="h-16 w-auto" />
                  <p className="mt-4 font-display text-lg font-bold text-palm-950">ICSC · Silver Award 2009</p>
                </div>
              </div>
            </Container>
          );

        case "SERVICE_CARDS": {
          const items = Array.isArray(data.items)
            ? (data.items as { title?: string; text?: string }[])
            : [];
          if (!items.length) return null;
          return (
            <Container key={block.id} className="py-10">
              {str(data, "heading") ? <SectionTitle title={str(data, "heading")} /> : null}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((item, i) => (
                  <div key={i} className="rounded-2xl bg-white p-6 shadow-card">
                    <h3 className="font-display text-[17px] font-bold text-palm-950">{item.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-mist-600">{item.text}</p>
                  </div>
                ))}
              </div>
            </Container>
          );
        }

        case "TESTIMONIALS": {
          const items = Array.isArray(data.items)
            ? (data.items as { quote?: string; author?: string; role?: string }[])
            : [];
          if (!items.length) return null;
          return (
            <Container key={block.id} className="py-10">
              <div className="grid gap-4 sm:grid-cols-2">
                {items.map((t, i) => (
                  <blockquote key={i} className="rounded-2xl bg-white p-6 shadow-card">
                    <p className="text-[15px] leading-relaxed text-mist-700">“{t.quote}”</p>
                    <footer className="mt-4 text-sm font-semibold text-palm-800">
                      {t.author}
                      {t.role ? <span className="font-normal text-mist-500"> · {t.role}</span> : null}
                    </footer>
                  </blockquote>
                ))}
              </div>
            </Container>
          );
        }

        case "VIDEO": {
          const url = str(data, "url");
          if (!url) return null;
          return (
            <Container key={block.id} className="py-10">
              <div className="aspect-video overflow-hidden rounded-2xl bg-palm-950">
                {url.includes("youtube") || url.includes("youtu.be") || url.includes("vimeo") ? (
                  <iframe
                    src={url}
                    title={str(data, "heading") || "Video"}
                    className="size-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video src={url} controls playsInline className="size-full object-cover" />
                )}
              </div>
            </Container>
          );
        }

        default:
          return null;
      }
    }),
  );

  return <>{rendered}</>;
}
