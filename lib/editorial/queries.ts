import "server-only";

import { hasSupabaseConfig, supabaseUrl } from "@/lib/supabase/env";
import { createSupabasePublicClient } from "@/lib/supabase/server";

import { fallbackArticles } from "./fallback";
import { pickFeatured, pickLatest } from "./ranking";
import {
  mapArticle,
  paginate,
  type Article,
  type ArticleRow,
  type Category,
  type Paginated,
} from "./types";

/**
 * Lecturas públicas del portal.
 *
 * Todas van con la clave anónima, así que **la RLS es la que decide**: la
 * policy `articles_select_published` hace que un borrador o una nota archivada
 * no puedan salir de acá ni por error de programación. El filtro
 * `.eq("status", "published")` que igual escribimos es explicitud, no la
 * defensa.
 *
 * `server-only` está arriba a propósito: si alguien importa este módulo desde
 * un componente de cliente, el build falla en vez de mandar consultas al
 * navegador.
 */

const ARTICLE_COLUMNS = `
  id, title, slug, excerpt, body, category_id, featured_image_path, image_alt,
  status, priority, author_id, updated_by, published_at, created_at, updated_at,
  category:categories ( name, slug )
`;

/**
 * Igual que el anterior pero con `!inner`.
 *
 * Sin el inner join, un filtro sobre la tabla embebida (`category.slug`) NO
 * descarta filas: PostgREST devuelve la nota con `category: null`. Con inner,
 * el filtro se aplica de verdad. Es el detalle que convierte "filtrar por
 * categoría" en algo que funciona.
 */
const ARTICLE_COLUMNS_CATEGORY_INNER = `
  id, title, slug, excerpt, body, category_id, featured_image_path, image_alt,
  status, priority, author_id, updated_by, published_at, created_at, updated_at,
  category:categories!inner ( name, slug )
`;

export const DEFAULT_PAGE_SIZE = 9;

function warnFallback(operation: string) {
  console.warn(
    `[killa-tv] ${operation}: sin configuración de Supabase, se usa el contenido estático de lib/tv-news.ts. Completá .env.local (ver supabase/README.md).`,
  );
}

function rangeFor(page: number, pageSize: number) {
  const safePage = Number.isFinite(page) && page > 0 ? Math.trunc(page) : 1;
  const safeSize =
    Number.isFinite(pageSize) && pageSize > 0 ? Math.min(Math.trunc(pageSize), 50) : DEFAULT_PAGE_SIZE;
  const from = (safePage - 1) * safeSize;
  return { from, to: from + safeSize - 1, page: safePage, pageSize: safeSize };
}

/** La noticia principal de la portada. */
export async function getFeaturedArticle(): Promise<Article | null> {
  if (!hasSupabaseConfig()) {
    warnFallback("getFeaturedArticle");
    return pickFeatured(fallbackArticles);
  }

  const supabase = createSupabasePublicClient();
  const { data, error } = await supabase
    .from("articles")
    .select(ARTICLE_COLUMNS)
    .eq("status", "published")
    .order("priority", { ascending: false })
    .order("published_at", { ascending: false })
    .limit(1)
    .maybeSingle<ArticleRow>();

  if (error) throw new Error(`No se pudo leer la noticia destacada: ${error.message}`);
  return data ? mapArticle(data, supabaseUrl()) : null;
}

/**
 * "Últimas publicaciones": `published_at` descendente, excluyendo la principal.
 *
 * `excludeId` lo pasa la página con el id que devolvió `getFeaturedArticle()`.
 * No se recalcula el destacado acá: una sola fuente para la regla.
 */
export async function getLatestArticles(
  options: { page?: number; pageSize?: number; excludeId?: string | null } = {},
): Promise<Paginated<Article>> {
  const { page, pageSize, from, to } = rangeFor(
    options.page ?? 1,
    options.pageSize ?? DEFAULT_PAGE_SIZE,
  );

  if (!hasSupabaseConfig()) {
    warnFallback("getLatestArticles");
    const all = pickLatest(fallbackArticles, { excludeId: options.excludeId ?? null });
    return paginate(all.slice(from, to + 1), all.length, page, pageSize);
  }

  const supabase = createSupabasePublicClient();
  let query = supabase
    .from("articles")
    .select(ARTICLE_COLUMNS, { count: "exact" })
    .eq("status", "published");

  if (options.excludeId) query = query.neq("id", options.excludeId);

  const { data, error, count } = await query
    .order("published_at", { ascending: false })
    .range(from, to);

  if (error) throw new Error(`No se pudieron leer las últimas noticias: ${error.message}`);

  const items = (data ?? []).map((row) => mapArticle(row as unknown as ArticleRow, supabaseUrl()));
  return paginate(items, count ?? items.length, page, pageSize);
}

