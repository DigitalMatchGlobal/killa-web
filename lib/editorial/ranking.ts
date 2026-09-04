import type { Article } from "./types";

/**
 * Reglas de portada, en una sola función pura.
 *
 * La consulta a Postgres ordena con el mismo criterio
 * (`order by priority desc, published_at desc`) y el índice
 * `articles_published_ranking_idx` está hecho para eso. Esta versión existe
 * para el fallback estático y, sobre todo, para poder testear la regla sin
 * base: el test de integración verifica después que el SQL coincida.
 */

/** Orden editorial: prioridad más alta primero; a igual prioridad, más reciente. */
export function compareEditorialRank(a: Article, b: Article): number {
  if (a.priority !== b.priority) return b.priority - a.priority;

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
 * La noticia principal: la publicada con mayor prioridad. En empate gana la
 * más reciente. Si no hay prioridades especiales, es simplemente la última.
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
