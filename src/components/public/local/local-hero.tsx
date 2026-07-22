import Image from "next/image";
import type { Local, LocalCategory } from "@prisma/client";
import { FramedMedia } from "@/components/public/framed-media";
import { Container } from "@/components/public/container";
import { Breadcrumbs } from "@/components/public/breadcrumbs";
import { Badge } from "@/components/ui/badge";

/**
 * Hero de la página de local: la imagen principal funciona como header
 * visual, con overlay para legibilidad y el nombre/categoría superpuestos.
 * Sin imagen, cae a una banda de marca en verde profundo.
 */
export function LocalHero({
  local,
  logoBadge = true,
}: {
  local: Local & { category: LocalCategory | null };
  logoBadge?: boolean;
}) {
  const crumbs = (
    <Breadcrumbs
      items={[
        { name: "Locales", path: "/directorio" },
        { name: local.name, path: `/directorio/${local.slug}` },
      ]}
    />
  );

  // Badges sobre banda oscura: contraste alto (categoría sólida, resto pill
  // translúcido blanco con texto blanco).
  const badges = (
    <div className="flex flex-wrap items-center gap-2">
      {local.category ? (
        <Badge className="bg-white text-palm-950">{local.category.name}</Badge>
      ) : null}
      {local.isRestaurant ? (
        <Badge className="bg-white/15 text-white ring-1 ring-inset ring-white/30">Servicio a la mesa</Badge>
      ) : null}
      {local.comingSoon ? (
        <Badge className="bg-white/15 text-white ring-1 ring-inset ring-white/30">Próximamente</Badge>
      ) : null}
    </div>
  );

  if (!local.coverUrl) {
    return (
      <div className="bg-gradient-to-br from-palm-950 via-palm-900 to-palm-800 pb-10 pt-8 text-white sm:pb-14 sm:pt-12">
        <Container>
          <div className="[&_a]:text-white/60 [&_a:hover]:text-white [&_span]:!text-white/80 [&_svg]:text-white/40">
            {crumbs}
          </div>
          <h1 className="mt-6 font-display text-[2rem] font-bold leading-[1.05] tracking-[-0.02em] sm:text-5xl">
            {local.name}
          </h1>
          <div className="mt-3">{badges}</div>
        </Container>
      </div>
    );
  }

  return (
    <section className="relative">
      {/* Miga de pan en banda blanca fina, nunca sobre la foto */}
      <div className="border-b border-mist-200 bg-white py-3">
        <Container>{crumbs}</Container>
      </div>

      <div className="relative overflow-hidden bg-gradient-to-br from-palm-950 via-palm-900 to-palm-800">
        <Container className="py-8 sm:py-12">
          <div className="grid items-center gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] md:gap-10">
            {/* Imagen enmarcada: se ve completa sobre su propio fondo borroso */}
            <div className="relative mx-auto aspect-[4/3] w-full max-w-md overflow-hidden rounded-2xl bg-palm-950 shadow-2xl ring-1 ring-white/10">
              <FramedMedia
                src={local.coverUrl}
                alt={`${local.name} en Palmas Mall Cali`}
                priority
                sizes="(max-width: 768px) 90vw, 480px"
              />
            </div>

            {/* Nombre e info, sobre la banda oscura (nunca tapado por la foto) */}
            <div className="text-white">
              {logoBadge && local.logoUrl ? (
                <Image
                  src={local.logoUrl}
                  alt={`Logo de ${local.name}`}
                  width={80}
                  height={80}
                  className="mb-4 size-16 rounded-2xl border border-white/20 bg-white object-contain p-1.5 shadow-card sm:size-20"
                />
              ) : null}
              <h1 className="font-display text-[2rem] font-bold leading-[1.05] tracking-[-0.02em] sm:text-5xl">
                {local.name}
              </h1>
              {local.shortDescription ? (
                <p className="mt-3 max-w-[46ch] text-[15px] leading-relaxed text-white/80">
                  {local.shortDescription}
                </p>
              ) : null}
              <div className="mt-4">{badges}</div>
            </div>
          </div>
        </Container>
      </div>
    </section>
  );
}
