"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSiteSettings } from "@/lib/settings";
import { sendEmail, contactEmailHtml } from "@/lib/email";

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
      const to = process.env.CONTACT_EMAIL_TO || settings.email;
      if (to) {
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
