"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSiteSettings } from "@/lib/settings";
import { sendEmail, contactEmailHtml } from "@/lib/email";
import { rateLimit, clientIp } from "@/lib/rate-limit";

/** El formulario es público: sin tope, inunda la tabla y dispara emails. */
const CONTACT_LIMIT = 3;
const CONTACT_WINDOW_MS = 10 * 60 * 1000; // 10 min

const contactSchema = z.object({
  name: z.string().min(2, "Escribe tu nombre").max(80),
  lastName: z.string().max(80).optional().default(""),
  city: z.string().max(80).optional().default(""),
  email: z.string().email("Escribe un email válido"),
  phone: z.string().max(30).optional().default(""),
  subject: z.string().max(120).optional().default(""),
  kind: z.enum(["queja", "reclamo", "sugerencia", "comercial"]).default("sugerencia"),
  message: z.string().min(10, "Cuéntanos un poco más (mínimo 10 caracteres)").max(3000),
  // honeypot anti-spam: debe llegar vacío
  website: z.string().max(0).optional().default(""),
});

export type ContactState = {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
};

export async function submitContact(
  _prev: ContactState,
  formData: FormData,
): Promise<ContactState> {
  const ip = await clientIp();
  const limited = rateLimit(`contact:${ip}`, CONTACT_LIMIT, CONTACT_WINDOW_MS);
  if (!limited.ok) {
    const minutes = Math.max(1, Math.ceil(limited.retryAfterSeconds / 60));
    return {
      ok: false,
      error: `Ya enviaste varios mensajes. Vuelve a intentarlo en ${minutes} minuto${minutes === 1 ? "" : "s"}.`,
    };
  }

  const raw = Object.fromEntries(formData.entries());
  const parsed = contactSchema.safeParse(raw);

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { ok: false, error: "Revisa los campos marcados", fieldErrors };
  }

  try {
    const { website, ...data } = parsed.data;
    void website; // honeypot: solo se valida, no se guarda
    await prisma.contactMessage.create({ data });

    // Notificación por email (no bloquea: el mensaje ya quedó guardado en el admin)
    try {
      const settings = await getSiteSettings();
      // CONTACT_EMAIL_TO admite varios destinatarios separados por coma,
      // ej. "palmasmall@palmasmall.com, aga@hbc.com.co"
      const raw = process.env.CONTACT_EMAIL_TO || settings.email || "";
      const to = raw.split(",").map((e) => e.trim()).filter(Boolean);
      if (to.length) {
        await sendEmail({
          to,
          replyTo: data.email,
          subject: `Nuevo mensaje de contacto: ${data.name}${data.subject ? ` · ${data.subject}` : ""}`,
          html: contactEmailHtml(data),
        });
      }
    } catch (emailError) {
      console.error("[contact] no se pudo enviar el email de notificación", emailError);
    }

    return { ok: true };
  } catch (error) {
    console.error("[contact] error guardando mensaje", error);
    return { ok: false, error: "No pudimos enviar tu mensaje. Intenta de nuevo." };
  }
}
