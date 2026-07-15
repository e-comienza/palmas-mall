import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  CalendarBlank,
  Clock,
  MapPin,
  Ticket,
  ArrowRight,
} from "@phosphor-icons/react/dist/ssr";
import { Container } from "@/components/public/container";
import { Media } from "@/components/public/media";
import { Breadcrumbs } from "@/components/public/breadcrumbs";
import { FaqAccordion } from "@/components/public/faq-section";
import { Badge } from "@/components/ui/badge";
import { getEventBySlug, getUpcomingEvents } from "@/lib/queries";
import { getSiteSettings } from "@/lib/settings";
import { eventJsonLd, faqJsonLd, JsonLdScript } from "@/lib/jsonld";
import { formatDateEs, siteUrl } from "@/lib/utils";
import { EventCard } from "@/components/public/cards";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) return { title: "Evento no encontrado" };
  const title = event.seoTitle || `${event.title} | Eventos Palmas Mall`;
  const description = event.seoDescription || event.shortDescription;
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: siteUrl(`/eventos/${event.slug}`) },
    openGraph: {
      title,
      description,
      url: siteUrl(`/eventos/${event.slug}`),
      images: event.coverUrl ? [{ url: event.coverUrl }] : undefined,
    },
  };
}

export default async function EventoPage({ params }: Props) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) notFound();

  const [settings, others] = await Promise.all([getSiteSettings(), getUpcomingEvents(3)]);
  const otherEvents = others.filter((e) => e.id !== event.id).slice(0, 2);
  const isPast = (event.endsAt ?? event.startsAt) < new Date();

  return (
    <>
      <JsonLdScript data={[eventJsonLd(event, settings), faqJsonLd(event.faqs)]} />

      <div className="bg-white pb-10 pt-10 sm:pt-14">
        <Container>
          <Breadcrumbs
            items={[
              { name: "Eventos", path: "/eventos" },
              { name: event.title, path: `/eventos/${event.slug}` },
            ]}
          />
          <div className="mt-5 flex flex-wrap items-center gap-2">
            {isPast ? <Badge variant="muted">Evento finalizado</Badge> : <Badge variant="leaf">Próximo evento</Badge>}
            {event.price === "FREE" ? <Badge>Entrada libre</Badge> : <Badge variant="outline">{event.priceDetail || "Con costo"}</Badge>}
          </div>
          <h1 className="mt-3 max-w-3xl font-display text-[2.1rem] font-bold leading-[1.08] tracking-[-0.02em] text-palm-950 sm:text-5xl">
            {event.title}
          </h1>
          {event.shortDescription ? (
            <p className="mt-4 max-w-[62ch] text-[15px] leading-relaxed text-mist-600 sm:text-lg">
              {event.shortDescription}
            </p>
          ) : null}
        </Container>
      </div>

      <Container className="py-10">
        <div className="grid gap-10 lg:grid-cols-[1.6fr_1fr]">
          <div>
            {event.coverUrl ? (
              <div className="relative aspect-[16/9] overflow-hidden rounded-2xl">
                <Media
                  src={event.coverUrl}
                  alt={event.title}
                  fill
                  mode="inline"
                  priority
                  sizes="(max-width: 1024px) 100vw, 760px"
                  className="object-cover"
                />
              </div>
            ) : null}
            {event.longDescription ? (
              <div
                className="prose-pm mt-8 text-mist-700"
                dangerouslySetInnerHTML={{ __html: event.longDescription }}
              />
            ) : null}

            {event.faqs.length ? (
              <div className="mt-10">
                <h2 className="mb-4 font-display text-xl font-bold text-palm-950">
                  Preguntas frecuentes
                </h2>
                <FaqAccordion
                  faqs={event.faqs.map((f) => ({ id: f.id, question: f.question, answer: f.answer }))}
                />
              </div>
            ) : null}
          </div>

          <aside className="space-y-5">
            <div className="rounded-2xl bg-white p-6 shadow-card">
              <h2 className="font-display text-lg font-bold text-palm-950">Detalles</h2>
              <ul className="mt-4 space-y-3.5 text-sm text-mist-700">
                <li className="flex items-start gap-3">
                  <CalendarBlank size={19} weight="bold" className="mt-0.5 shrink-0 text-palm-700" />
                  <span>
                    {formatDateEs(event.startsAt)}
                    {event.endsAt && event.endsAt.toDateString() !== event.startsAt.toDateString()
                      ? ` al ${formatDateEs(event.endsAt)}`
                      : ""}
                  </span>
                </li>
                {event.timeLabel ? (
                  <li className="flex items-start gap-3">
                    <Clock size={19} weight="bold" className="mt-0.5 shrink-0 text-palm-700" />
                    <span>{event.timeLabel}</span>
                  </li>
                ) : null}
                <li className="flex items-start gap-3">
                  <MapPin size={19} weight="bold" className="mt-0.5 shrink-0 text-palm-700" />
                  <span>
                    {settings.mallName}
                    {event.location ? ` · ${event.location}` : ""}
                  </span>
                </li>
                {event.organizer ? (
                  <li className="flex items-start gap-3">
                    <Ticket size={19} weight="bold" className="mt-0.5 shrink-0 text-palm-700" />
                    <span>Organiza: {event.organizer}</span>
                  </li>
                ) : null}
              </ul>
              {!isPast && event.registrationUrl ? (
                <a
                  href={event.registrationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pressable mt-6 flex h-11 items-center justify-center rounded-full bg-palm-700 text-sm font-semibold text-white transition-colors hover:bg-palm-800"
                >
                  Registrarme
                </a>
              ) : null}
              <Link
                href="/como-llegar"
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-palm-700 transition-colors hover:text-palm-900"
              >
                Cómo llegar al mall <ArrowRight size={15} weight="bold" />
              </Link>
            </div>
          </aside>
        </div>

        {otherEvents.length ? (
          <div className="mt-16">
            <h2 className="mb-6 font-display text-2xl font-bold tracking-[-0.02em] text-palm-950">
              Otros eventos
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {otherEvents.map((e) => (
                <EventCard key={e.id} event={e} />
              ))}
            </div>
          </div>
        ) : null}
      </Container>
    </>
  );
}
