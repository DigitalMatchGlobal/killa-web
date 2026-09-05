import type { Article } from "./types";

/**
 * Reglas de portada, en una sola función pura.
 *
 * La consulta a Postgres ordena con el mismo criterio
 * (destacada manual y luego `published_at desc`). Esta versión existe
 * para el fallback estático y, sobre todo, para poder testear la regla sin
 * base: el test de integración verifica después que el SQL coincida.
 */

/** Orden de tapa: destacada manual primero; luego publicación más reciente. */
export function compareEditorialRank(a: Article, b: Article): number {
  if (a.isFeatured !== b.isFeatured) return a.isFeatured ? -1 : 1;

  const aTime = a.publishedAt ? Date.parse(a.publishedAt) : 0;
  const bTime = b.publishedAt ? Date.parse(b.publishedAt) : 0;
  if (aTime !== bTime) return bTime - aTime;

  // Desempate final estable, para que dos notas publicadas en el mismo
  // instante no bailen entre renders.
  return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
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
  return sortByEditorialRank(published)[0];
}

/** "Últimas publicaciones": cronológico descendente, sin la principal. */
export function pickLatest(
  articles: Article[],
  options: { excludeId?: string | null; limit?: number } = {},
): Article[] {
  const { excludeId = null, limit } = options;
  const latest = articles
    .filter((article) => article.status === "published" && article.id !== excludeId)
    .sort((a, b) => {
      const aTime = a.publishedAt ? Date.parse(a.publishedAt) : 0;
      const bTime = b.publishedAt ? Date.parse(b.publishedAt) : 0;
      if (aTime !== bTime) return bTime - aTime;
      return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
    });

  return typeof limit === "number" ? latest.slice(0, limit) : latest;
}
