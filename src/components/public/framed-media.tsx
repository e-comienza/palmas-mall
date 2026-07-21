import { Media, type MediaMode } from "./media";
import { cn } from "@/lib/utils";

/**
 * Muestra la imagen/video COMPLETO (object-contain) sobre un fondo borroso de
 * la misma imagen, en vez de recortar con object-cover. El fondo usa la misma
 * URL que el frente, así que no agrega descargas. El contenedor padre debe ser
 * relativo con overflow-hidden y una relación de aspecto definida.
 */
export function FramedMedia({
  src,
  alt,
  sizes,
  priority,
  foregroundMode = "inline",
  className,
}: {
  src: string;
  alt: string;
  sizes?: string;
  priority?: boolean;
  foregroundMode?: MediaMode;
  className?: string;
}) {
  return (
    <>
      <Media
        src={src}
        alt=""
        fill
        mode="backdrop"
        sizes={sizes}
        className="scale-[1.15] object-cover blur-2xl saturate-125"
      />
      <span aria-hidden className="absolute inset-0 bg-palm-950/25" />
      <Media
        src={src}
        alt={alt}
        fill
        mode={foregroundMode}
        sizes={sizes}
        priority={priority}
        className={cn("relative z-10 object-contain", className)}
      />
    </>
  );
}
