import "server-only";

import { supabaseUrl } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import { requireEditorialStaff } from "./auth";
import {
  isArticleStatus,
  mapPanelArticle,
  paginate,
  type ArticleRow,
  type ArticleStatus,
  type Paginated,
  type PanelArticle,
} from "./types";

/**
 * Lecturas del panel editorial.
 *
 * Van con la sesión del editor, así que la policy `articles_select_staff` es la
 * que habilita ver borradores y archivadas. Cada función exige staff antes de
 * consultar: si la sesión se cayó, redirige al login en vez de devolver una
 * lista vacía que parecería "no hay noticias".
 *
 * El embed del autor usa el hint explícito `!articles_author_id_fkey` porque
 * `articles` tiene DOS FK a `profiles` (author_id y updated_by). Sin el hint,
 * PostgREST no sabe por cuál embeber y responde PGRST201.
 */

const PANEL_COLUMNS = `
  id, title, slug, excerpt, body, category_id, featured_image_path, image_alt,
  status, priority, author_id, updated_by, published_at, created_at, updated_at,
  category:categories ( name, slug ),
  author:profiles!articles_author_id_fkey ( display_name )
`;

export const PANEL_PAGE_SIZE = 20;

export type PanelListOptions = {
  status?: ArticleStatus | "all";
  categoryId?: string | null;
  search?: string | null;
  page?: number;
  pageSize?: number;
};

/** Listado del panel. Sin filtro de estado trae todo (borradores incluidos). */
export async function listPanelArticles(
  options: PanelListOptions = {},
): Promise<Paginated<PanelArticle>> {
  await requireEditorialStaff();

  const page = options.page && options.page > 0 ? Math.trunc(options.page) : 1;
  const pageSize =
    options.pageSize && options.pageSize > 0
      ? Math.min(Math.trunc(options.pageSize), 100)
      : PANEL_PAGE_SIZE;
  const from = (page - 1) * pageSize;

  const supabase = await createSupabaseServerClient();
  let query = supabase.from("articles").select(PANEL_COLUMNS, { count: "exact" });

  if (options.status && options.status !== "all" && isArticleStatus(options.status)) {
    query = query.eq("status", options.status);
  }
  if (options.categoryId) {
    query = query.eq("category_id", options.categoryId);
  }
  if (options.search) {
    // `%` y `,` rompen la sintaxis del filtro `or` de PostgREST: se escapan.
    const term = options.search.replace(/[%,]/g, " ").trim();
    if (term) query = query.or(`title.ilike.%${term}%,excerpt.ilike.%${term}%`);
  }

  const { data, error, count } = await query
    // Los borradores no tienen published_at, así que el orden del panel es por
    // última modificación: es lo que el editor espera ver arriba.
    .order("updated_at", { ascending: false })
    .range(from, from + pageSize - 1);

  if (error) throw new Error(`No se pudo listar el panel: ${error.message}`);

  const items = (data ?? []).map((row) => mapPanelArticle(row as unknown as ArticleRow, supabaseUrl()));
  return paginate(items, count ?? items.length, page, pageSize);
}

export async function getPanelArticleById(id: string): Promise<PanelArticle | null> {
  await requireEditorialStaff();

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("articles")
    .select(PANEL_COLUMNS)
    .eq("id", id)
    .maybeSingle<ArticleRow>();

  if (error) throw new Error(`No se pudo leer la nota: ${error.message}`);
  return data ? mapPanelArticle(data, supabaseUrl()) : null;
}

/** Contadores del tablero. */
export async function getPanelCounts(): Promise<Record<ArticleStatus | "total", number>> {
  await requireEditorialStaff();
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase.from("articles").select("status");
  if (error) throw new Error(`No se pudieron contar las notas: ${error.message}`);

  const counts: Record<ArticleStatus | "total", number> = {
    draft: 0,
    published: 0,
    archived: 0,
    total: 0,
  };

  for (const row of data ?? []) {
    const status = (row as { status: string }).status;
    if (isArticleStatus(status)) counts[status] += 1;
    counts.total += 1;
  }

  return counts;
}
