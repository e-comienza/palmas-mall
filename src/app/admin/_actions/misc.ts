"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireActionUser, type SessionUser } from "@/lib/permissions";
import { logAudit } from "@/lib/audit";
import type { FormState } from "@/components/admin/form-helpers";
import { zodErrors, type ActionResult } from "./helpers";
import { normalizeMollyUrl } from "@/lib/molly-image";
import { ContentStatus, FaqScope, PopupAudience, PopupFrequency, PopupPlacement, Role } from "@prisma/client";

function bool(v: FormDataEntryValue | null): boolean {
  return v === "on" || v === "true" || v === "1";
}

// ─────────────────────────── Popups ───────────────────────────

const popupSchema = z.object({
  internalName: z.string().min(2, "Nombre interno obligatorio").max(120),
  title: z.string().max(160),
});

export async function upsertPopup(_prev: FormState, formData: FormData): Promise<FormState> {
  let user: SessionUser;
  try {
    user = await requireActionUser("ADMIN");
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }

  const parsed = popupSchema.safeParse({
    internalName: formData.get("internalName"),
    title: formData.get("title") ?? "",
  });
  if (!parsed.success) return zodErrors(parsed.error);

  const id = (formData.get("id") as string) || undefined;
  const startsAtRaw = (formData.get("startsAt") as string) || "";
  const endsAtRaw = (formData.get("endsAt") as string) || "";

  const data = {
    internalName: parsed.data.internalName,
    title: parsed.data.title,
    body: (formData.get("body") as string) || "",
    imageUrl: (formData.get("imageUrl") as string) || "",
    ctaLabel: (formData.get("ctaLabel") as string) || "",
    ctaUrl: (formData.get("ctaUrl") as string) || "",
    placement: (formData.get("placement") as PopupPlacement) || "ALL",
    customPath: (formData.get("customPath") as string) || "",
    active: bool(formData.get("active")),
    startsAt: startsAtRaw ? new Date(startsAtRaw) : null,
    endsAt: endsAtRaw ? new Date(endsAtRaw) : null,
    frequency: (formData.get("frequency") as PopupFrequency) || "ONCE_PER_SESSION",
    frequencyDays: Number(formData.get("frequencyDays") ?? 7) || 7,
    delaySeconds: Number(formData.get("delaySeconds") ?? 4) || 4,
    exitIntent: bool(formData.get("exitIntent")),
    audience: (formData.get("audience") as PopupAudience) || "ALL",
  };

  try {
    const popup = id
      ? await prisma.popup.update({ where: { id }, data })
      : await prisma.popup.create({ data });
    await logAudit(user, {
      action: id ? "update" : "create",
      entity: "Popup",
      entityId: popup.id,
      entityName: popup.internalName,
    });
    revalidatePath("/", "layout");
    return { ok: true, redirectTo: "/admin/popups" };
  } catch (error) {
    console.error("[admin] upsertPopup", error);
    return { ok: false, error: "No se pudo guardar el popup" };
  }
}

// ─────────────────────────── FAQs ───────────────────────────

const faqSchema = z.object({
  question: z.string().min(5, "Escribe la pregunta").max(300),
  answer: z.string().min(5, "Escribe la respuesta").max(2000),
});

export async function upsertFaq(_prev: FormState, formData: FormData): Promise<FormState> {
  let user: SessionUser;
  try {
    user = await requireActionUser("EDITOR");
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }

  const parsed = faqSchema.safeParse({
    question: formData.get("question"),
    answer: formData.get("answer"),
  });
  if (!parsed.success) return zodErrors(parsed.error);

  const id = (formData.get("id") as string) || undefined;
  const scope = (formData.get("scope") as FaqScope) || "GLOBAL";

  const data = {
    question: parsed.data.question,
    answer: parsed.data.answer,
    scope,
    pageId: scope === "PAGE" ? (formData.get("pageId") as string) || null : null,
    localId: scope === "LOCAL" ? (formData.get("localId") as string) || null : null,
    eventId: scope === "EVENT" ? (formData.get("eventId") as string) || null : null,
    order: Number(formData.get("order") ?? 0) || 0,
    visible: bool(formData.get("visible")),
  };

  try {
    const faq = id
      ? await prisma.faq.update({ where: { id }, data })
      : await prisma.faq.create({ data });
    await logAudit(user, {
      action: id ? "update" : "create",
      entity: "FAQ",
      entityId: faq.id,
      entityName: faq.question,
    });
    revalidatePath("/", "layout");
    return { ok: true, redirectTo: "/admin/faqs" };
  } catch (error) {
    console.error("[admin] upsertFaq", error);
    return { ok: false, error: "No se pudo guardar la FAQ" };
  }
}

// ─────────────────────────── Galería ───────────────────────────

