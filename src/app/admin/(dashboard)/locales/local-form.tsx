"use client";

import { useActionState } from "react";
import type { Local, LocalCategory, Sede } from "@prisma/client";
import { upsertLocal } from "@/app/admin/_actions/content";
import {
  Field,
  FormStateHandler,
  SubmitButton,
  initialFormState,
} from "@/components/admin/form-helpers";
import { AdminCard } from "@/components/admin/ui";
import { ImageUpload, GalleryUpload } from "@/components/admin/image-upload";
import { HoursEditor } from "@/components/admin/hours-editor";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { asHours, asStringArray } from "@/lib/utils";

export function LocalForm({
  local,
  categories,
  sedes,
  canPublish,
}: {
  local?: Local;
  categories: LocalCategory[];
  sedes: Sede[];
  canPublish: boolean;
}) {
  const [state, action] = useActionState(upsertLocal, initialFormState);
  const err = (f: string) => state.fieldErrors?.[f];

  return (
    <form action={action} className="space-y-6">
      <FormStateHandler state={state} />
      {local ? <input type="hidden" name="id" value={local.id} /> : null}

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          <AdminCard title="Información básica">
            <div className="space-y-5">
              <Field label="Nombre *" htmlFor="name" error={err("name")}>
                <Input id="name" name="name" defaultValue={local?.name} required />
              </Field>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Slug (URL)" htmlFor="slug" hint="Se genera solo si lo dejas vacío">
                  <Input id="slug" name="slug" defaultValue={local?.slug} placeholder="mi-local" />
                </Field>
                <Field label="Categoría" htmlFor="categoryId">
                  <Select id="categoryId" name="categoryId" defaultValue={local?.categoryId ?? ""}>
                    <option value="">Sin categoría</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.group === "food-drinks" ? "Food & Drinks" : "Shop & More"})
                      </option>
                    ))}
                  </Select>
                </Field>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Sede" htmlFor="sedeId">
                  <Select id="sedeId" name="sedeId" defaultValue={local?.sedeId ?? sedes.find((s) => s.isMain)?.id ?? ""}>
                    {sedes.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </Select>
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Piso / zona" htmlFor="floor">
                    <Input id="floor" name="floor" defaultValue={local?.floor} placeholder="Terraza" />
                  </Field>
                  <Field label="No. local" htmlFor="unitNumber">
                    <Input id="unitNumber" name="unitNumber" defaultValue={local?.unitNumber} placeholder="07" />
                  </Field>
                </div>
              </div>
              <Field label="Descripción corta" htmlFor="shortDescription" error={err("shortDescription")} hint="Aparece en las tarjetas del directorio (máx. 300)">
                <Textarea id="shortDescription" name="shortDescription" defaultValue={local?.shortDescription} className="min-h-[70px]" maxLength={300} />
              </Field>
              <Field label="Descripción larga" htmlFor="longDescription">
                <Textarea id="longDescription" name="longDescription" defaultValue={local?.longDescription} className="min-h-[140px]" />
              </Field>
              <Field label="Tags (separados por coma)" htmlFor="tags">
                <Input id="tags" name="tags" defaultValue={asStringArray(local?.tags).join(", ")} placeholder="sushi, asiática, food hall" />
              </Field>
            </div>
          </AdminCard>

          <AdminCard title="Contacto y enlaces">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Teléfono" htmlFor="phone">
                <Input id="phone" name="phone" type="tel" defaultValue={local?.phone} />
              </Field>
              <Field label="WhatsApp (solo dígitos con país)" htmlFor="whatsapp">
                <Input id="whatsapp" name="whatsapp" defaultValue={local?.whatsapp} placeholder="573001234567" />
              </Field>
              <Field label="Email" htmlFor="email">
                <Input id="email" name="email" type="email" defaultValue={local?.email} />
              </Field>
              <Field label="Sitio web" htmlFor="websiteUrl" error={err("websiteUrl")}>
                <Input id="websiteUrl" name="websiteUrl" type="url" defaultValue={local?.websiteUrl} placeholder="https://…" />
              </Field>
              <Field label="Instagram" htmlFor="instagramUrl" error={err("instagramUrl")}>
                <Input id="instagramUrl" name="instagramUrl" type="url" defaultValue={local?.instagramUrl} placeholder="https://instagram.com/…" />
              </Field>
              <Field label="Facebook" htmlFor="facebookUrl">
                <Input id="facebookUrl" name="facebookUrl" type="url" defaultValue={local?.facebookUrl} />
              </Field>
              <Field label="TikTok" htmlFor="tiktokUrl">
                <Input id="tiktokUrl" name="tiktokUrl" type="url" defaultValue={local?.tiktokUrl} />
              </Field>
              <Field label="Menú (PDF o link)" htmlFor="menuUrl" hint="Solo para restaurantes">
                <Input id="menuUrl" name="menuUrl" type="url" defaultValue={local?.menuUrl} placeholder="https://menupp.co/…" />
              </Field>
              <Field label="Link de reservas" htmlFor="reservationUrl">
                <Input id="reservationUrl" name="reservationUrl" type="url" defaultValue={local?.reservationUrl} placeholder="https://…" />
              </Field>
              <Field label="Link de delivery" htmlFor="deliveryUrl">
                <Input id="deliveryUrl" name="deliveryUrl" type="url" defaultValue={local?.deliveryUrl} placeholder="https://…" />
              </Field>
            </div>
          </AdminCard>

          <AdminCard title="Horario">
            <HoursEditor name="openingHours" defaultValue={asHours(local?.openingHours)} />
          </AdminCard>

          <AdminCard title="SEO del local">
            <div className="space-y-5">
              <Field label="SEO title" htmlFor="seoTitle" hint="Si lo dejas vacío se usa el nombre del local">
                <Input id="seoTitle" name="seoTitle" defaultValue={local?.seoTitle} />
              </Field>
              <Field label="SEO description" htmlFor="seoDescription">
                <Textarea id="seoDescription" name="seoDescription" defaultValue={local?.seoDescription} className="min-h-[70px]" maxLength={200} />
              </Field>
            </div>
          </AdminCard>
        </div>

        <div className="space-y-6">
          <AdminCard title="Publicación">
            <div className="space-y-5">
              <Field label="Estado" htmlFor="status">
                <Select id="status" name="status" defaultValue={local?.status ?? "DRAFT"} disabled={!canPublish}>
                  <option value="DRAFT">Borrador</option>
                  <option value="PUBLISHED">Publicado</option>
                  <option value="HIDDEN">Oculto</option>
                  <option value="ARCHIVED">Archivado</option>
                </Select>
                {!canPublish ? (
                  <p className="text-[12px] text-mist-500">Los editores guardan borradores; un admin publica.</p>
                ) : null}
              </Field>
              <div className="space-y-3">
                <label className="flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold text-mist-800">Destacado en el home</span>
                  <Switch name="featured" defaultChecked={local?.featured} />
                </label>
                <label className="flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold text-mist-800">Es restaurante</span>
                  <Switch name="isRestaurant" defaultChecked={local?.isRestaurant} />
                </label>
                <label className="flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold text-mist-800">Próximamente</span>
                  <Switch name="comingSoon" defaultChecked={local?.comingSoon} />
                </label>
                <label className="flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold text-mist-800">Contenido placeholder</span>
                  <Switch name="isPlaceholder" defaultChecked={local?.isPlaceholder} />
                </label>
              </div>
              <Field label="Orden" htmlFor="order" hint="Menor número = aparece primero">
                <Input id="order" name="order" type="number" defaultValue={local?.order ?? 0} className="w-28" />
              </Field>
            </div>
          </AdminCard>

          <AdminCard title="Imágenes">
            <div className="space-y-5">
              <ImageUpload name="logoUrl" label="Logo" defaultValue={local?.logoUrl} folder="locales" aspect="aspect-square max-w-[180px]" />
              <ImageUpload name="coverUrl" label="Imagen principal" defaultValue={local?.coverUrl} folder="locales" />
              <GalleryUpload name="gallery" label="Galería" defaultValue={asStringArray(local?.gallery)} folder="locales" />
            </div>
          </AdminCard>

          <div className="flex justify-end gap-3">
            <SubmitButton>{local ? "Guardar cambios" : "Crear local"}</SubmitButton>
          </div>
        </div>
      </div>
    </form>
  );
}
