"use client";

import { useActionState, useEffect } from "react";
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

export type EditableUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
};

export function UserForm({ user, onDone }: { user?: EditableUser; onDone?: () => void }) {
  const [state, action] = useActionState(upsertUser, initialFormState);
  const err = (f: string) => state.fieldErrors?.[f];
  const editing = Boolean(user);

  useEffect(() => {
    if (state.ok) onDone?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <form action={action} className="space-y-4">
      <FormStateHandler state={state} />
      {editing ? <input type="hidden" name="id" value={user!.id} /> : null}
      <Field label="Nombre *" htmlFor="u-name" error={err("name")}>
        <Input id="u-name" name="name" defaultValue={user?.name} required />
      </Field>
      <Field label="Email *" htmlFor="u-email" error={err("email")}>
        <Input id="u-email" name="email" type="email" defaultValue={user?.email} required />
      </Field>
      <Field
        label={editing ? "Contraseña" : "Contraseña *"}
        htmlFor="u-password"
        error={err("password")}
        hint={editing ? "Déjala en blanco para no cambiarla" : "Mínimo 8 caracteres"}
      >
        <Input
          id="u-password"
          name="password"
          type="password"
          minLength={8}
          required={!editing}
          autoComplete="new-password"
        />
      </Field>
      <Field label="Rol" htmlFor="u-role">
        <Select id="u-role" name="role" defaultValue={user?.role ?? "EDITOR"}>
          <option value="EDITOR">Editor</option>
          <option value="ADMIN">Admin</option>
          <option value="SUPER_ADMIN">Super Admin</option>
        </Select>
      </Field>
      <label className="flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-mist-800">Activo</span>
        <Switch name="active" defaultChecked={user?.active ?? true} />
      </label>
      <div className="flex items-center gap-3">
        <SubmitButton className={editing ? undefined : "w-full"}>
          {editing ? "Guardar cambios" : "Crear usuario"}
        </SubmitButton>
        {editing && onDone ? (
          <button
            type="button"
            onClick={onDone}
            className="pressable inline-flex h-11 items-center justify-center rounded-full px-5 text-sm font-semibold text-mist-600 transition-colors hover:bg-mist-100"
          >
            Cancelar
          </button>
        ) : null}
      </div>
    </form>
  );
}
