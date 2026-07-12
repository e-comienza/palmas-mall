import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/** Healthcheck para Railway: comprueba app + conexión a la base de datos. */
export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ status: "ok", db: "ok" });
  } catch {
    return NextResponse.json({ status: "degraded", db: "down" }, { status: 503 });
  }
}
