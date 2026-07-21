"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { BackgroundVideo } from "./background-video";
import {
  cloudinaryLoader,
  cloudinaryPoster,
  cloudinaryVideoSrc,
  isCloudinary,
  isVideoUrl,
} from "@/lib/media";

/**
 * Renderiza foto o video de forma transparente según la URL.
 * - Imágenes de Cloudinary: loader propio → CDN directo, carga rápida.
 * - Videos:
 *   · mode="poster" (default): muestra solo el primer frame + badge de play.
 *     Ligerísimo — ideal para grids, cards y carruseles (0 bytes de video).
 *   · mode="inline": <video controls>, difiere bytes con preload="metadata".
 *   · mode="background": autoplay muted loop, para fondos de hero.
 */
export type MediaMode = "poster" | "inline" | "background" | "backdrop";

type MediaProps = {
  src: string;
  alt: string;
  className?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
  loading?: "lazy" | "eager";
  /** Comportamiento cuando la URL es un video. */
  mode?: MediaMode;
};

function PlayBadge() {
  return (
    <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <span className="flex size-14 items-center justify-center rounded-full bg-palm-950/55 text-white backdrop-blur-sm transition-transform duration-300 group-hover:scale-110">
        <svg viewBox="0 0 24 24" fill="currentColor" className="ml-0.5 size-6" aria-hidden="true">
          <path d="M8 5v14l11-7z" />
        </svg>
      </span>
    </span>
  );
}

export function Media({
  src,
  alt,
  className,
  fill,
  width,
  height,
  sizes,
  priority,
  loading,
  mode = "poster",
}: MediaProps) {
  if (isVideoUrl(src)) {
    const poster = cloudinaryPoster(src);

    if (mode === "poster" || mode === "backdrop") {
      // Solo el frame como imagen; con badge de play en "poster", sin badge
      // en "backdrop" (para usarlo de fondo borroso). No descarga el video.
      return (
        <>
          {poster ? (
            <Image
              src={poster}
              alt={alt}
              fill={fill}
              width={fill ? undefined : width}
              height={fill ? undefined : height}
              sizes={sizes}
              priority={priority}
              loading={loading}
              className={className}
            />
          ) : (
            <div className="absolute inset-0 bg-palm-950" />
          )}
          {mode === "poster" ? <PlayBadge /> : null}
        </>
      );
    }

    if (mode === "background") {
      return (
        <BackgroundVideo
          src={cloudinaryVideoSrc(src, 1280, "auto:eco")}
          poster={poster}
          className={cn(fill && "absolute inset-0 size-full", className)}
          ariaLabel={alt}
        />
      );
    }

    return (
      <video
        src={cloudinaryVideoSrc(src, 1280)}
        poster={poster}
        className={cn(fill && "absolute inset-0 size-full", className)}
        controls
        playsInline
        preload="metadata"
        aria-label={alt}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      sizes={sizes}
      priority={priority}
      loading={loading}
      loader={isCloudinary(src) ? cloudinaryLoader : undefined}
      className={className}
    />
  );
}
