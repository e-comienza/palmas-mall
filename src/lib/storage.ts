import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

export type UploadResult = {
  url: string;
  publicId: string;
  width: number;
  height: number;
  bytes: number;
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
    const result = await new Promise<UploadResult>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: `${baseFolder}/${folder}`,
            // "auto": detecta imagen o video. Los videos se sirven luego con
            // f_auto,q_auto (ver src/lib/media.ts) para cargar rápido.
            resource_type: "auto",
            transformation: [{ quality: "auto", fetch_format: "auto" }],
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
  };
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
