import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Container } from "@/components/public/container";
import { FaqAccordion } from "@/components/public/faq-section";
import { LocalHero } from "@/components/public/local/local-hero";
import { LocalActionButtons } from "@/components/public/local/local-action-links";
import { LocalImageCarousel } from "@/components/public/local/local-image-carousel";
import { LocalDetails } from "@/components/public/local/local-details";
import { LocalRelatedGrid } from "@/components/public/local/local-related-grid";
import { Badge } from "@/components/ui/badge";
import { getLocalBySlug, getRelatedLocales } from "@/lib/queries";
import { getSiteSettings } from "@/lib/settings";
import { localJsonLd, faqJsonLd, JsonLdScript } from "@/lib/jsonld";
import { asStringArray, siteUrl } from "@/lib/utils";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const local = await getLocalBySlug(slug);
  if (!local) return { title: "Local no encontrado" };
  const title = local.seoTitle || `${local.name} en Palmas Mall Cali`;
  const description =
    local.seoDescription || local.shortDescription || `Visita ${local.name} en Palmas Mall.`;
  const ogImage = local.coverUrl || asStringArray(local.gallery)[0];
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: siteUrl(`/directorio/${local.slug}`) },
    openGraph: {
      title,
      description,
      url: siteUrl(`/directorio/${local.slug}`),
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
  };
}

export default async function LocalPage({ params }: Props) {
  const { slug } = await params;
  const local = await getLocalBySlug(slug);
  if (!local) notFound();

  const [settings, related] = await Promise.all([
    getSiteSettings(),
    getRelatedLocales(local.categoryId, local.id),
  ]);

  const tags = asStringArray(local.tags);
  const hasAnyImage = Boolean(local.coverUrl || asStringArray(local.gallery).length);

  return (
    <>
      <JsonLdScript data={[localJsonLd(local, settings), faqJsonLd(local.faqs)]} />

      {/* 1. Hero con la imagen principal del local */}
      <LocalHero local={local} />

      {/* 2. Información principal: descripción corta + CTAs */}
      <div className="border-b border-mist-200 bg-white py-7 sm:py-9">
        <Container>
          {local.shortDescription ? (
            <p className="max-w-[62ch] text-base leading-relaxed text-mist-700 sm:text-lg">
              {local.shortDescription}
            </p>
          ) : null}
          <div className={local.shortDescription ? "mt-6" : ""}>
            <LocalActionButtons local={local} />
          </div>
        </Container>
      </div>

      <Container className="py-10 sm:py-14">
        <div className="grid gap-10 lg:grid-cols-[1.6fr_1fr]">
          <div className="min-w-0">
            {/* 3. Descripción larga */}
            {local.longDescription ? (
              <section aria-label={`Sobre ${local.name}`}>
                <h2 className="mb-4 font-display text-xl font-bold tracking-[-0.01em] text-palm-950 sm:text-2xl">
                  Sobre {local.name}
                </h2>
                <div className="prose-pm text-mist-700">
                  <p className="text-base leading-relaxed sm:text-lg">{local.longDescription}</p>
                </div>
              </section>
            ) : null}

            {tags.length ? (
              <div className="mt-5 flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="muted">
                    {tag}
                  </Badge>
                ))}
              </div>
            ) : null}

            {/* 4. Carrusel integrado al contenido */}
            <LocalImageCarousel local={local} />

            {!hasAnyImage ? (
              <div className="mt-10 rounded-2xl border border-dashed border-mist-300 bg-white p-8 text-center">
                <p className="mx-auto max-w-[40ch] text-sm leading-relaxed text-mist-500">
                  Este local aún no tiene fotos. El equipo puede subir la imagen
                  principal y la galería desde el panel de administración.
                </p>
              </div>
            ) : null}

            {/* 5. FAQ del local */}
            {local.faqs.length ? (
              <section aria-label="Preguntas frecuentes" className="mt-10">
                <h2 className="mb-4 font-display text-xl font-bold tracking-[-0.01em] text-palm-950 sm:text-2xl">
                  Preguntas frecuentes
                </h2>
                <FaqAccordion
                  faqs={local.faqs.map((f) => ({
                    id: f.id,
                    question: f.question,
                    answer: f.answer,
                  }))}
                />
              </section>
            ) : null}
          </div>

          {/* Horario + ubicación */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <LocalDetails local={local} mallAddress={settings.address} />
            {local.logoUrl ? (
              <div className="mt-5 flex items-center gap-4 rounded-2xl bg-white p-5 shadow-card">
                <Image
                  src={local.logoUrl}
                  alt={`Logo de ${local.name}`}
                  width={56}
                  height={56}
                  className="size-14 shrink-0 rounded-xl border border-mist-200 bg-white object-contain p-1"
                />
                <p className="text-sm leading-snug text-mist-600">
                  {local.name} hace parte de {settings.mallName}, el Lifestyle
                  Mall de Cali.
                </p>
              </div>
            ) : null}
          </aside>
        </div>

        {/* 6. Locales relacionados */}
        <LocalRelatedGrid locales={related} />
      </Container>
    </>
  );
}
