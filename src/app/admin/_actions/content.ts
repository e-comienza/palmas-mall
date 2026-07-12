"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireActionUser, can, type SessionUser } from "@/lib/permissions";
import { logAudit } from "@/lib/audit";
import { slugify } from "@/lib/utils";
import type { FormState } from "@/components/admin/form-helpers";
import { zodErrors } from "./helpers";
import { ContentStatus } from "@prisma/client";

const statusSchema = z.nativeEnum(ContentStatus);

function bool(v: FormDataEntryValue | null): boolean {
  return v === "on" || v === "true" || v === "1";
}

function json<T>(v: FormDataEntryValue | null, fallback: T): T {
  if (typeof v !== "string" || !v) return fallback;
  try {
    return JSON.parse(v) as T;
  } catch {
    return fallback;
  }
}

function commaList(v: FormDataEntryValue | null): string[] {
  if (typeof v !== "string") return [];
  return v
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Los editores no pueden cambiar el estado de publicación. */
function resolveStatus(
  requested: ContentStatus,
  existing: ContentStatus | undefined,
  user: SessionUser,
): ContentStatus {
  if (can.publish(user)) return requested;
  return existing ?? ContentStatus.DRAFT;
}

async function uniqueSlug(
  model: "local" | "event" | "blogPost" | "page",
  base: string,
  excludeId?: string,
): Promise<string> {
  const clean = slugify(base) || "item";
  let candidate = clean;
  let i = 2;
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const tbl = (prisma as any)[model];
  /* eslint-enable @typescript-eslint/no-explicit-any */
  while (true) {
    const found = await tbl.findUnique({ where: { slug: candidate } });
    if (!found || found.id === excludeId) return candidate;
    candidate = `${clean}-${i++}`;
  }
}

// ─────────────────────────── Locales ───────────────────────────

const optionalUrl = z
  .string()
  .trim()
  .refine((v) => v === "" || /^https?:\/\/.+\..+/.test(v), "Debe ser una URL válida (https://…)");

const localSchema = z.object({
  name: z.string().min(2, "El nombre es obligatorio").max(120),
  shortDescription: z.string().max(300, "Máximo 300 caracteres"),
  status: statusSchema,
  websiteUrl: optionalUrl,
  instagramUrl: optionalUrl,
  facebookUrl: optionalUrl,
  tiktokUrl: optionalUrl,
  menuUrl: optionalUrl,
  reservationUrl: optionalUrl,
  deliveryUrl: optionalUrl,
});

export async function upsertLocal(_prev: FormState, formData: FormData): Promise<FormState> {
  let user: SessionUser;
  try {
    user = await requireActionUser("EDITOR");
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }

  const parsed = localSchema.safeParse({
    name: formData.get("name"),
    shortDescription: formData.get("shortDescription") ?? "",
    status: formData.get("status") ?? "DRAFT",
    websiteUrl: formData.get("websiteUrl") ?? "",
    instagramUrl: formData.get("instagramUrl") ?? "",
    facebookUrl: formData.get("facebookUrl") ?? "",
    tiktokUrl: formData.get("tiktokUrl") ?? "",
    menuUrl: formData.get("menuUrl") ?? "",
    reservationUrl: formData.get("reservationUrl") ?? "",
    deliveryUrl: formData.get("deliveryUrl") ?? "",
  });
  if (!parsed.success) return zodErrors(parsed.error);

  const id = (formData.get("id") as string) || undefined;
  const existing = id ? await prisma.local.findUnique({ where: { id } }) : null;
  const slug = await uniqueSlug("local", (formData.get("slug") as string) || parsed.data.name, id);

  const data = {
    name: parsed.data.name,
    slug,
    categoryId: (formData.get("categoryId") as string) || null,
    sedeId: (formData.get("sedeId") as string) || null,
    logoUrl: (formData.get("logoUrl") as string) || "",
    coverUrl: (formData.get("coverUrl") as string) || "",
    gallery: json<string[]>(formData.get("gallery"), []),
    shortDescription: parsed.data.shortDescription,
    longDescription: (formData.get("longDescription") as string) || "",
    floor: (formData.get("floor") as string) || "",
    unitNumber: (formData.get("unitNumber") as string) || "",
    openingHours: json(formData.get("openingHours"), []),
    phone: (formData.get("phone") as string) || "",
    whatsapp: ((formData.get("whatsapp") as string) || "").replace(/[^\d]/g, ""),
    email: (formData.get("email") as string) || "",
    websiteUrl: parsed.data.websiteUrl,
    instagramUrl: parsed.data.instagramUrl,
    facebookUrl: parsed.data.facebookUrl,
    tiktokUrl: parsed.data.tiktokUrl,
    menuUrl: parsed.data.menuUrl,
    reservationUrl: parsed.data.reservationUrl,
    deliveryUrl: parsed.data.deliveryUrl,
    tags: commaList(formData.get("tags")),
    isRestaurant: bool(formData.get("isRestaurant")),
    featured: bool(formData.get("featured")),
    comingSoon: bool(formData.get("comingSoon")),
    isPlaceholder: bool(formData.get("isPlaceholder")),
    order: Number(formData.get("order") ?? 0) || 0,
    status: resolveStatus(parsed.data.status, existing?.status, user),
    seoTitle: (formData.get("seoTitle") as string) || "",
    seoDescription: (formData.get("seoDescription") as string) || "",
    updatedById: user.id,
  };

  try {
    const local = existing
      ? await prisma.local.update({ where: { id }, data })
      : await prisma.local.create({ data: { ...data, createdById: user.id } });
    await logAudit(user, {
      action: existing ? "update" : "create",
      entity: "Local",
      entityId: local.id,
      entityName: local.name,
    });
    revalidatePath("/", "layout");
    return { ok: true, redirectTo: "/admin/locales" };
  } catch (error) {
    console.error("[admin] upsertLocal", error);
    return { ok: false, error: "No se pudo guardar el local" };
  }
}

// ─────────────────────────── Eventos ───────────────────────────

const eventSchema = z.object({
  title: z.string().min(2, "El título es obligatorio").max(160),
  shortDescription: z.string().max(300, "Máximo 300 caracteres"),
  startsAt: z.string().min(1, "La fecha de inicio es obligatoria"),
  status: statusSchema,
});

export async function upsertEvent(_prev: FormState, formData: FormData): Promise<FormState> {
  let user: SessionUser;
  try {
    user = await requireActionUser("EDITOR");
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }

  const parsed = eventSchema.safeParse({
    title: formData.get("title"),
    shortDescription: formData.get("shortDescription") ?? "",
    startsAt: formData.get("startsAt"),
    status: formData.get("status") ?? "DRAFT",
  });
  if (!parsed.success) return zodErrors(parsed.error);

  const id = (formData.get("id") as string) || undefined;
  const existing = id ? await prisma.event.findUnique({ where: { id } }) : null;
  const slug = await uniqueSlug("event", (formData.get("slug") as string) || parsed.data.title, id);
  const endsAtRaw = (formData.get("endsAt") as string) || "";

  const data = {
    title: parsed.data.title,
    slug,
    shortDescription: parsed.data.shortDescription,
    longDescription: (formData.get("longDescription") as string) || "",
    startsAt: new Date(parsed.data.startsAt),
    endsAt: endsAtRaw ? new Date(endsAtRaw) : null,
    timeLabel: (formData.get("timeLabel") as string) || "",
    location: (formData.get("location") as string) || "",
    coverUrl: (formData.get("coverUrl") as string) || "",
    gallery: json<string[]>(formData.get("gallery"), []),
    organizer: (formData.get("organizer") as string) || "",
    price: formData.get("price") === "PAID" ? ("PAID" as const) : ("FREE" as const),
    priceDetail: (formData.get("priceDetail") as string) || "",
    registrationUrl: (formData.get("registrationUrl") as string) || "",
    featured: bool(formData.get("featured")),
    isPlaceholder: bool(formData.get("isPlaceholder")),
    sedeId: (formData.get("sedeId") as string) || null,
    status: resolveStatus(parsed.data.status, existing?.status, user),
    seoTitle: (formData.get("seoTitle") as string) || "",
    seoDescription: (formData.get("seoDescription") as string) || "",
    updatedById: user.id,
  };

  try {
    const event = existing
      ? await prisma.event.update({ where: { id }, data })
      : await prisma.event.create({ data: { ...data, createdById: user.id } });
    await logAudit(user, {
      action: existing ? "update" : "create",
      entity: "Evento",
      entityId: event.id,
      entityName: event.title,
    });
    revalidatePath("/", "layout");
    return { ok: true, redirectTo: "/admin/eventos" };
  } catch (error) {
    console.error("[admin] upsertEvent", error);
    return { ok: false, error: "No se pudo guardar el evento" };
  }
}

// ─────────────────────────── Blog ───────────────────────────

const postSchema = z.object({
  title: z.string().min(2, "El título es obligatorio").max(180),
  excerpt: z.string().max(400, "Máximo 400 caracteres"),
  status: statusSchema,
});

export async function upsertPost(_prev: FormState, formData: FormData): Promise<FormState> {
  let user: SessionUser;
  try {
    user = await requireActionUser("EDITOR");
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }

  const parsed = postSchema.safeParse({
    title: formData.get("title"),
    excerpt: formData.get("excerpt") ?? "",
    status: formData.get("status") ?? "DRAFT",
  });
  if (!parsed.success) return zodErrors(parsed.error);

  const id = (formData.get("id") as string) || undefined;
  const existing = id ? await prisma.blogPost.findUnique({ where: { id } }) : null;
  const slug = await uniqueSlug("blogPost", (formData.get("slug") as string) || parsed.data.title, id);
  const publishedAtRaw = (formData.get("publishedAt") as string) || "";

  const data = {
    title: parsed.data.title,
    slug,
    author: (formData.get("author") as string) || "Palmas Mall",
    category: (formData.get("category") as string) || "Noticias",
    coverUrl: (formData.get("coverUrl") as string) || "",
    excerpt: parsed.data.excerpt,
    content: (formData.get("content") as string) || "",
    tags: commaList(formData.get("tags")),
    featured: bool(formData.get("featured")),
    isPlaceholder: bool(formData.get("isPlaceholder")),
    publishedAt: publishedAtRaw ? new Date(publishedAtRaw) : existing?.publishedAt ?? new Date(),
    status: resolveStatus(parsed.data.status, existing?.status, user),
    seoTitle: (formData.get("seoTitle") as string) || "",
    seoDescription: (formData.get("seoDescription") as string) || "",
    updatedById: user.id,
  };

  try {
    const post = existing
      ? await prisma.blogPost.update({ where: { id }, data })
      : await prisma.blogPost.create({ data: { ...data, createdById: user.id } });
    await logAudit(user, {
      action: existing ? "update" : "create",
      entity: "Post",
      entityId: post.id,
      entityName: post.title,
    });
    revalidatePath("/", "layout");
    return { ok: true, redirectTo: "/admin/blog" };
  } catch (error) {
    console.error("[admin] upsertPost", error);
    return { ok: false, error: "No se pudo guardar el artículo" };
  }
}

// ─────────────────────────── Páginas ───────────────────────────

const pageSchema = z.object({
  title: z.string().min(2, "El título es obligatorio").max(160),
  status: statusSchema,
});

export async function upsertPage(_prev: FormState, formData: FormData): Promise<FormState> {
  let user: SessionUser;
  try {
    user = await requireActionUser("EDITOR");
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }

  const parsed = pageSchema.safeParse({
    title: formData.get("title"),
    status: formData.get("status") ?? "DRAFT",
  });
  if (!parsed.success) return zodErrors(parsed.error);

  const id = (formData.get("id") as string) || undefined;
  const existing = id ? await prisma.page.findUnique({ where: { id } }) : null;
  // Las páginas de sistema mantienen su slug (las rutas del sitio dependen de él)
  const slug = existing?.system
    ? existing.slug
    : await uniqueSlug("page", (formData.get("slug") as string) || parsed.data.title, id);

  const data = {
    title: parsed.data.title,
    slug,
    description: (formData.get("description") as string) || "",
    status: resolveStatus(parsed.data.status, existing?.status, user),
    seoTitle: (formData.get("seoTitle") as string) || "",
    seoDescription: (formData.get("seoDescription") as string) || "",
    canonicalUrl: (formData.get("canonicalUrl") as string) || "",
    ogImageUrl: (formData.get("ogImageUrl") as string) || "",
    noIndex: bool(formData.get("noIndex")),
    updatedById: user.id,
  };

  try {
    const page = existing
      ? await prisma.page.update({ where: { id }, data })
      : await prisma.page.create({ data: { ...data, createdById: user.id } });

    // Bloques: llegan como JSON [{id?, type, order, data, visible}]
    const blocksRaw = formData.get("blocks");
    if (typeof blocksRaw === "string" && blocksRaw) {
      try {
        const blocks = JSON.parse(blocksRaw) as {
          type: string;
          order: number;
          data: Record<string, unknown>;
          visible?: boolean;
        }[];
        await prisma.pageBlock.deleteMany({ where: { pageId: page.id } });
        if (blocks.length) {
          await prisma.pageBlock.createMany({
            data: blocks.map((b, i) => ({
              pageId: page.id,
              /* eslint-disable @typescript-eslint/no-explicit-any */
              type: b.type as any,
              /* eslint-enable @typescript-eslint/no-explicit-any */
              order: i,
              data: (b.data ?? {}) as object,
              visible: b.visible ?? true,
            })),
          });
        }
      } catch (e) {
        console.error("[admin] bloques inválidos", e);
      }
    }

    await logAudit(user, {
      action: existing ? "update" : "create",
      entity: "Página",
      entityId: page.id,
      entityName: page.title,
    });
    revalidatePath("/", "layout");
    return { ok: true, redirectTo: "/admin/paginas" };
  } catch (error) {
    console.error("[admin] upsertPage", error);
    return { ok: false, error: "No se pudo guardar la página" };
  }
}
