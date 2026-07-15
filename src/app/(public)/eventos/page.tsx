import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CalendarBlank, MapPin } from "@phosphor-icons/react/dist/ssr";
import { PageHeader } from "@/components/public/page-header";
import { Container, SectionTitle } from "@/components/public/container";
import { Badge } from "@/components/ui/badge";
import { getUpcomingEvents, getPastEvents, getPage } from "@/lib/queries";
import { heroData } from "@/lib/blocks";
import { ExtraBlocks } from "@/components/public/block-renderer";
import { pageMetadata } from "@/lib/page-metadata";
import { PageFaqs } from "@/components/public/page-faqs";
import { itemListJsonLd, webPageJsonLd, JsonLdScript } from "@/lib/jsonld";
import { formatDateEs } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("eventos", "/eventos");
}

export default async function EventosPage() {
  const [upcoming, past, page] = await Promise.all([
    getUpcomingEvents(),
    getPastEvents(4),
    getPage("eventos"),
  ]);
  const [next, ...rest] = upcoming;
  const hero = heroData(page);

  return (
    <>
      <JsonLdScript
        data={[
          webPageJsonLd({
            path: "/eventos",
            name: hero.heading || "Eventos",
            description: page?.seoDescription,
          }),
          itemListJsonLd({
            path: "/eventos",
            name: "Próximos eventos en Palmas Mall",
            items: upcoming.map((e) => ({
              name: e.title,
              path: `/eventos/${e.slug}`,
              image: e.coverUrl || undefined,
              description: e.shortDescription || undefined,
            })),
          }),
        ]}
      />
      <PageHeader
        title={hero.heading || "Eventos"}
        intro={hero.subheading || "Ferias, música, deporte y planes para toda la familia: esto es lo que viene en Palmas Mall."}
        crumbs={[{ name: "Eventos", path: "/eventos" }]}
      />
      <Container className="py-10 sm:py-14">
        {next ? (
          <Link
            href={`/eventos/${next.slug}`}
            className="group block overflow-hidden rounded-2xl bg-white shadow-card transition-shadow hover:shadow-card-hover lg:grid lg:grid-cols-2"
          >
            <div className="relative aspect-[16/9] lg:aspect-auto lg:min-h-[320px]">
              <Image
                src={next.coverUrl || "/images/galeria/dsc2143-scaled.webp"}
                alt={next.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
              />
            </div>
            <div className="flex flex-col justify-center p-6 sm:p-10">
              <Badge variant="leaf" className="w-fit">Próximo evento</Badge>
              <h2 className="mt-3 font-display text-2xl font-bold leading-[1.15] tracking-[-0.02em] text-palm-950 sm:text-3xl">
                {next.title}
              </h2>
              <p className="mt-3 line-clamp-3 text-[15px] leading-relaxed text-mist-600">
                {next.shortDescription}
              </p>
              <div className="mt-5 space-y-2 text-sm text-mist-700">
                <p className="flex items-center gap-2">
                  <CalendarBlank size={17} weight="bold" className="text-palm-700" />
                  {formatDateEs(next.startsAt)}
                  {next.timeLabel ? ` · ${next.timeLabel}` : ""}
                </p>
                {next.location ? (
                  <p className="flex items-center gap-2">
                    <MapPin size={17} weight="bold" className="text-palm-700" />
                    {next.location}
                  </p>
                ) : null}
              </div>
            </div>
          </Link>
        ) : (
          <div className="rounded-2xl border border-dashed border-mist-300 bg-white p-12 text-center">
            <p className="font-display text-xl font-bold text-palm-950">
              Estamos preparando la próxima agenda
            </p>
            <p className="mx-auto mt-2 max-w-[46ch] text-sm leading-relaxed text-mist-600">
              Síguenos en redes sociales para enterarte de los próximos eventos,
              ferias y experiencias en Palmas Mall.
            </p>
          </div>
        )}

        {rest.length ? (
          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {rest.map((event) => (
              <Link
                key={event.id}
                href={`/eventos/${event.slug}`}
                className="group flex gap-4 rounded-2xl bg-white p-4 shadow-card transition-shadow hover:shadow-card-hover"
              >
                <div className="relative aspect-square w-24 shrink-0 overflow-hidden rounded-xl bg-mist-100 sm:w-28">
                  <Image
                    src={event.coverUrl || "/images/galeria/dsc2143-scaled.webp"}
                    alt={event.title}
                    fill
                    sizes="112px"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                  />
                </div>
                <div className="min-w-0">
                  <p className="flex items-center gap-1.5 text-[13px] font-semibold text-palm-700">
                    <CalendarBlank size={14} weight="bold" />
                    {formatDateEs(event.startsAt)}
                  </p>
                  <h3 className="mt-1 line-clamp-2 font-display text-[17px] font-bold leading-snug text-palm-950">
                    {event.title}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-sm text-mist-600">
                    {event.shortDescription}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : null}

        {past.length ? (
          <div className="mt-16">
            <SectionTitle title="Eventos pasados" />
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {past.map((event) => (
                <Link
                  key={event.id}
                  href={`/eventos/${event.slug}`}
                  className="group overflow-hidden rounded-2xl bg-white shadow-card"
                >
                  <div className="relative aspect-[4/3] bg-mist-100">
                    <Image
                      src={event.coverUrl || "/images/galeria/dsc2143-scaled.webp"}
                      alt={event.title}
                      fill
                      sizes="(max-width: 1024px) 50vw, 25vw"
                      className="object-cover opacity-80 grayscale-[30%] transition-all duration-500 group-hover:opacity-100 group-hover:grayscale-0"
                    />
                  </div>
                  <div className="p-4">
                    <p className="text-[12px] font-semibold text-mist-500">
                      {formatDateEs(event.startsAt)}
                    </p>
                    <h3 className="mt-1 line-clamp-2 text-sm font-bold text-palm-950">
                      {event.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ) : null}
      </Container>
      <PageFaqs faqs={page?.faqs} className="bg-white py-14 sm:py-20" />
      <ExtraBlocks page={page} />
    </>
  );
}
