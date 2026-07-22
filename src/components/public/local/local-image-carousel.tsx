import type { Local } from "@prisma/client";
import { LightboxGallery } from "@/components/public/lightbox-gallery";
import { asStringArray } from "@/lib/utils";

/**
 * Galería del local ("Conoce el espacio"): grid masonry clickeable que abre
 * cada foto en grande (lightbox con swipe/flechas). Muestra las fotos
 * adicionales; sin fotos extra no renderiza nada.
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
      <h2 className="mb-1 font-display text-xl font-bold tracking-[-0.01em] text-palm-950 sm:text-2xl">
        Conoce el espacio
      </h2>
      <p className="mb-4 text-sm text-mist-600">Toca cualquier foto para verla en grande.</p>
      <LightboxGallery images={images} />
    </section>
  );
}
