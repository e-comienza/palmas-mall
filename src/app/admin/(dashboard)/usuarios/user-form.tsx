"use client";

import { useActionState } from "react";
import { upsertUser } from "@/app/admin/_actions/misc";
import {
  Field,
  FormStateHandler,
  SubmitButton,
  initialFormState,
} from "@/components/admin/form-helpers";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

export function UserForm() {
  const [state, action] = useActionState(upsertUser, initialFormState);
  const err = (f: string) => state.fieldErrors?.[f];

  return (
    <form action={action} className="space-y-4">
      <FormStateHandler state={state} />
      <Field label="Nombre *" htmlFor="u-name" error={err("name")}>
        <Input id="u-name" name="name" required />
      </Field>
      <Field label="Email *" htmlFor="u-email" error={err("email")}>
        <Input id="u-email" name="email" type="email" required />
      </Field>
      <Field label="Contraseña *" htmlFor="u-password" error={err("password")} hint="Mínimo 8 caracteres">
        <Input id="u-password" name="password" type="password" minLength={8} required />
      </Field>
      <Field label="Rol" htmlFor="u-role">
        <Select id="u-role" name="role" defaultValue="EDITOR">
          <option value="EDITOR">Editor</option>
          <option value="ADMIN">Admin</option>
          <option value="SUPER_ADMIN">Super Admin</option>
        </Select>
      </Field>
      <label className="flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-mist-800">Activo</span>
        <Switch name="active" defaultChecked />
      </label>
      <SubmitButton className="w-full">Crear usuario</SubmitButton>
    </form>
  );
}
