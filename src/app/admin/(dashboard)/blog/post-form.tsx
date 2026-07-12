"use client";

import { useActionState } from "react";
import type { BlogPost } from "@prisma/client";
import { upsertPost } from "@/app/admin/_actions/content";
import {
  Field,
  FormStateHandler,
  SubmitButton,
  initialFormState,
} from "@/components/admin/form-helpers";
import { AdminCard } from "@/components/admin/ui";
import { ImageUpload } from "@/components/admin/image-upload";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { asStringArray } from "@/lib/utils";

function toDateInput(date?: Date | null): string {
  if (!date) return "";
  return new Date(date).toISOString().slice(0, 10);
}

export function PostForm({ post, canPublish }: { post?: BlogPost; canPublish: boolean }) {
  const [state, action] = useActionState(upsertPost, initialFormState);
  const err = (f: string) => state.fieldErrors?.[f];

  return (
    <form action={action} className="space-y-6">
      <FormStateHandler state={state} />
      {post ? <input type="hidden" name="id" value={post.id} /> : null}

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          <AdminCard title="Artículo">
            <div className="space-y-5">
              <Field label="Título *" htmlFor="title" error={err("title")}>
                <Input id="title" name="title" defaultValue={post?.title} required />
              </Field>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Slug (URL)" htmlFor="slug" hint="Se genera solo si lo dejas vacío">
                  <Input id="slug" name="slug" defaultValue={post?.slug} />
                </Field>
                <Field label="Categoría" htmlFor="category">
                  <Input id="category" name="category" defaultValue={post?.category ?? "Noticias"} list="post-categories" />
                  <datalist id="post-categories">
                    <option value="Noticias" />
                    <option value="Food & Drinks" />
                    <option value="Eventos" />
                    <option value="Familia" />
                    <option value="Palmas Mall" />
                  </datalist>
                </Field>
              </div>
              <Field label="Extracto" htmlFor="excerpt" error={err("excerpt")} hint="Resumen para tarjetas y SEO">
                <Textarea id="excerpt" name="excerpt" defaultValue={post?.excerpt} className="min-h-[70px]" maxLength={400} />
              </Field>
              <Field label="Contenido" htmlFor="content">
                <RichTextEditor name="content" defaultValue={post?.content} placeholder="Escribe el artículo…" />
              </Field>
              <Field label="Tags (separados por coma)" htmlFor="tags">
                <Input id="tags" name="tags" defaultValue={asStringArray(post?.tags).join(", ")} />
              </Field>
            </div>
          </AdminCard>

          <AdminCard title="SEO">
            <div className="space-y-5">
              <Field label="SEO title" htmlFor="seoTitle">
                <Input id="seoTitle" name="seoTitle" defaultValue={post?.seoTitle} />
              </Field>
              <Field label="SEO description" htmlFor="seoDescription">
                <Textarea id="seoDescription" name="seoDescription" defaultValue={post?.seoDescription} className="min-h-[70px]" maxLength={200} />
              </Field>
            </div>
          </AdminCard>
        </div>

        <div className="space-y-6">
          <AdminCard title="Publicación">
            <div className="space-y-5">
              <Field label="Estado" htmlFor="status">
                <Select id="status" name="status" defaultValue={post?.status ?? "DRAFT"} disabled={!canPublish}>
                  <option value="DRAFT">Borrador</option>
                  <option value="PUBLISHED">Publicado</option>
                  <option value="HIDDEN">Oculto</option>
                  <option value="ARCHIVED">Archivado</option>
                </Select>
              </Field>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Autor" htmlFor="author">
                  <Input id="author" name="author" defaultValue={post?.author ?? "Palmas Mall"} />
                </Field>
                <Field label="Fecha de publicación" htmlFor="publishedAt">
                  <Input id="publishedAt" name="publishedAt" type="date" defaultValue={toDateInput(post?.publishedAt)} />
                </Field>
              </div>
              <label className="flex items-center justify-between gap-3">
                <span className="text-sm font-semibold text-mist-800">Destacado</span>
                <Switch name="featured" defaultChecked={post?.featured} />
              </label>
              <label className="flex items-center justify-between gap-3">
                <span className="text-sm font-semibold text-mist-800">Contenido placeholder</span>
                <Switch name="isPlaceholder" defaultChecked={post?.isPlaceholder} />
              </label>
            </div>
          </AdminCard>

          <AdminCard title="Imagen principal">
            <ImageUpload name="coverUrl" defaultValue={post?.coverUrl} folder="blog" />
          </AdminCard>

          <div className="flex justify-end">
            <SubmitButton>{post ? "Guardar cambios" : "Crear artículo"}</SubmitButton>
          </div>
        </div>
      </div>
    </form>
  );
}