/** Una nota pública por slug. Devuelve null si no existe o no está publicada. */
export async function getArticleBySlug(slug: string): Promise<Article | null> {
  if (!hasSupabaseConfig()) {
    warnFallback("getArticleBySlug");
    return fallbackArticles.find((article) => article.slug === slug) ?? null;
  }

  const supabase = createSupabasePublicClient();
  const { data, error } = await supabase
    .from("articles")
    .select(ARTICLE_COLUMNS)
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle<ArticleRow>();

  if (error) throw new Error(`No se pudo leer la nota "${slug}": ${error.message}`);
  return data ? mapArticle(data, supabaseUrl()) : null;
}

/** Notas publicadas de una sección. */
export async function getArticlesByCategory(
  categorySlug: string,
  options: { page?: number; pageSize?: number } = {},
): Promise<Paginated<Article>> {
  const { page, pageSize, from, to } = rangeFor(
    options.page ?? 1,
    options.pageSize ?? DEFAULT_PAGE_SIZE,
  );

  if (!hasSupabaseConfig()) {
    warnFallback("getArticlesByCategory");
    const all = pickLatest(fallbackArticles).filter(
      (article) => article.category.slug === categorySlug,
    );
    return paginate(all.slice(from, to + 1), all.length, page, pageSize);
  }

  const supabase = createSupabasePublicClient();
  const { data, error, count } = await supabase
    .from("articles")
    .select(ARTICLE_COLUMNS_CATEGORY_INNER, { count: "exact" })
    .eq("status", "published")
    // El filtro va sobre el alias del embed, no sobre el nombre de la tabla.
    .eq("category.slug", categorySlug)
    .order("published_at", { ascending: false })
    .range(from, to);

  if (error)
    throw new Error(`No se pudieron leer las notas de "${categorySlug}": ${error.message}`);

  const items = (data ?? []).map((row) => mapArticle(row as unknown as ArticleRow, supabaseUrl()));
  return paginate(items, count ?? items.length, page, pageSize);
}

/** Slugs publicados, para `generateStaticParams` y el sitemap. */
export async function getPublishedSlugs(): Promise<string[]> {
  if (!hasSupabaseConfig()) {
    warnFallback("getPublishedSlugs");
    return fallbackArticles.map((article) => article.slug);
  }

  const supabase = createSupabasePublicClient();
  const { data, error } = await supabase
    .from("articles")
    .select("slug")
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (error) throw new Error(`No se pudieron leer los slugs: ${error.message}`);
  return (data ?? []).map((row) => row.slug as string);
}

export async function getCategories(): Promise<Category[]> {
  if (!hasSupabaseConfig()) {
    warnFallback("getCategories");
    return [
      { id: "fallback-noticias", name: "Noticias", slug: "noticias" },
      { id: "fallback-deportes", name: "Deportes", slug: "deportes" },
      { id: "fallback-turismo", name: "Turismo", slug: "turismo" },
    ];
  }

  const supabase = createSupabasePublicClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug")
    .order("name", { ascending: true });

  if (error) throw new Error(`No se pudieron leer las categorías: ${error.message}`);
  return (data ?? []) as Category[];
}

/**
 * Portada completa en un solo lugar: la destacada y las últimas sin ella.
 * Es lo que consume `/tv`, para que la regla de exclusión no se repita.
 */
export async function getTvHomeData(options: { latestLimit?: number } = {}) {
  const featured = await getFeaturedArticle();
  const latest = await getLatestArticles({
    pageSize: options.latestLimit ?? DEFAULT_PAGE_SIZE,
    excludeId: featured?.id ?? null,
  });

  return { featured, latest };
}
