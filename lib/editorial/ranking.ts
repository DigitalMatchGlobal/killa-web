import type { Article } from "./types";

/**
 * Reglas de portada y de listados, en una sola función pura.
 *
 *  - TAPA: la decide el equipo a mano (`is_featured`). Si hay más de una, la
 *    publicación más reciente; si no hay ninguna, la más reciente sin más (la
 *    prioridad no interviene en la tapa).
 *  - LISTADOS (más noticias, secciones, subsecciones, "otras notas"): peso
 *    editorial (`priority`, 5 = alta) y, a igual peso, la más reciente.
 *
 * Las consultas a Postgres ordenan con el mismo criterio
 * (`priority desc, published_at desc, id`). Esta versión existe para el
 * fallback estático y para testear la regla sin base: el test de integración
 * verifica después que el SQL coincida.
 */

function timeOf(article: Article): number {
  return article.publishedAt ? Date.parse(article.publishedAt) : 0;
}

/** Más reciente primero; desempate estable por id para que no bailen entre renders. */
export function compareByRecency(a: Article, b: Article): number {
  const aTime = timeOf(a);
  const bTime = timeOf(b);
  if (aTime !== bTime) return bTime - aTime;
  return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
}

/** Orden de listados: mayor prioridad primero; a igual prioridad, la más reciente. */
export function compareEditorialRank(a: Article, b: Article): number {
  if (a.priority !== b.priority) return b.priority - a.priority;
  return compareByRecency(a, b);
}

export function sortByEditorialRank(articles: Article[]): Article[] {
  return [...articles].sort(compareEditorialRank);
}

/**
 * La noticia principal: la destacada manual más reciente. Si el equipo todavía
 * no marcó ninguna, se usa la publicación más reciente para no dejar la tapa vacía.
 */
export function pickFeatured(articles: Article[]): Article | null {
  const published = articles.filter((article) => article.status === "published");
  if (published.length === 0) return null;
  const marked = published.filter((article) => article.isFeatured);
  return [...(marked.length > 0 ? marked : published)].sort(compareByRecency)[0];
}

/** Listado de notas publicadas por peso editorial, sin la principal. */
export function pickLatest(
  articles: Article[],
  options: { excludeId?: string | null; limit?: number } = {},
): Article[] {
  const { excludeId = null, limit } = options;
  const latest = articles
    .filter((article) => article.status === "published" && article.id !== excludeId)
    .sort(compareEditorialRank);

  return typeof limit === "number" ? latest.slice(0, limit) : latest;
}

const STALE_PRIORITY_DAYS = 7;

/**
 * Una nota publicada con prioridad alta hace más de una semana: la prioridad no
 * vence sola, así que el panel avisa para que el equipo decida si la baja.
 */
export function hasStalePriority(
  article: Pick<Article, "status" | "priority" | "publishedAt">,
  now: number = Date.now(),
): boolean {
  if (article.status !== "published" || article.priority <= 3 || !article.publishedAt) return false;
  return now - Date.parse(article.publishedAt) > STALE_PRIORITY_DAYS * 24 * 60 * 60 * 1000;
}

export type PriorityGroup = { key: "tapa" | "alta" | "normal" | "baja"; label: string; hint: string };

/**
 * Bloque en el que cae una nota publicada, en el mismo orden en que el portal
 * las muestra. Lo usa el panel para agrupar la pestaña "Publicadas".
 */
export function priorityGroupOf(article: Pick<Article, "isFeatured" | "priority">): PriorityGroup {
  if (article.isFeatured) return { key: "tapa", label: "Noticia de tapa", hint: "La que ocupa el bloque grande de la portada" };
  if (article.priority >= 4) return { key: "alta", label: "Prioridad alta", hint: "Van primero en los listados" };
  if (article.priority === 3) return { key: "normal", label: "Prioridad normal", hint: "Orden por fecha, la más nueva primero" };
  return { key: "baja", label: "Prioridad baja", hint: "Van al final de los listados" };
}
