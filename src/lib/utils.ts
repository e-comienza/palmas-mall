import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(text: string): string {
  return text
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

const MONTHS_ES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

export function formatDateEs(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return `${d.getDate()} de ${MONTHS_ES[d.getMonth()]} de ${d.getFullYear()}`;
}

export function formatDateShortEs(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return `${d.getDate()} ${MONTHS_ES[d.getMonth()].slice(0, 3)}. ${d.getFullYear()}`;
}

export function siteUrl(path = ""): string {
  const base = (process.env.PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Parse JSON column values that should be string arrays. */
export function asStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((v): v is string => typeof v === "string");
  return [];
}

export type HoursEntry = { days: string; hours: string };

export function asHours(value: unknown): HoursEntry[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (v): v is HoursEntry =>
      typeof v === "object" && v !== null && "days" in v && "hours" in v,
  );
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return `${text.slice(0, length - 1).trimEnd()}…`;
}

export function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

/**
 * Esquemas de URL admitidos en un `href` que viene de la base de datos.
 * Sin este filtro, un `javascript:…` guardado desde el admin se convierte en
 * XSS en cuanto un visitante hace clic en el enlace.
 */
const SAFE_URL_SCHEMES = ["http:", "https:", "mailto:", "tel:"];

/**
 * Devuelve la URL si es segura, o `fallback` si no lo es.
 * Acepta rutas relativas ("/directorio", "#seccion", "?q=x").
 */
export function safeUrl(url: string | null | undefined, fallback = "#"): string {
  if (!url) return fallback;
  const trimmed = url.trim();
  if (!trimmed) return fallback;
  // Rutas internas: no llevan esquema, no hay nada que validar.
  if (/^[/#?]/.test(trimmed)) return trimmed;
  // Sin esquema explícito (ej. "palmasmall.com") tampoco es ejecutable.
  if (!/^[a-z][a-z0-9+.-]*:/i.test(trimmed)) return trimmed;
  try {
    const parsed = new URL(trimmed);
    return SAFE_URL_SCHEMES.includes(parsed.protocol.toLowerCase()) ? trimmed : fallback;
  } catch {
    return fallback;
  }
}
