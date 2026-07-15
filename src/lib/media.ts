import type { ImageLoaderProps } from "next/image";

/**
 * Soporte de imágenes y videos servidos desde Cloudinary (o URLs locales).
 * Detección por URL: sin migración de DB, los mismos campos `coverUrl` /
 * `gallery` (string[]) transportan foto o video indistintamente.
 */

const VIDEO_EXT = /\.(mp4|webm|mov|m4v|ogv)(\?.*)?$/i;

export function isCloudinary(url: string): boolean {
  return url.includes("res.cloudinary.com");
}

/** ¿La URL apunta a un video? Por extensión o por path de Cloudinary. */
export function isVideoUrl(url: string): boolean {
  if (!url) return false;
  return VIDEO_EXT.test(url) || url.includes("/video/upload/");
}

/**
 * Loader de Cloudinary para next/image: sirve `f_auto,q_auto,w_<ancho>`
 * directo desde el CDN de Cloudinary, saltándose el optimizador de Next
 * (que en Railway agrega un salto lento y cache efímero).
 */
export function cloudinaryLoader({ src, width, quality }: ImageLoaderProps): string {
  if (!src.includes("/upload/")) return src;
  const q = quality ? `q_${quality}` : "q_auto";
  const t = `f_auto,${q},w_${width},c_limit`;
  return src.replace("/upload/", `/upload/${t}/`);
}

/**
 * URL de video optimizada por Cloudinary: `f_auto` elige MP4/WebM según el
 * navegador y `q_auto` baja el peso sin pérdida visible.
 */
export function cloudinaryVideoSrc(url: string, width?: number): string {
  if (!url.includes("/video/upload/")) return url;
  const t = ["f_auto", "q_auto", width ? `w_${width}` : null, "c_limit"]
    .filter(Boolean)
    .join(",");
  return url.replace("/video/upload/", `/video/upload/${t}/`);
}

/**
 * Poster (primer frame) de un video de Cloudinary como JPG. Carga instantánea:
 * el navegador pinta el poster mientras difiere los bytes del video.
 */
export function cloudinaryPoster(url: string): string | undefined {
  if (!url.includes("/video/upload/")) return undefined;
  return url
    .replace("/video/upload/", "/video/upload/so_0,f_jpg,q_auto/")
    .replace(VIDEO_EXT, ".jpg");
}
