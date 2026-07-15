"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { X, CaretLeft, CaretRight } from "@phosphor-icons/react";
import { Media } from "@/components/public/media";
import { cloudinaryPoster, cloudinaryVideoSrc, isVideoUrl } from "@/lib/media";
import { cn } from "@/lib/utils";

export type LightboxImage = { url: string; alt: string; caption?: string };

/**
 * Galería con lightbox propio: grid masonry clickeable que abre la foto en
 * grande. Swipe en móvil, flechas y Escape en desktop, scroll bloqueado,
 * foco gestionado y captions. Sin librerías externas.
 */
export function LightboxGallery({
  images,
  className,
}: {
  images: LightboxImage[];
  className?: string;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const reduce = useReducedMotion();
  const closeRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const touchStart = useRef<{ x: number; t: number } | null>(null);

  const open = (i: number, trigger: HTMLElement) => {
    triggerRef.current = trigger;
    setOpenIndex(i);
  };

  const close = useCallback(() => {
    setOpenIndex(null);
    triggerRef.current?.focus();
  }, []);

  const step = useCallback(
    (dir: -1 | 1) => {
      setOpenIndex((prev) => {
        if (prev === null) return prev;
        return (prev + dir + images.length) % images.length;
      });
    },
    [images.length],
  );

  // Teclado + scroll lock + foco inicial
  useEffect(() => {
    if (openIndex === null) return;
    document.documentElement.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") step(-1);
      if (e.key === "ArrowRight") step(1);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [openIndex !== null, close, step]); // eslint-disable-line react-hooks/exhaustive-deps

  const active = openIndex !== null ? images[openIndex] : null;

  return (
    <>
      {/* Grid masonry clickeable */}
      <div className={cn("columns-2 gap-3 sm:columns-3 lg:columns-4", className)}>
        {images.map((img, i) => (
          <button
            key={`${img.url}-${i}`}
            type="button"
            onClick={(e) => open(i, e.currentTarget)}
            aria-label={`Ver en grande: ${img.alt}`}
            className="group mb-3 block w-full break-inside-avoid overflow-hidden rounded-2xl bg-mist-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-palm-600"
          >
            <div className="relative">
              <Media
                src={img.url}
                alt={img.alt}
                width={600}
                height={800}
                mode="poster"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="h-auto w-full cursor-zoom-in object-cover transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-[1.03]"
              />
            </div>
            {img.caption ? (
              <span className="block px-3 py-2 text-left text-[13px] text-mist-600">
                {img.caption}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {active && openIndex !== null && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={active.alt}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.15 } }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex flex-col bg-palm-950/95 backdrop-blur-sm"
            onClick={close}
            onTouchStart={(e) => {
              touchStart.current = { x: e.touches[0].clientX, t: Date.now() };
            }}
            onTouchEnd={(e) => {
              const start = touchStart.current;
              touchStart.current = null;
              if (!start) return;
              const dx = e.changedTouches[0].clientX - start.x;
              const velocity = Math.abs(dx) / Math.max(1, Date.now() - start.t);
              if (Math.abs(dx) > 60 || velocity > 0.4) step(dx > 0 ? -1 : 1);
            }}
          >
            {/* Barra superior */}
            <div className="flex items-center justify-between p-4" onClick={(e) => e.stopPropagation()}>
              <p className="text-sm font-medium text-white/70">
                {openIndex + 1} de {images.length}
              </p>
              <button
                ref={closeRef}
                type="button"
                onClick={close}
                aria-label="Cerrar galería"
                className="pressable flex size-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
              >
                <X size={22} weight="bold" />
              </button>
            </div>

            {/* Imagen activa */}
            <div className="relative flex-1 px-3 pb-3 sm:px-16" onClick={(e) => e.stopPropagation()}>
              <motion.div
                key={openIndex}
                initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
                className="relative size-full"
              >
                {isVideoUrl(active.url) ? (
                  <video
                    src={cloudinaryVideoSrc(active.url, 1600)}
                    poster={cloudinaryPoster(active.url)}
                    controls
                    autoPlay
                    playsInline
                    preload="metadata"
                    aria-label={active.alt}
                    className="absolute inset-0 size-full object-contain"
                  />
                ) : (
                  <Media
                    src={active.url}
                    alt={active.alt}
                    fill
                    mode="inline"
                    sizes="100vw"
                    className="object-contain"
                    priority
                  />
                )}
              </motion.div>

              {images.length > 1 ? (
                <>
                  <button
                    type="button"
                    onClick={() => step(-1)}
                    aria-label="Foto anterior"
                    className="pressable absolute left-3 top-1/2 hidden size-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:flex"
                  >
                    <CaretLeft size={24} weight="bold" />
                  </button>
                  <button
                    type="button"
                    onClick={() => step(1)}
                    aria-label="Foto siguiente"
                    className="pressable absolute right-3 top-1/2 hidden size-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:flex"
                  >
                    <CaretRight size={24} weight="bold" />
                  </button>
                </>
              ) : null}
            </div>

            {/* Caption */}
            <div className="min-h-[52px] px-6 pb-5 text-center" onClick={(e) => e.stopPropagation()}>
              {active.caption ? (
                <p className="mx-auto max-w-[60ch] text-sm leading-relaxed text-white/80">
                  {active.caption}
                </p>
              ) : (
                <p className="mx-auto max-w-[60ch] text-sm text-white/50">{active.alt}</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
