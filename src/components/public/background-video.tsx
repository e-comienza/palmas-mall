"use client";

import { useEffect, useRef } from "react";

/**
 * Video de fondo con autoplay confiable en móvil.
 * iOS/Android solo autoplayan si el video está muted al cargar; React no
 * serializa el atributo `muted` en SSR, así que lo forzamos por JS antes de
 * play() y reintentamos el play tras montar.
 */
export function BackgroundVideo({
  src,
  poster,
  className,
  ariaLabel,
}: {
  src: string;
  poster?: string;
  className?: string;
  ariaLabel?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    // iOS Safari solo autoplaya muted + inline, y rechaza play() si se llama
    // antes de que el video pueda reproducir. Forzamos muted y reintentamos
    // en cada evento de "listo"; si aún se bloquea, arrancamos al primer toque.
    v.muted = true;
    v.defaultMuted = true;

    const tryPlay = () => {
      const p = v.play();
      if (p) p.catch(() => {});
    };

    tryPlay();
    v.addEventListener("loadeddata", tryPlay);
    v.addEventListener("canplay", tryPlay);

    const onGesture = () => {
      tryPlay();
      window.removeEventListener("touchstart", onGesture);
      window.removeEventListener("pointerdown", onGesture);
    };
    window.addEventListener("touchstart", onGesture, { passive: true, once: true });
    window.addEventListener("pointerdown", onGesture, { passive: true, once: true });

    return () => {
      v.removeEventListener("loadeddata", tryPlay);
      v.removeEventListener("canplay", tryPlay);
      window.removeEventListener("touchstart", onGesture);
      window.removeEventListener("pointerdown", onGesture);
    };
  }, []);

  return (
    <video
      ref={ref}
      src={src}
      poster={poster}
      className={className}
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      aria-label={ariaLabel}
    />
  );
}
