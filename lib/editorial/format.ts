/**
 * Formato de fechas del portal.
 *
 * La zona se fija a mano en `America/Argentina/Salta`: si no, el servidor
 * formatea en UTC y el navegador en la hora local, y React tira un error de
 * hidratación por una nota publicada cerca de la medianoche.
 */

const TIME_ZONE = "America/Argentina/Salta";

const longDate = new Intl.DateTimeFormat("es-AR", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: TIME_ZONE,
});

const shortDate = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "short",
  timeZone: TIME_ZONE,
});

const dateTime = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: TIME_ZONE,
});

/** "30 de agosto de 2026". Cadena vacía si la nota no está publicada. */
export function formatArticleDate(iso: string | null): string {
  if (!iso) return "";
  const parsed = new Date(iso);
  return Number.isNaN(parsed.getTime()) ? "" : longDate.format(parsed);
}

/** "30 AGO", para las tarjetas de la portada. */
export function formatCardDate(iso: string | null): string {
  if (!iso) return "";
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return "";
  return shortDate.format(parsed).replace(".", "").toUpperCase();
}

/** "30/08/2026 12:00", para el panel. */
export function formatPanelDate(iso: string | null): string {
  if (!iso) return "—";
  const parsed = new Date(iso);
  return Number.isNaN(parsed.getTime()) ? "—" : dateTime.format(parsed);
}

export const STATUS_LABELS: Record<string, string> = {
  draft: "Borrador",
  published: "Publicada",
  archived: "Archivada",
};
