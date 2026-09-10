/**
 * Envío de correo transaccional con dos drivers, elegidos por variables de entorno:
 *
 *   1. SMTP (nodemailer) — si SMTP_HOST está definida.
 *      En el cPanel de Palmas Mall el correo vive en el mismo servidor que la app,
 *      así que basta SMTP_HOST=localhost / SMTP_PORT=25 (sin TLS ni credenciales).
 *      Desde fuera del servidor: SMTP_HOST=palmasmall.com, SMTP_PORT=587,
 *      SMTP_USER y SMTP_PASS de una cuenta real del dominio.
 *
 *   2. Resend (API REST) — si no hay SMTP_HOST pero sí RESEND_API_KEY.
 *
 * Sin ninguna de las dos: no-op silencioso, para que el flujo que llama
 * (ej. guardar el mensaje de contacto) nunca falle por falta de email.
 *
 * Remitente: EMAIL_FROM, ej. "Palmas Mall <no-reply@palmasmall.com>".
 * Destinatarios del formulario: CONTACT_EMAIL_TO (varios separados por coma).
 */

import nodemailer, { type Transporter } from "nodemailer";

type SendEmailInput = {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
};

type SendEmailResult = { ok: true } | { ok: false; skipped?: boolean; error?: string };

const DEFAULT_FROM = "Palmas Mall <no-reply@palmasmall.com>";

/** Transporter cacheado: crear uno por envío abre una conexión SMTP de más. */
let transporter: Transporter | null = null;

function getTransporter(): Transporter | null {
  const host = process.env.SMTP_HOST;
  if (!host) return null;
  if (transporter) return transporter;

  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  // El exim local del cPanel escucha en 25 sin TLS ni auth; 465 es SMTPS.
  const isLocal = host === "localhost" || host === "127.0.0.1";

  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: user && pass ? { user, pass } : undefined,
    // El certificado del servidor local suele no coincidir con "localhost".
    tls: isLocal ? { rejectUnauthorized: false } : undefined,
  });
  return transporter;
}

async function sendViaSmtp(input: SendEmailInput, transport: Transporter): Promise<SendEmailResult> {
  try {
    await transport.sendMail({
      from: process.env.EMAIL_FROM || DEFAULT_FROM,
      to: input.to,
      subject: input.subject,
      html: input.html,
      replyTo: input.replyTo,
    });
    return { ok: true };
  } catch (error) {
    console.error("[email] SMTP falló", error);
    return { ok: false, error: "smtp" };
  }
}

async function sendViaResend(input: SendEmailInput, apiKey: string): Promise<SendEmailResult> {
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || DEFAULT_FROM,
        to: input.to,
        subject: input.subject,
        html: input.html,
        reply_to: input.replyTo,
      }),
    });
    if (!res.ok) {
      console.error(`[email] Resend ${res.status}: ${await res.text()}`);
      return { ok: false, error: `Resend ${res.status}` };
    }
    return { ok: true };
  } catch (error) {
    console.error("[email] error de red enviando por Resend", error);
    return { ok: false, error: "network" };
  }
}

export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const transport = getTransporter();
  if (transport) return sendViaSmtp(input, transport);

  const apiKey = process.env.RESEND_API_KEY;
  if (apiKey) return sendViaResend(input, apiKey);

  console.warn("[email] sin SMTP_HOST ni RESEND_API_KEY — se omite el envío");
  return { ok: false, skipped: true };
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
