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
    v.muted = true;
    v.defaultMuted = true;
    const p = v.play();
    if (p) p.catch(() => {});
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
