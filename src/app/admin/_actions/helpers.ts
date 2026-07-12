"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireActionUser } from "@/lib/permissions";
import { logAudit } from "@/lib/audit";
import type { FormState } from "@/components/admin/form-helpers";
import { z } from "zod";

export type ActionResult = { ok: boolean; error?: string };

/** Entidades que soportan papelera (soft delete). */
const TRASHABLE = {
  local: { model: "local", label: "Local", nameField: "name" },
  event: { model: "event", label: "Evento", nameField: "title" },
  blogPost: { model: "blogPost", label: "Post", nameField: "title" },
  page: { model: "page", label: "Página", nameField: "title" },
  popup: { model: "popup", label: "Popup", nameField: "internalName" },
  galleryImage: { model: "galleryImage", label: "Imagen", nameField: "alt" },
  galleryAlbum: { model: "galleryAlbum", label: "Álbum", nameField: "title" },
  faq: { model: "faq", label: "FAQ", nameField: "question" },
  contactMessage: { model: "contactMessage", label: "Mensaje", nameField: "name" },
} as const;

export type TrashableEntity = keyof typeof TRASHABLE;

/* eslint-disable @typescript-eslint/no-explicit-any */
function table(entity: TrashableEntity): any {
  return (prisma as any)[TRASHABLE[entity].model];
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export async function softDelete(entity: TrashableEntity, id: string): Promise<ActionResult> {
  try {
    const user = await requireActionUser("ADMIN");
    const record = await table(entity).update({
      where: { id },
      data: { deletedAt: new Date(), deletedBy: user.email },
    });
    await logAudit(user, {
      action: "delete",
      entity: TRASHABLE[entity].label,
      entityId: id,
      entityName: String(record[TRASHABLE[entity].nameField] ?? ""),
    });
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Error eliminando" };
  }
}

export async function restoreItem(entity: TrashableEntity, id: string): Promise<ActionResult> {
  try {
    const user = await requireActionUser("ADMIN");
    const record = await table(entity).update({
      where: { id },
      data: { deletedAt: null, deletedBy: null },
    });
    await logAudit(user, {
      action: "restore",
      entity: TRASHABLE[entity].label,
      entityId: id,
      entityName: String(record[TRASHABLE[entity].nameField] ?? ""),
    });
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Error restaurando" };
  }
}

/** Eliminación permanente: solo SUPER_ADMIN. */
export async function destroyItem(entity: TrashableEntity, id: string): Promise<ActionResult> {
  try {
    const user = await requireActionUser("SUPER_ADMIN");
    const record = await table(entity).delete({ where: { id } });
    await logAudit(user, {
      action: "destroy",
      entity: TRASHABLE[entity].label,
      entityId: id,
      entityName: String(record[TRASHABLE[entity].nameField] ?? ""),
    });
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Error eliminando" };
  }
}

/** Convierte issues de Zod al formato de errores por campo del formulario. */
export async function zodErrors(error: z.ZodError): Promise<FormState> {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return { ok: false, error: "Revisa los campos marcados", fieldErrors };
}
