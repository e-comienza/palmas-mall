import { NextResponse } from "next/server";
import { getSiteSettings } from "@/lib/settings";
import { signedPdfUrl } from "@/lib/storage";

// La URL firmada caduca, así que no se puede cachear la redirección.
export const dynamic = "force-dynamic";

/**
 * Abre el brochure de sponsors completo. Cloudinary bloquea la entrega pública
 * de PDF (la URL `.pdf` responde 401), así que redirige a una URL firmada y
 * temporal. Si el brochure es un enlace externo, redirige a ese enlace.
 */
export async function GET() {
  const settings = await getSiteSettings();
  const url = settings.sponsorPdfUrl;
  if (!url) {
    return new NextResponse("Todavía no hay brochure publicado.", {
      status: 404,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }
  const signed = await signedPdfUrl(url);
  return NextResponse.redirect(signed ?? url, 307);
}
