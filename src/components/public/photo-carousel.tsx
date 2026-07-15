"use client";

import { useCallback, useRef, useState } from "react";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import { Media } from "@/components/public/media";
import { cn } from "@/lib/utils";

export type CarouselImage = { url: string; alt: string };

/**
 * Carrusel de fotos con scroll-snap nativo: swipe fluido en móvil,
 * flechas en desktop y dots discretos. Sin librerías, 60fps, sin layout shift.
 */
export function PhotoCarousel({
  images,
  className,
  aspect = "aspect-[4/3] sm:aspect-[16/9]",
  priorityFirst = false,
}: {
  images: CarouselImage[];
  className?: string;
  aspect?: string;
  priorityFirst?: boolean;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const raf = useRef(0);

  const onScroll = useCallback(() => {
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => {
      const el = trackRef.current;
      if (!el) return;
      setIndex(Math.round(el.scrollLeft / el.clientWidth));
    });
  }, []);

  const goTo = useCallback((i: number) => {
    const el = trackRef.current;
    if (!el) return;
    const clamped = Math.max(0, Math.min(images.length - 1, i));
    el.scrollTo({ left: clamped * el.clientWidth, behavior: "smooth" });
  }, [images.length]);

  if (!images.length) return null;

  if (images.length === 1) {
    return (
      <div className={cn("relative overflow-hidden rounded-2xl bg-mist-100", aspect, className)}>
        <Media
          src={images[0].url}
          alt={images[0].alt}
          fill
          mode="inline"
          priority={priorityFirst}
          sizes="(max-width: 768px) 100vw, 800px"
          className="object-cover"
        />
      </div>
    );
  }

  return (
    <section aria-roledescription="carrusel" aria-label="Galería de fotos" className={cn("group relative", className)}>
      <div
        ref={trackRef}
        onScroll={onScroll}
        className={cn(
          "scrollbar-none flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain rounded-2xl bg-mist-100",
        )}
      >
        {images.map((img, i) => (
          <div
            key={`${img.url}-${i}`}
            role="group"
            aria-roledescription="foto"
            aria-label={`Foto ${i + 1} de ${images.length}`}
            className={cn("relative w-full shrink-0 snap-center", aspect)}
          >
            <Media
              src={img.url}
              alt={img.alt}
              fill
              mode="inline"
              priority={priorityFirst && i === 0}
              loading={i === 0 ? undefined : "lazy"}
              sizes="(max-width: 768px) 100vw, 800px"
              className="object-cover"
            />
          </div>
        ))}
      </div>

      {/* Flechas: visibles en hover en desktop, ocultas en touch */}
      <button
        type="button"
        onClick={() => goTo(index - 1)}
        disabled={index === 0}
        aria-label="Foto anterior"
        className="pressable absolute left-3 top-1/2 hidden size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-palm-900 shadow-card opacity-0 transition-opacity duration-200 hover:bg-white disabled:opacity-0 group-hover:opacity-100 group-hover:disabled:opacity-40 lg:flex"
      >
        <CaretLeft size={20} weight="bold" />
      </button>
      <button
        type="button"
        onClick={() => goTo(index + 1)}
        disabled={index === images.length - 1}
        aria-label="Foto siguiente"
        className="pressable absolute right-3 top-1/2 hidden size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-palm-900 shadow-card opacity-0 transition-opacity duration-200 hover:bg-white disabled:opacity-0 group-hover:opacity-100 group-hover:disabled:opacity-40 lg:flex"
      >
        <CaretRight size={20} weight="bold" />
      </button>

      {/* Dots */}
      <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center">
        <div className="pointer-events-auto flex items-center gap-1.5 rounded-full bg-palm-950/40 px-2.5 py-2 backdrop-blur-sm">
          {images.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Ir a la foto ${i + 1}`}
              aria-current={i === index}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)]",
                i === index ? "w-5 bg-white" : "w-1.5 bg-white/60 hover:bg-white/90",
              )}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
