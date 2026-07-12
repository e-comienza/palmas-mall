"use client";

import { useActionState, useState } from "react";
import type { Faq } from "@prisma/client";
import { upsertFaq } from "@/app/admin/_actions/misc";
import {
  Field,
  FormStateHandler,
  SubmitButton,
  initialFormState,
} from "@/components/admin/form-helpers";
import { AdminCard } from "@/components/admin/ui";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

type Option = { id: string; label: string };

export function FaqForm({
  faq,
  pages,
  locales,
  events,
}: {
  faq?: Faq;
  pages: Option[];
  locales: Option[];
  events: Option[];
}) {
  const [state, action] = useActionState(upsertFaq, initialFormState);
  const [scope, setScope] = useState(faq?.scope ?? "GLOBAL");
  const err = (f: string) => state.fieldErrors?.[f];

  return (
    <form action={action} className="mx-auto max-w-2xl space-y-6">
      <FormStateHandler state={state} />
      {faq ? <input type="hidden" name="id" value={faq.id} /> : null}

      <AdminCard>
        <div className="space-y-5">
          <Field label="Pregunta *" htmlFor="question" error={err("question")}>
            <Input id="question" name="question" defaultValue={faq?.question} required />
          </Field>
          <Field label="Respuesta *" htmlFor="answer" error={err("answer")}>
            <Textarea id="answer" name="answer" defaultValue={faq?.answer} className="min-h-[120px]" required />
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Dónde aparece" htmlFor="scope">
              <Select id="scope" name="scope" value={scope} onChange={(e) => setScope(e.target.value as typeof scope)}>
                <option value="GLOBAL">Global (home + AEO)</option>
                <option value="PAGE">Una página</option>
                <option value="LOCAL">Un local</option>
                <option value="EVENT">Un evento</option>
              </Select>
            </Field>
            {scope === "PAGE" ? (
              <Field label="Página" htmlFor="pageId">
                <Select id="pageId" name="pageId" defaultValue={faq?.pageId ?? ""}>
                  {pages.map((p) => (
                    <option key={p.id} value={p.id}>{p.label}</option>
                  ))}
                </Select>
              </Field>
            ) : null}
            {scope === "LOCAL" ? (
              <Field label="Local" htmlFor="localId">
                <Select id="localId" name="localId" defaultValue={faq?.localId ?? ""}>
                  {locales.map((l) => (
                    <option key={l.id} value={l.id}>{l.label}</option>
                  ))}
                </Select>
              </Field>
            ) : null}
            {scope === "EVENT" ? (
              <Field label="Evento" htmlFor="eventId">
                <Select id="eventId" name="eventId" defaultValue={faq?.eventId ?? ""}>
                  {events.map((e) => (
                    <option key={e.id} value={e.id}>{e.label}</option>
                  ))}
                </Select>
              </Field>
            ) : null}
          </div>
          <div className="flex items-center justify-between gap-6">
            <Field label="Orden" htmlFor="order" className="w-28">
              <Input id="order" name="order" type="number" defaultValue={faq?.order ?? 0} />
            </Field>
            <label className="flex items-center gap-3">
              <span className="text-sm font-semibold text-mist-800">Visible</span>
              <Switch name="visible" defaultChecked={faq?.visible ?? true} />
            </label>
          </div>
        </div>
      </AdminCard>

      <div className="flex justify-end">
        <SubmitButton>{faq ? "Guardar cambios" : "Crear FAQ"}</SubmitButton>
      </div>
    </form>
  );
}
