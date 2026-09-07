/**
 * Contrato tipado del backend editorial de Killa TV.
 *
 * El frontend consume SÓLO estos tipos y las funciones de `queries.ts` /
 * `actions.ts`. Nadie arma un `.from("articles")` por su cuenta: así el día que
 * cambie una columna hay un único lugar que ajustar y el ranking de portada no
 * se reimplementa distinto en cada página.
 */

export const ARTICLE_STATUSES = ["draft", "published", "archived"] as const;
export type ArticleStatus = (typeof ARTICLE_STATUSES)[number];

export const ARTICLE_PRIORITIES = [1, 2, 3, 4, 5] as const;
export type ArticlePriority = (typeof ARTICLE_PRIORITIES)[number];

export type ArticleCategory = {
  name: string;
  slug: string;
};

/** Contrato público de una nota. Es el que pidió el brief, sin agregados. */
export type Article = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  category: ArticleCategory;
  featuredImageUrl: string;
  imageAlt: string;
  status: ArticleStatus;
  priority: ArticlePriority;
  isFeatured: boolean;
  /**
   * Firma editorial pública. `null` = la nota se publica sin firma.
   *
   * NO tiene relación con `authorId`/`updatedById`, que son auditoría interna:
   * la firma es una decisión editorial por nota (puede decir "Redacción Killa
   * TV", o el nombre de alguien que no cargó la nota, o nada).
   */
  byline: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

/**
 * Lo que además necesita el panel: la key cruda de la imagen (para reemplazarla
 * o borrarla) y la trazabilidad de quién tocó qué.
 */
export type PanelArticle = Article & {
  featuredImagePath: string | null;
  categoryId: string | null;
  authorId: string | null;
  authorName: string | null;
  updatedById: string | null;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
};

export type EditorialRole = "admin" | "editor";

export type EditorialProfile = {
  id: string;
  email: string;
  displayName: string;
  role: EditorialRole;
};

/** Una página de resultados. La paginación existe desde el backend aunque la
 *  primera interfaz muestre pocas noticias. */
export type Paginated<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
  hasMore: boolean;
};

/**
 * Categoría de reemplazo cuando una nota quedó sin sección (se borró la
 * categoría: el FK es `on delete set null`). Se muestra tal cual en vez de
 * atribuirle una sección que el equipo no eligió.
 */
export const ORPHAN_CATEGORY: ArticleCategory = {
  name: "Sin sección",
  slug: "sin-seccion",
};

/** Fila cruda como la devuelve PostgREST. Interno del módulo. */
export type ArticleRow = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  body: string | null;
  category_id: string | null;
  featured_image_path: string | null;
  image_alt: string | null;
  status: string;
  priority: number;
  is_featured: boolean;
  byline?: string | null;
  /**
   * Auditoría interna. Sólo la trae el select del panel: los selects públicos
   * no piden estas columnas, así que llegan `undefined` y `mapArticle` no las
   * mira. La firma pública vive en `byline`.
   */
  author_id?: string | null;
  updated_by?: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  /**
   * Los embeds llegan como objeto (relación a-uno) en tiempo de ejecución, pero
   * sin tipos generados de la base supabase-js los infiere como array. Se
   * aceptan las dos formas y `oneOf()` normaliza, en vez de mentirle al
   * compilador con un cast.
   */
  category?: EmbeddedOne<{ name: string; slug: string }>;
  author?: EmbeddedOne<{ display_name: string }>;
};

type EmbeddedOne<T> = T | T[] | null;

function oneOf<T>(embedded: EmbeddedOne<T> | undefined): T | null {
  if (!embedded) return null;
  return Array.isArray(embedded) ? (embedded[0] ?? null) : embedded;
}

/** Largo máximo de la firma. Espeja el CHECK `articles_byline_largo`. */
export const BYLINE_MAX = 100;

/**
 * Recorta la firma y convierte vacío o sólo espacios en `null`.
 * Es la misma regla que aplica el trigger `articles_normalize_byline_trg`.
 */
export function normalizeByline(value: string | null | undefined): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

/** Texto de la firma listo para renderizar, o `null` si la nota no lleva firma. */
export function bylineLabel(byline: string | null | undefined): string | null {
  const clean = normalizeByline(byline);
  return clean ? `Por ${clean}` : null;
}

export function isArticleStatus(value: unknown): value is ArticleStatus {
  return (
    typeof value === "string" && (ARTICLE_STATUSES as readonly string[]).includes(value)
  );
}

function toPriority(value: number): ArticlePriority {
  const rounded = Math.trunc(value);
  return ((rounded >= 1 && rounded <= 5 ? rounded : 1) as ArticlePriority);
}

/**
 * Resuelve la URL de la imagen destacada.
 *
 * Convive con dos orígenes a propósito:
 *  - una ruta que arranca con "/" es un asset de `public/` (así quedó el
 *    contenido migrado de lib/tv-news.ts, cuyas fotos ya viven en el repo);
 *  - cualquier otra cosa es una key del bucket `killa-news`.
 */
export function resolveFeaturedImageUrl(
  path: string | null | undefined,
  origin: string,
): string {
  if (!path) return "";
  if (path.startsWith("/") || path.startsWith("http")) return path;
  return `${origin.replace(/\/$/, "")}/storage/v1/object/public/killa-news/${path}`;
}

export function mapArticle(row: ArticleRow, supabaseOrigin: string): Article {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt ?? "",
    body: row.body ?? "",
    category: (() => {
      const category = oneOf(row.category);
      return category ? { name: category.name, slug: category.slug } : ORPHAN_CATEGORY;
    })(),
    featuredImageUrl: resolveFeaturedImageUrl(row.featured_image_path, supabaseOrigin),
    imageAlt: row.image_alt ?? "",
    status: isArticleStatus(row.status) ? row.status : "draft",
    priority: toPriority(row.priority),
    isFeatured: row.is_featured,
    // Se normaliza igual acá: una fila cargada antes del trigger, o por una vía
    // que lo saltee, no debe renderizar "Por" seguido de nada.
    byline: normalizeByline(row.byline),
    publishedAt: row.published_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapPanelArticle(row: ArticleRow, supabaseOrigin: string): PanelArticle {
  return {
    ...mapArticle(row, supabaseOrigin),
    featuredImagePath: row.featured_image_path,
    categoryId: row.category_id,
    authorId: row.author_id ?? null,
    authorName: oneOf(row.author)?.display_name ?? null,
    updatedById: row.updated_by ?? null,
  };
}

export function paginate<T>(
  items: T[],
  total: number,
  page: number,
  pageSize: number,
): Paginated<T> {
  const pageCount = pageSize > 0 ? Math.max(1, Math.ceil(total / pageSize)) : 1;
  return {
    items,
    total,
    page,
    pageSize,
    pageCount,
    hasMore: page < pageCount,
  };
}
