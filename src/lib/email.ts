/**
 * Envío de correo transaccional vía Resend (API REST, sin dependencia).
 * No-op silencioso si RESEND_API_KEY no está configurada, para que el flujo
 * (ej. guardar el mensaje de contacto) nunca falle por falta de email.
 *
 * Env requeridas para activar:
 *   RESEND_API_KEY   — API key de Resend
 *   EMAIL_FROM       — remitente verificado, ej. "Palmas Mall <no-reply@palmasmall.com>"
 *                      (sin dominio verificado, usar "onboarding@resend.dev" para pruebas)
 */

type SendEmailInput = {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
};

export async function sendEmail({ to, subject, html, replyTo }: SendEmailInput): Promise<
  { ok: true } | { ok: false; skipped?: boolean; error?: string }
> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[email] RESEND_API_KEY no configurada — se omite el envío");
    return { ok: false, skipped: true };
  }
  const from = process.env.EMAIL_FROM || "Palmas Mall <onboarding@resend.dev>";

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to, subject, html, reply_to: replyTo }),
    });
    if (!res.ok) {
      const detail = await res.text();
      console.error(`[email] Resend ${res.status}: ${detail}`);
      return { ok: false, error: `Resend ${res.status}` };
    }
    return { ok: true };
  } catch (error) {
    console.error("[email] error de red enviando correo", error);
    return { ok: false, error: "network" };
  }
}

function esc(s: string): string {
  return s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]!));
}

/** HTML simple para la notificación de un mensaje del formulario de contacto. */
export function contactEmailHtml(msg: {
  name: string;
  lastName?: string;
  email: string;
  phone?: string;
  city?: string;
  subject?: string;
  kind: string;
  message: string;
}): string {
  const row = (label: string, value?: string) =>
    value ? `<tr><td style="padding:6px 12px;color:#6b7280;font-weight:600">${esc(label)}</td><td style="padding:6px 12px;color:#111827">${esc(value)}</td></tr>` : "";
  return `
  <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;max-width:560px;margin:0 auto">
    <h2 style="color:#066939;margin:0 0 4px">Nuevo mensaje de contacto</h2>
    <p style="color:#6b7280;margin:0 0 16px">Palmas Mall · formulario web</p>
    <table style="width:100%;border-collapse:collapse;background:#f9fafb;border-radius:12px;overflow:hidden">
      ${row("Nombre", `${msg.name} ${msg.lastName || ""}`.trim())}
      ${row("Email", msg.email)}
      ${row("Teléfono", msg.phone)}
      ${row("Ciudad", msg.city)}
      ${row("Tipo", msg.kind)}
      ${row("Asunto", msg.subject)}
    </table>
    <p style="margin:16px 0 6px;color:#6b7280;font-weight:600">Mensaje</p>
    <p style="white-space:pre-wrap;color:#111827;line-height:1.6;background:#f9fafb;padding:12px;border-radius:12px">${esc(msg.message)}</p>
  </div>`;
}
