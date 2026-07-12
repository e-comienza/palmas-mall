import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { uploadImage } from "@/lib/storage";
import { prisma } from "@/lib/prisma";

const MAX_SIZE = 8 * 1024 * 1024; // 8 MB
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif", "image/svg+xml"];

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const folder = (formData.get("folder") as string) || "general";
  const alt = (formData.get("alt") as string) || "";

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Falta el archivo" }, { status: 400 });
  }
  if (!ALLOWED.includes(file.type)) {
    return NextResponse.json({ error: "Formato no soportado (usa JPG, PNG, WebP o AVIF)" }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "La imagen supera 8 MB" }, { status: 400 });
  }

  try {
    const result = await uploadImage(file, folder.replace(/[^a-z0-9-]/gi, ""));
    await prisma.mediaAsset.create({
      data: {
        url: result.url,
        publicId: result.publicId,
        filename: file.name,
        mimeType: file.type,
        sizeBytes: result.bytes,
        width: result.width,
        height: result.height,
        alt,
        createdBy: session.user.id,
      },
    });
    return NextResponse.json({ url: result.url });
  } catch (error) {
    console.error("[upload] error", error);
    const message = error instanceof Error ? error.message : "Error subiendo la imagen";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
