import type { Local } from "@prisma/client";
import { PhotoCarousel } from "@/components/public/photo-carousel";
import { asStringArray } from "@/lib/utils";

/**
 * Galería del local integrada al contenido ("Conoce el espacio"):
 * muestra las fotos adicionales (la principal ya es el hero).
 * Sin fotos adicionales no renderiza nada: nunca un carrusel vacío.
 */
export function LocalImageCarousel({ local }: { local: Local }) {
  const extra = asStringArray(local.gallery).filter((url) => url && url !== local.coverUrl);
  const unique = Array.from(new Set(extra));
  if (!unique.length) return null;

  const images = unique.map((url, i) => ({
    url,
    alt: `${local.name} en Palmas Mall: foto ${i + 1} del espacio`,
  }));

  return (
    <section aria-label={`Galería de ${local.name}`} className="mt-10">
      <h2 className="mb-4 font-display text-xl font-bold tracking-[-0.01em] text-palm-950 sm:text-2xl">
        Conoce el espacio
      </h2>
      <PhotoCarousel images={images} aspect="aspect-[4/3] sm:aspect-[16/9]" />
    </section>
  );
}
