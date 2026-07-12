"use client";

import { useActionState } from "react";
import type { Page, PageBlock } from "@prisma/client";
import { upsertPage } from "@/app/admin/_actions/content";
import {
  Field,
  FormStateHandler,
  SubmitButton,
  initialFormState,
} from "@/components/admin/form-helpers";
import { AdminCard } from "@/components/admin/ui";
import { ImageUpload } from "@/components/admin/image-upload";
import { BlockEditor, type EditableBlock } from "@/components/admin/block-editor";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

export function PageForm({
  page,
  canPublish,
}: {
  page?: Page & { blocks: PageBlock[] };
  canPublish: boolean;
}) {
  const [state, action] = useActionState(upsertPage, initialFormState);
  const err = (f: string) => state.fieldErrors?.[f];

  const defaultBlocks: EditableBlock[] =
    page?.blocks.map((b) => ({
      type: b.type,
      data: (b.data ?? {}) as Record<string, unknown>,
      visible: b.visible,
    })) ?? [];

  return (
    <form action={action} className="space-y-6">
      <FormStateHandler state={state} />
      {page ? <input type="hidden" name="id" value={page.id} /> : null}

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          <AdminCard title="Página">
            <div className="space-y-5">
              <Field label="Título *" htmlFor="title" error={err("title")}>
                <Input id="title" name="title" defaultValue={page?.title} required />
              </Field>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field
                  label="Slug (URL)"
                  htmlFor="slug"
                  hint={page?.system ? "Página de sistema: el slug es fijo" : "Se genera solo si lo dejas vacío"}
                >
                  <Input id="slug" name="slug" defaultValue={page?.slug} disabled={page?.system} />
                </Field>
                <Field label="Descripción" htmlFor="description">
                  <Input id="description" name="description" defaultValue={page?.description} />
                </Field>
              </div>
            </div>
          </AdminCard>

          <AdminCard title="Bloques de contenido">
            {page?.system && page.slug !== "home" ? (
              <p className="mb-4 rounded-xl bg-amber-50 px-4 py-3 text-[13px] leading-relaxed text-amber-900">
                Esta es una página de sistema con diseño propio: los bloques que agregues
                aquí complementan el contenido, y sus FAQs se editan en la sección FAQs.
              </p>
            ) : null}
            <BlockEditor name="blocks" defaultBlocks={defaultBlocks} />
          </AdminCard>
        </div>

        <div className="space-y-6">
          <AdminCard title="Publicación">
            <Field label="Estado" htmlFor="status">
              <Select id="status" name="status" defaultValue={page?.status ?? "DRAFT"} disabled={!canPublish}>
                <option value="DRAFT">Borrador</option>
                <option value="PUBLISHED">Publicada</option>
                <option value="HIDDEN">Oculta</option>
              </Select>
            </Field>
          </AdminCard>

          <AdminCard title="SEO">
            <div className="space-y-5">
              <Field label="SEO title" htmlFor="seoTitle">
                <Input id="seoTitle" name="seoTitle" defaultValue={page?.seoTitle} />
              </Field>
              <Field label="SEO description" htmlFor="seoDescription">
                <Textarea id="seoDescription" name="seoDescription" defaultValue={page?.seoDescription} className="min-h-[70px]" maxLength={200} />
              </Field>
              <Field label="Canonical URL" htmlFor="canonicalUrl" hint="Déjalo vacío para usar la URL propia">
                <Input id="canonicalUrl" name="canonicalUrl" type="url" defaultValue={page?.canonicalUrl} />
              </Field>
              <ImageUpload name="ogImageUrl" label="Imagen OG (para compartir)" defaultValue={page?.ogImageUrl} folder="paginas" />
              <label className="flex items-center justify-between gap-3">
                <span className="text-sm font-semibold text-mist-800">No indexar (noindex)</span>
                <Switch name="noIndex" defaultChecked={page?.noIndex} />
              </label>
            </div>
          </AdminCard>

          <div className="flex justify-end">
            <SubmitButton>{page ? "Guardar cambios" : "Crear página"}</SubmitButton>
          </div>
        </div>
      </div>
    </form>
  );
}
