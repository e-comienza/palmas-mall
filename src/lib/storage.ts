import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

export type UploadResult = {
  url: string;
  publicId: string;
  width: number;
  height: number;
  bytes: number;
  /** Nº de páginas (solo PDFs subidos a Cloudinary); 0 si no aplica. */
  pages: number;
};

function cloudinaryConfigured(): boolean {
  return Boolean(process.env.CLOUDINARY_URL);
}

/**
 * Sube una imagen al storage configurado.
 * - Producción: Cloudinary (CLOUDINARY_URL). Railway no debe guardar media
 *   en su filesystem (es efímero entre deploys).
 * - Desarrollo sin Cloudinary: fallback a /public/uploads con advertencia.
 */
export async function uploadImage(
  file: File,
  folder = "general",
): Promise<UploadResult> {
  const buffer = Buffer.from(await file.arrayBuffer());

  if (cloudinaryConfigured()) {
    const { v2: cloudinary } = await import("cloudinary");
    const baseFolder = process.env.CLOUDINARY_FOLDER || "palmas-mall";
    const isVideo = file.type.startsWith("video/");
    const result = await new Promise<UploadResult>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: `${baseFolder}/${folder}`,
            // "auto": detecta imagen o video.
            resource_type: "auto",
            // Solo las imágenes llevan transformación de entrada. Los videos
            // NO: Cloudinary rechaza transformar video grande de forma síncrona
            // ("too large to process synchronously"). Se transforman en delivery
            // con f_auto,q_auto vía URL (ver src/lib/media.ts).
            ...(isVideo ? {} : { transformation: [{ quality: "auto", fetch_format: "auto" }] }),
          },
          (error, uploaded) => {
            if (error || !uploaded) {
              reject(error ?? new Error("Upload sin respuesta de Cloudinary"));
              return;
            }
            resolve({
              url: uploaded.secure_url,
              publicId: uploaded.public_id,
              width: uploaded.width,
              height: uploaded.height,
              bytes: uploaded.bytes,
              pages: uploaded.pages ?? 0,
            });
          },
        )
        .end(buffer);
    });
    return result;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "CLOUDINARY_URL no está configurada. En producción las imágenes deben subirse a un storage externo (ver README).",
    );
  }

  // Fallback local solo para desarrollo
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
  const name = `${Date.now()}-${randomUUID().slice(0, 8)}.${ext}`;
  const dir = path.join(process.cwd(), "public", "uploads", folder);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), buffer);
  console.warn("[storage] CLOUDINARY_URL no configurada — imagen guardada en /public/uploads (solo dev)");
  return {
    url: `/uploads/${folder}/${name}`,
    publicId: "",
    width: 0,
    height: 0,
    bytes: buffer.length,
    pages: 0,
  };
}

/**
 * `public_id` de Cloudinary a partir de una URL de entrega: descarta el prefijo
 * `/upload/`, las transformaciones, la versión y la extensión.
 */
function publicIdFromUrl(url: string): string {
  const after = url.split("/upload/")[1];
  if (!after) return "";
  const parts = after.split("?")[0].split("/");
  while (parts.length > 1) {
    const first = parts[0];
    const isTransform = first.includes(",") || /^[a-z]{1,3}_[^/]+$/.test(first);
    const isVersion = /^v\d+$/.test(first);
    if (!isTransform && !isVersion) break;
    parts.shift();
  }
  return parts.join("/").replace(/\.[a-z0-9]+$/i, "");
}

/**
 * Nº de páginas de un PDF ya subido a Cloudinary (0 si no se puede saber).
 * Se usa para mostrar el brochure de sponsors hoja por hoja.
 */
export async function pdfPageCount(url: string): Promise<number> {
  if (!cloudinaryConfigured()) return 0;
  if (!url.includes("res.cloudinary.com") || !/\.pdf(\?|$)/i.test(url)) return 0;
  const publicId = publicIdFromUrl(url);
  if (!publicId) return 0;
  try {
    const { v2: cloudinary } = await import("cloudinary");
    const info = await cloudinary.api.resource(publicId, { pages: true });
    return typeof info.pages === "number" ? info.pages : 0;
  } catch (error) {
    console.error("[storage] no se pudo leer el nº de páginas del PDF", error);
    return 0;
  }
}

export async function deleteImage(publicId: string): Promise<void> {
  if (!publicId || !cloudinaryConfigured()) return;
  const { v2: cloudinary } = await import("cloudinary");
  // No guardamos el tipo, así que intentamos como imagen y como video:
  // destroy no lanza si el recurso no existe (devuelve "not found").
  for (const resource_type of ["image", "video"] as const) {
    try {
      await cloudinary.uploader.destroy(publicId, { resource_type });
    } catch (error) {
      console.error("[storage] no se pudo eliminar el recurso remoto", error);
    }
  }
}
