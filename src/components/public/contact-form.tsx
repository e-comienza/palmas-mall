"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { WhatsappLogo, PaperPlaneTilt } from "@phosphor-icons/react";
import { submitContact, type ContactState } from "@/app/actions/contact";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const initialState: ContactState = { ok: false };

export function ContactForm({
  subjectOptions,
  whatsapp,
}: {
  subjectOptions?: string[];
  whatsapp?: string;
}) {
  const [state, action, pending] = useActionState(submitContact, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) {
      toast.success("¡Mensaje enviado! Te responderemos pronto.");
      formRef.current?.reset();
    } else if (state.error && state.error !== "Revisa los campos marcados") {
      toast.error(state.error);
    }
  }, [state]);

  const err = (field: string) => state.fieldErrors?.[field];

  return (
    <form ref={formRef} action={action} className="space-y-5" noValidate>
      {/* honeypot anti-spam */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="ct-name">Nombre *</Label>
          <Input id="ct-name" name="name" autoComplete="given-name" required aria-invalid={!!err("name")} />
          {err("name") ? <p className="text-sm text-red-700">{err("name")}</p> : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="ct-lastname">Apellidos</Label>
          <Input id="ct-lastname" name="lastName" autoComplete="family-name" />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="ct-email">Email *</Label>
          <Input id="ct-email" name="email" type="email" autoComplete="email" required aria-invalid={!!err("email")} />
          {err("email") ? <p className="text-sm text-red-700">{err("email")}</p> : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="ct-phone">Teléfono</Label>
          <Input id="ct-phone" name="phone" type="tel" autoComplete="tel" inputMode="tel" />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="ct-city">Ciudad</Label>
          <Input id="ct-city" name="city" autoComplete="address-level2" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ct-kind">Tipo de mensaje</Label>
          <Select id="ct-kind" name="kind" defaultValue="sugerencia">
            <option value="sugerencia">Sugerencia</option>
            <option value="queja">Queja</option>
            <option value="reclamo">Reclamo</option>
            <option value="comercial">Comercial / patrocinio</option>
          </Select>
        </div>
      </div>

      {subjectOptions?.length ? (
        <div className="space-y-2">
          <Label htmlFor="ct-subject">Asunto</Label>
          <Select id="ct-subject" name="subject" defaultValue={subjectOptions[0]}>
            {subjectOptions.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </Select>
        </div>
      ) : (
        <div className="space-y-2">
          <Label htmlFor="ct-subject">Asunto</Label>
          <Input id="ct-subject" name="subject" />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="ct-message">Mensaje *</Label>
        <Textarea id="ct-message" name="message" required minLength={10} aria-invalid={!!err("message")} />
        {err("message") ? <p className="text-sm text-red-700">{err("message")}</p> : null}
      </div>

      <div className="flex flex-col gap-3 pt-1 sm:flex-row">
        <button
          type="submit"
          disabled={pending}
          className="pressable inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-palm-700 px-7 text-base font-semibold text-white transition-colors hover:bg-palm-800 disabled:opacity-60"
        >
          <PaperPlaneTilt size={18} weight="bold" />
          {pending ? "Enviando…" : "Enviar mensaje"}
        </button>
        {whatsapp ? (
          <a
            href={`https://wa.me/${whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="pressable inline-flex h-12 items-center justify-center gap-2 rounded-full border border-palm-700/30 bg-white px-7 text-base font-semibold text-palm-800 transition-colors hover:bg-palm-50"
          >
            <WhatsappLogo size={20} weight="fill" /> Mejor por WhatsApp
          </a>
        ) : null}
      </div>
    </form>
  );
}
