"use client";

import { useActionState } from "react";
import type { Sede } from "@prisma/client";
import { updateSede } from "@/app/admin/_actions/misc";
import {
  Field,
  FormStateHandler,
  SubmitButton,
  initialFormState,
} from "@/components/admin/form-helpers";
import { AdminCard } from "@/components/admin/ui";
import { Input } from "@/components/ui/input";

export function SedeForm({ sede }: { sede: Sede }) {
  const [state, action] = useActionState(updateSede, initialFormState);

  return (
    <AdminCard title={`${sede.name}${sede.isMain ? " (principal)" : ""}`}>
      <FormStateHandler state={state} />
      <form action={action} className="grid gap-4 sm:grid-cols-2">
        <input type="hidden" name="id" value={sede.id} />
        <Field label="Nombre" htmlFor={`s-${sede.id}-name`}>
          <Input id={`s-${sede.id}-name`} name="name" defaultValue={sede.name} />
        </Field>
        <Field label="Ciudad" htmlFor={`s-${sede.id}-city`}>
          <Input id={`s-${sede.id}-city`} name="city" defaultValue={sede.city} />
        </Field>
        <Field label="Dirección" htmlFor={`s-${sede.id}-address`} className="sm:col-span-2">
          <Input id={`s-${sede.id}-address`} name="address" defaultValue={sede.address} />
        </Field>
        <Field label="Teléfono" htmlFor={`s-${sede.id}-phone`}>
          <Input id={`s-${sede.id}-phone`} name="phone" defaultValue={sede.phone} />
        </Field>
        <Field label="WhatsApp" htmlFor={`s-${sede.id}-wa`}>
          <Input id={`s-${sede.id}-wa`} name="whatsapp" defaultValue={sede.whatsapp} />
        </Field>
        <Field label="Email" htmlFor={`s-${sede.id}-email`}>
          <Input id={`s-${sede.id}-email`} name="email" type="email" defaultValue={sede.email} />
        </Field>
        <Field label="Horario" htmlFor={`s-${sede.id}-hours`}>
          <Input id={`s-${sede.id}-hours`} name="openingHours" defaultValue={sede.openingHours} />
        </Field>
        <Field label="Waze" htmlFor={`s-${sede.id}-waze`}>
          <Input id={`s-${sede.id}-waze`} name="wazeUrl" defaultValue={sede.wazeUrl} />
        </Field>
        <Field label="Google Maps" htmlFor={`s-${sede.id}-maps`}>
          <Input id={`s-${sede.id}-maps`} name="mapsUrl" defaultValue={sede.mapsUrl} />
        </Field>
        <div className="flex justify-end sm:col-span-2">
          <SubmitButton className="h-10 px-5">Guardar sede</SubmitButton>
        </div>
      </form>
    </AdminCard>
  );
}