export async function addGalleryImages(_prev: FormState, formData: FormData): Promise<FormState> {
  let user: SessionUser;
  try {
    user = await requireActionUser("EDITOR");
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }

  const albumId = (formData.get("albumId") as string) || null;
  const urlsRaw = formData.get("urls");
  let urls: string[] = [];
  try {
    urls = JSON.parse((urlsRaw as string) || "[]");
  } catch {
    urls = [];
  }
  const alt = (formData.get("alt") as string) || "";
  if (!urls.length) return { ok: false, error: "Sube al menos una imagen" };

  try {
    const max = await prisma.galleryImage.aggregate({ _max: { order: true } });
    let order = (max._max.order ?? 0) + 1;
    for (const url of urls) {
      await prisma.galleryImage.create({
        data: { albumId, url, alt, order: order++, showOnHome: bool(formData.get("showOnHome")) },
      });
    }
    await logAudit(user, {
      action: "create",
      entity: "Imagen",
      entityName: `${urls.length} imágenes`,
    });
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (error) {
    console.error("[admin] addGalleryImages", error);
    return { ok: false, error: "No se pudieron guardar las imágenes" };
  }
}

export async function updateGalleryImage(_prev: FormState, formData: FormData): Promise<FormState> {
  try {
    await requireActionUser("EDITOR");
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
  const id = formData.get("id") as string;
  if (!id) return { ok: false, error: "Falta la imagen" };
  try {
    await prisma.galleryImage.update({
      where: { id },
      data: {
        alt: (formData.get("alt") as string) || "",
        caption: (formData.get("caption") as string) || "",
        showOnHome: bool(formData.get("showOnHome")),
        albumId: (formData.get("albumId") as string) || null,
        order: Number(formData.get("order") ?? 0) || 0,
        status: bool(formData.get("visible")) ? ContentStatus.PUBLISHED : ContentStatus.HIDDEN,
      },
    });
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (error) {
    console.error("[admin] updateGalleryImage", error);
    return { ok: false, error: "No se pudo actualizar la imagen" };
  }
}

export async function upsertAlbum(_prev: FormState, formData: FormData): Promise<FormState> {
  let user: SessionUser;
  try {
    user = await requireActionUser("EDITOR");
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
  const title = (formData.get("title") as string)?.trim();
  if (!title || title.length < 2) {
    return { ok: false, error: "El título del álbum es obligatorio", fieldErrors: { title: "Obligatorio" } };
  }
  const id = (formData.get("id") as string) || undefined;
  const { slugify } = await import("@/lib/utils");
  try {
    const album = id
      ? await prisma.galleryAlbum.update({
          where: { id },
          data: { title, description: (formData.get("description") as string) || "" },
        })
      : await prisma.galleryAlbum.create({
          data: {
            title,
            slug: `${slugify(title)}-${Date.now().toString(36)}`,
            description: (formData.get("description") as string) || "",
          },
        });
    await logAudit(user, { action: id ? "update" : "create", entity: "Álbum", entityId: album.id, entityName: album.title });
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (error) {
    console.error("[admin] upsertAlbum", error);
    return { ok: false, error: "No se pudo guardar el álbum" };
  }
}

// ─────────────────────── Configuración global ───────────────────────

export async function updateSettings(_prev: FormState, formData: FormData): Promise<FormState> {
  let user: SessionUser;
  try {
    user = await requireActionUser("SUPER_ADMIN");
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }

  const fields = [
    "mallName", "tagline", "logoUrl", "logoAltUrl", "sloganImageUrl", "faviconUrl", "primaryColor",
    "accentColor", "phone", "whatsapp", "email", "address", "openingHours",
    "instagramUrl", "facebookUrl", "tiktokUrl", "twitterUrl", "wazeUrl",
    "googleMapsUrl", "seoTitleTemplate", "seoDefaultTitle", "seoDefaultDesc",
    "ogImageUrl", "externalScripts", "globalBannerText",
    "mollyImageUrl", "mollyMessage", "mollyCtaLabel", "mollyCtaUrl",
  ] as const;

  const data: Record<string, string | boolean> = {};
  for (const field of fields) {
    const value = formData.get(field);
    if (typeof value === "string") data[field] = value;
  }
  data.globalBannerActive = bool(formData.get("globalBannerActive"));
  if (typeof data.mollyImageUrl === "string") data.mollyImageUrl = normalizeMollyUrl(data.mollyImageUrl);
  data.mollyEnabled = bool(formData.get("mollyEnabled"));
  data.mollyShowMobile = bool(formData.get("mollyShowMobile"));
  data.mollyShowDesktop = bool(formData.get("mollyShowDesktop"));
  if (typeof data.whatsapp === "string") data.whatsapp = data.whatsapp.replace(/[^\d]/g, "");

  try {
    await prisma.siteSettings.upsert({
      where: { id: 1 },
      update: data,
      create: { id: 1, ...data },
    });
    await logAudit(user, { action: "update", entity: "Configuración", entityName: "Sitio" });
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (error) {
    console.error("[admin] updateSettings", error);
    return { ok: false, error: "No se pudo guardar la configuración" };
  }
}

export async function updateSede(_prev: FormState, formData: FormData): Promise<FormState> {
  let user: SessionUser;
  try {
    user = await requireActionUser("SUPER_ADMIN");
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
  const id = formData.get("id") as string;
  if (!id) return { ok: false, error: "Falta la sede" };
  try {
    const sede = await prisma.sede.update({
      where: { id },
      data: {
        name: (formData.get("name") as string) || "",
        city: (formData.get("city") as string) || "",
        address: (formData.get("address") as string) || "",
        phone: (formData.get("phone") as string) || "",
        whatsapp: ((formData.get("whatsapp") as string) || "").replace(/[^\d]/g, ""),
        email: (formData.get("email") as string) || "",
        openingHours: (formData.get("openingHours") as string) || "",
        wazeUrl: (formData.get("wazeUrl") as string) || "",
        mapsUrl: (formData.get("mapsUrl") as string) || "",
      },
    });
    await logAudit(user, { action: "update", entity: "Sede", entityId: sede.id, entityName: sede.name });
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (error) {
    console.error("[admin] updateSede", error);
    return { ok: false, error: "No se pudo guardar la sede" };
  }
}

// ─────────────────────────── Navegación ───────────────────────────

export async function saveMenuItems(_prev: FormState, formData: FormData): Promise<FormState> {
  let user: SessionUser;
  try {
    user = await requireActionUser("ADMIN");
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
  const menuId = formData.get("menuId") as string;
  const itemsRaw = formData.get("items");
  if (!menuId || typeof itemsRaw !== "string") return { ok: false, error: "Datos incompletos" };

  let items: { label: string; url: string; visible?: boolean }[];
  try {
    items = JSON.parse(itemsRaw);
  } catch {
    return { ok: false, error: "Formato de menú inválido" };
  }
  const invalid = items.find((i) => !i.label?.trim() || !i.url?.trim());
  if (invalid) return { ok: false, error: "Todos los ítems necesitan etiqueta y URL" };

  try {
    await prisma.navigationItem.deleteMany({ where: { menuId } });
    await prisma.navigationItem.createMany({
      data: items.map((item, i) => ({
        menuId,
        label: item.label.trim(),
        url: item.url.trim(),
        order: i,
        visible: item.visible ?? true,
      })),
    });
    await logAudit(user, { action: "update", entity: "Navegación", entityId: menuId });
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (error) {
    console.error("[admin] saveMenuItems", error);
    return { ok: false, error: "No se pudo guardar el menú" };
  }
}

// ─────────────────────────── Usuarios ───────────────────────────

const userSchema = z.object({
  name: z.string().min(2, "El nombre es obligatorio").max(80),
  email: z.string().email("Email inválido"),
  role: z.nativeEnum(Role),
  password: z.string().optional(),
});

export async function upsertUser(_prev: FormState, formData: FormData): Promise<FormState> {
  let user: SessionUser;
  try {
    user = await requireActionUser("SUPER_ADMIN");
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }

  const parsed = userSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    role: formData.get("role") ?? "EDITOR",
    password: (formData.get("password") as string) || undefined,
  });
  if (!parsed.success) return zodErrors(parsed.error);

  const id = (formData.get("id") as string) || undefined;
  const email = parsed.data.email.toLowerCase().trim();

  if (!id && (!parsed.data.password || parsed.data.password.length < 8)) {
    return {
      ok: false,
      error: "Revisa los campos marcados",
      fieldErrors: { password: "Mínimo 8 caracteres" },
    };
  }
  if (id && parsed.data.password && parsed.data.password.length < 8) {
    return {
      ok: false,
      error: "Revisa los campos marcados",
      fieldErrors: { password: "Mínimo 8 caracteres" },
    };
  }

  try {
    const data: Record<string, unknown> = {
      name: parsed.data.name,
      email,
      role: parsed.data.role,
      active: bool(formData.get("active")),
    };
    if (parsed.data.password) data.passwordHash = await hash(parsed.data.password, 12);

    const saved = id
      ? await prisma.user.update({ where: { id }, data })
      : await prisma.user.create({ data: data as Parameters<typeof prisma.user.create>[0]["data"] });

    await logAudit(user, {
      action: id ? "update" : "create",
      entity: "Usuario",
      entityId: saved.id,
      entityName: saved.email,
    });
    revalidatePath("/admin/usuarios");
    return { ok: true, redirectTo: "/admin/usuarios" };
  } catch (error) {
    console.error("[admin] upsertUser", error);
    return { ok: false, error: "No se pudo guardar el usuario (¿email duplicado?)" };
  }
}

export async function deleteUser(id: string): Promise<ActionResult> {
  try {
    const user = await requireActionUser("SUPER_ADMIN");
    if (user.id === id) return { ok: false, error: "No puedes eliminar tu propio usuario" };
    const removed = await prisma.user.delete({ where: { id } });
    await logAudit(user, { action: "destroy", entity: "Usuario", entityId: id, entityName: removed.email });
    revalidatePath("/admin/usuarios");
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Error eliminando usuario" };
  }
}

// ─────────────────────────── Mensajes ───────────────────────────

export async function markMessageRead(id: string): Promise<ActionResult> {
  try {
    await requireActionUser("EDITOR");
    await prisma.contactMessage.update({ where: { id }, data: { read: true } });
    revalidatePath("/admin/mensajes");
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Error" };
  }
}
