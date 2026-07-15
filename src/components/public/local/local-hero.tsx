import Image from "next/image";
import type { Local, LocalCategory } from "@prisma/client";
import { Media } from "@/components/public/media";
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
        { name: "Locales", path: "/locales" },
        { name: local.name, path: `/locales/${local.slug}` },
      ]}
    />
  );

  const badges = (
    <div className="flex flex-wrap items-center gap-2">
      {local.category ? <Badge>{local.category.name}</Badge> : null}
      {local.isRestaurant ? <Badge variant="leaf">Servicio a la mesa</Badge> : null}
      {local.comingSoon ? <Badge variant="dark">Próximamente</Badge> : null}
      {local.unitNumber ? <Badge variant="outline">Local {local.unitNumber}</Badge> : null}
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

      <div className="relative h-[42vh] min-h-[300px] overflow-hidden bg-palm-950 md:h-[52vh] md:max-h-[560px]">
        <Media
          src={local.coverUrl}
          alt={`${local.name} en Palmas Mall Cali`}
          fill
          mode="background"
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-palm-950/85 via-palm-950/15 to-transparent" />
        <Container className="absolute inset-x-0 bottom-0 left-1/2 -translate-x-1/2 pb-6 sm:pb-9">
          <div className="flex items-end gap-4">
            {logoBadge && local.logoUrl ? (
              <Image
                src={local.logoUrl}
                alt={`Logo de ${local.name}`}
                width={80}
                height={80}
                className="hidden size-16 shrink-0 rounded-2xl border border-white/20 bg-white object-contain p-1.5 shadow-card sm:block sm:size-20"
              />
            ) : null}
            <div className="min-w-0">
              <h1 className="font-display text-[2rem] font-bold leading-[1.05] tracking-[-0.02em] text-white drop-shadow-sm sm:text-5xl">
                {local.name}
              </h1>
              <div className="mt-3">{badges}</div>
            </div>
          </div>
        </Container>
      </div>
    </section>
  );
}
