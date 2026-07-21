"use client";

import { useCallback, useRef, useState } from "react";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import { FramedMedia } from "@/components/public/framed-media";
import { cn } from "@/lib/utils";

export type CarouselImage = { url: string; alt: string };

/**
 * Carrusel de fotos: muestra la imagen completa (sin recorte) sobre un fondo
 * borroso, deja asomar la siguiente foto (peek) para que se lea como carrusel,
 * y trae flechas visibles en desktop, contador y dots. Scroll-snap nativo.
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
      let nearest = 0;
      let best = Infinity;
      for (let i = 0; i < el.children.length; i++) {
        const c = el.children[i] as HTMLElement;
        const d = Math.abs(c.offsetLeft - el.scrollLeft);
        if (d < best) {
          best = d;
          nearest = i;
        }
      }
      setIndex(nearest);
    });
  }, []);

  const goTo = useCallback((i: number) => {
    const el = trackRef.current;
    if (!el) return;
    const clamped = Math.max(0, Math.min(el.children.length - 1, i));
    const child = el.children[clamped] as HTMLElement | undefined;
    if (child) el.scrollTo({ left: child.offsetLeft, behavior: "smooth" });
  }, []);

  if (!images.length) return null;

  if (images.length === 1) {
    return (
      <div className={cn("relative overflow-hidden rounded-2xl bg-palm-950", aspect, className)}>
        <FramedMedia
          src={images[0].url}
          alt={images[0].alt}
          priority={priorityFirst}
          sizes="(max-width: 768px) 100vw, 900px"
        />
      </div>
    );
  }

  return (
    <section aria-roledescription="carrusel" aria-label="Galería de fotos" className={cn("group relative", className)}>
      <div
        ref={trackRef}
        onScroll={onScroll}
        className="scrollbar-none flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain"
      >
        {images.map((img, i) => (
          <div
            key={`${img.url}-${i}`}
            role="group"
            aria-roledescription="foto"
            aria-label={`Foto ${i + 1} de ${images.length}`}
            className={cn(
              "relative w-[88%] shrink-0 snap-start overflow-hidden rounded-2xl bg-palm-950 sm:w-[72%] lg:w-[62%]",
              aspect,
            )}
          >
            <FramedMedia
              src={img.url}
              alt={img.alt}
              priority={priorityFirst && i === 0}
              sizes="(max-width: 768px) 88vw, 640px"
            />
          </div>
        ))}
      </div>

      {/* Contador */}
      <div className="pointer-events-none absolute right-3 top-3 rounded-full bg-palm-950/60 px-2.5 py-1 text-[12px] font-semibold text-white backdrop-blur-sm">
        {index + 1} / {images.length}
      </div>

      {/* Flechas: siempre visibles en desktop */}
      <button
        type="button"
        onClick={() => goTo(index - 1)}
        disabled={index === 0}
        aria-label="Foto anterior"
        className="pressable absolute left-2 top-1/2 hidden size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white text-palm-900 shadow-card transition hover:bg-mist-50 disabled:pointer-events-none disabled:opacity-35 lg:flex"
      >
        <CaretLeft size={20} weight="bold" />
      </button>
      <button
        type="button"
        onClick={() => goTo(index + 1)}
        disabled={index === images.length - 1}
        aria-label="Foto siguiente"
        className="pressable absolute right-2 top-1/2 hidden size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white text-palm-900 shadow-card transition hover:bg-mist-50 disabled:pointer-events-none disabled:opacity-35 lg:flex"
      >
        <CaretRight size={20} weight="bold" />
      </button>

      {/* Dots */}
      <div className="mt-3 flex justify-center">
        <div className="flex items-center gap-1.5">
          {images.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Ir a la foto ${i + 1}`}
              aria-current={i === index}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                i === index ? "w-5 bg-palm-700" : "w-1.5 bg-mist-300 hover:bg-mist-400",
              )}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
