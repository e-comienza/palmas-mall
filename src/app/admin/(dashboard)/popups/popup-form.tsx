"use client";

import { useActionState } from "react";
import type { Popup } from "@prisma/client";
import { upsertPopup } from "@/app/admin/_actions/misc";
import {
  Field,
  FormStateHandler,
  SubmitButton,
  initialFormState,
} from "@/components/admin/form-helpers";
import { AdminCard } from "@/components/admin/ui";
import { ImageUpload } from "@/components/admin/image-upload";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

function toLocalInput(date?: Date | null): string {
  if (!date) return "";
  const d = new Date(date);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

export function PopupForm({ popup }: { popup?: Popup }) {
  const [state, action] = useActionState(upsertPopup, initialFormState);
  const err = (f: string) => state.fieldErrors?.[f];

  return (
    <form action={action} className="space-y-6">
      <FormStateHandler state={state} />
      {popup ? <input type="hidden" name="id" value={popup.id} /> : null}

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          <AdminCard title="Contenido del popup">
            <div className="space-y-5">
              <Field label="Nombre interno *" htmlFor="internalName" error={err("internalName")} hint="Solo lo ve el equipo">
                <Input id="internalName" name="internalName" defaultValue={popup?.internalName} required />
              </Field>
              <Field label="Título visible" htmlFor="title">
                <Input id="title" name="title" defaultValue={popup?.title} />
              </Field>
              <Field label="Texto" htmlFor="body">
                <Textarea id="body" name="body" defaultValue={popup?.body} className="min-h-[80px]" />
              </Field>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Texto del botón" htmlFor="ctaLabel">
                  <Input id="ctaLabel" name="ctaLabel" defaultValue={popup?.ctaLabel} />
                </Field>
                <Field label="URL del botón" htmlFor="ctaUrl">
                  <Input id="ctaUrl" name="ctaUrl" defaultValue={popup?.ctaUrl} placeholder="/eventos" />
                </Field>
              </div>
              <ImageUpload name="imageUrl" label="Imagen (opcional)" defaultValue={popup?.imageUrl} folder="popups" />
            </div>
          </AdminCard>

          <AdminCard title="Dónde y cuándo aparece">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Páginas" htmlFor="placement">
                <Select id="placement" name="placement" defaultValue={popup?.placement ?? "ALL"}>
                  <option value="ALL">Todas las páginas</option>
                  <option value="HOME">Solo el home</option>
                  <option value="LOCALES">Locales</option>
                  <option value="EVENTOS">Eventos</option>
                  <option value="BLOG">Blog</option>
                  <option value="CUSTOM">Ruta personalizada</option>
                </Select>
              </Field>
              <Field label="Ruta personalizada" htmlFor="customPath" hint="Solo si elegiste “Ruta personalizada”">
                <Input id="customPath" name="customPath" defaultValue={popup?.customPath} placeholder="/food-drinks" />
              </Field>
              <Field label="Desde" htmlFor="startsAt">
                <Input id="startsAt" name="startsAt" type="datetime-local" defaultValue={toLocalInput(popup?.startsAt)} />
              </Field>
              <Field label="Hasta" htmlFor="endsAt">
                <Input id="endsAt" name="endsAt" type="datetime-local" defaultValue={toLocalInput(popup?.endsAt)} />
              </Field>
            </div>
          </AdminCard>
        </div>

        <div className="space-y-6">
          <AdminCard title="Comportamiento">
            <div className="space-y-5">
              <label className="flex items-center justify-between gap-3">
                <span className="text-sm font-semibold text-mist-800">Activo</span>
                <Switch name="active" defaultChecked={popup?.active} />
              </label>
              <Field label="Frecuencia" htmlFor="frequency">
                <Select id="frequency" name="frequency" defaultValue={popup?.frequency ?? "ONCE_PER_SESSION"}>
                  <option value="ONCE_PER_SESSION">Una vez por sesión</option>
                  <option value="ONCE_PER_DAYS">Una vez cada X días</option>
                  <option value="ALWAYS">Siempre</option>
                </Select>
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Cada X días" htmlFor="frequencyDays">
                  <Input id="frequencyDays" name="frequencyDays" type="number" min={1} defaultValue={popup?.frequencyDays ?? 7} />
                </Field>
                <Field label="Delay (segundos)" htmlFor="delaySeconds">
                  <Input id="delaySeconds" name="delaySeconds" type="number" min={1} defaultValue={popup?.delaySeconds ?? 4} />
                </Field>
              </div>
              <Field label="Audiencia" htmlFor="audience">
                <Select id="audience" name="audience" defaultValue={popup?.audience ?? "ALL"}>
                  <option value="ALL">Todos</option>
                  <option value="MOBILE">Solo móvil</option>
                  <option value="DESKTOP">Solo desktop</option>
                </Select>
              </Field>
              <label className="flex items-center justify-between gap-3">
                <span className="text-sm font-semibold text-mist-800">Exit intent (desktop)</span>
                <Switch name="exitIntent" defaultChecked={popup?.exitIntent} />
              </label>
            </div>
          </AdminCard>

          <div className="flex justify-end">
            <SubmitButton>{popup ? "Guardar cambios" : "Crear popup"}</SubmitButton>
          </div>
        </div>
      </div>
    </form>
  );
}
