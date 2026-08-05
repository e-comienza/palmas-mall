import { formatDateEs, formatDateShortEs } from "./utils";

/**
 * Los eventos pueden no tener fecha: anuncios permanentes ("Ya abrimos"),
 * recurrentes ("Todos los sábados") o con duración (startsAt → endsAt).
 * `dateLabel` es texto libre y siempre manda sobre la fecha calculada.
 */
export type EventDates = {
  startsAt: Date | null;
  endsAt?: Date | null;
  dateLabel?: string;
};

/** Texto de fecha visible ("" si el evento no tiene fecha ni etiqueta). */
export function eventDateLabel(event: EventDates, opts?: { short?: boolean }): string {
  if (event.dateLabel) return event.dateLabel;
  if (!event.startsAt) return "";
  const fmt = opts?.short ? formatDateShortEs : formatDateEs;
  const start = fmt(event.startsAt);
  if (event.endsAt && event.endsAt.toDateString() !== event.startsAt.toDateString()) {
    return `${start} al ${fmt(event.endsAt)}`;
  }
  return start;
}

/** Un evento sin fecha nunca vence: se muestra hasta que lo despubliquen. */
export function eventIsPast(event: EventDates, now = new Date()): boolean {
  const end = event.endsAt ?? event.startsAt;
  return end ? end < now : false;
}
