"use client";

import { useActionState } from "react";
import type { Event, Sede } from "@prisma/client";
import { upsertEvent } from "@/app/admin/_actions/content";
import {
  Field,
  FormStateHandler,
  SubmitButton,
  initialFormState,
} from "@/components/admin/form-helpers";
import { AdminCard } from "@/components/admin/ui";
import { ImageUpload, GalleryUpload } from "@/components/admin/image-upload";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { asStringArray } from "@/lib/utils";

function toLocalInput(date?: Date | null): string {
  if (!date) return "";
  const d = new Date(date);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

export function EventForm({
  event,
  sedes,
  canPublish,
}: {
  event?: Event;
  sedes: Sede[];
  canPublish: boolean;
}) {
  const [state, action] = useActionState(upsertEvent, initialFormState);
  const err = (f: string) => state.fieldErrors?.[f];

  return (
    <form action={action} className="space-y-6">
      <FormStateHandler state={state} />
      {event ? <input type="hidden" name="id" value={event.id} /> : null}

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          <AdminCard title="Información del evento">
            <div className="space-y-5">
              <Field label="Título *" htmlFor="title" error={err("title")}>
                <Input id="title" name="title" defaultValue={event?.title} required />
              </Field>
              <Field label="Slug (URL)" htmlFor="slug" hint="Se genera solo si lo dejas vacío">
                <Input id="slug" name="slug" defaultValue={event?.slug} />
              </Field>
              <Field label="Descripción corta" htmlFor="shortDescription" error={err("shortDescription")}>
                <Textarea id="shortDescription" name="shortDescription" defaultValue={event?.shortDescription} className="min-h-[70px]" maxLength={300} />
              </Field>
              <Field label="Descripción larga" htmlFor="longDescription">
                <RichTextEditor name="longDescription" defaultValue={event?.longDescription} placeholder="Describe el evento…" />
              </Field>
            </div>
          </AdminCard>

          <AdminCard title="Fecha y lugar">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Inicio *" htmlFor="startsAt" error={err("startsAt")}>
                <Input id="startsAt" name="startsAt" type="datetime-local" defaultValue={toLocalInput(event?.startsAt)} required />
              </Field>
              <Field label="Fin" htmlFor="endsAt">
                <Input id="endsAt" name="endsAt" type="datetime-local" defaultValue={toLocalInput(event?.endsAt)} />
              </Field>
              <Field label="Hora (texto visible)" htmlFor="timeLabel" hint="Ej.: 5:00 p.m. – 11:00 p.m.">
                <Input id="timeLabel" name="timeLabel" defaultValue={event?.timeLabel} />
              </Field>
              <Field label="Lugar dentro del mall" htmlFor="location">
                <Input id="location" name="location" defaultValue={event?.location} placeholder="Food Hall" />
              </Field>
              <Field label="Organizador" htmlFor="organizer">
                <Input id="organizer" name="organizer" defaultValue={event?.organizer} placeholder="Palmas Mall" />
              </Field>
              <Field label="Sede" htmlFor="sedeId">
                <Select id="sedeId" name="sedeId" defaultValue={event?.sedeId ?? sedes.find((s) => s.isMain)?.id ?? ""}>
                  {sedes.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </Select>
              </Field>
            </div>
          </AdminCard>

          <AdminCard title="Entradas">
            <div className="grid gap-5 sm:grid-cols-3">
              <Field label="Precio" htmlFor="price">
                <Select id="price" name="price" defaultValue={event?.price ?? "FREE"}>
                  <option value="FREE">Gratis</option>
                  <option value="PAID">De pago</option>
                </Select>
              </Field>
              <Field label="Detalle del precio" htmlFor="priceDetail">
                <Input id="priceDetail" name="priceDetail" defaultValue={event?.priceDetail} placeholder="Desde $30.000" />
              </Field>
              <Field label="Link de registro" htmlFor="registrationUrl">
                <Input id="registrationUrl" name="registrationUrl" type="url" defaultValue={event?.registrationUrl} />
              </Field>
            </div>
          </AdminCard>

          <AdminCard title="SEO">
            <div className="space-y-5">
              <Field label="SEO title" htmlFor="seoTitle">
                <Input id="seoTitle" name="seoTitle" defaultValue={event?.seoTitle} />
              </Field>
              <Field label="SEO description" htmlFor="seoDescription">
                <Textarea id="seoDescription" name="seoDescription" defaultValue={event?.seoDescription} className="min-h-[70px]" maxLength={200} />
              </Field>
            </div>
          </AdminCard>
        </div>

        <div className="space-y-6">
          <AdminCard title="Publicación">
            <div className="space-y-5">
              <Field label="Estado" htmlFor="status">
                <Select id="status" name="status" defaultValue={event?.status ?? "DRAFT"} disabled={!canPublish}>
                  <option value="DRAFT">Borrador</option>
                  <option value="PUBLISHED">Publicado</option>
                  <option value="HIDDEN">Oculto</option>
                  <option value="ARCHIVED">Finalizado / archivado</option>
                </Select>
              </Field>
              <label className="flex items-center justify-between gap-3">
                <span className="text-sm font-semibold text-mist-800">Destacado</span>
                <Switch name="featured" defaultChecked={event?.featured} />
              </label>
              <label className="flex items-center justify-between gap-3">
                <span className="text-sm font-semibold text-mist-800">Contenido placeholder</span>
                <Switch name="isPlaceholder" defaultChecked={event?.isPlaceholder} />
              </label>
            </div>
          </AdminCard>

          <AdminCard title="Imágenes">
            <div className="space-y-5">
              <ImageUpload name="coverUrl" label="Imagen principal" defaultValue={event?.coverUrl} folder="eventos" />
              <GalleryUpload name="gallery" label="Galería" defaultValue={asStringArray(event?.gallery)} folder="eventos" />
            </div>
          </AdminCard>

          <div className="flex justify-end">
            <SubmitButton>{event ? "Guardar cambios" : "Crear evento"}</SubmitButton>
          </div>
        </div>
      </div>
    </form>
  );
}
