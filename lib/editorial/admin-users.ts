import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { EditorialRole } from "./types";

export type StaffMemberStats = {
  published: number;
  draft: number;
  total: number;
  featuredCount: number;
  completionRate: number;
  latestArticle: {
    title: string;
    slug: string;
    publishedAt: string | null;
    status: string;
  } | null;
  topCategory: {
    name: string;
    percentage: number;
  } | null;
};

export type StaffMemberWithStats = {
  id: string;
  email: string;
  displayName: string;
  role: EditorialRole;
  createdAt: string;
  lastSignInAt: string | null;
  isSuspended: boolean;
  activityLevel: "online" | "recent" | "inactive";
  stats: StaffMemberStats;
};

export type CategoryDiagnosis = {
  id: string;
  name: string;
  slug: string;
  count: number;
  percentage: number;
  status: "solid" | "active" | "low" | "none";
  latestDate: string | null;
};

export type NewsroomPulse = {
  totalStaff: number;
  activeToday: number;
  articlesThisWeek: number;
  totalPublished: number;
  totalDrafts: number;
  globalCompletionRate: number;
  categoryDistribution: CategoryDiagnosis[];
  orphanCategoriesCount: number;
};

type ArticleWithCategory = {
  id: string;
  title: string;
  slug: string;
  author_id: string | null;
  status: string;
  is_featured: boolean;
  published_at: string | null;
  created_at: string;
  category: { id: string; name: string; slug: string } | null;
};

/**
 * Obtiene el listado completo del equipo con métricas editoriales avanzadas
 * y el pulso operativo de la redacción.
 */
export async function getStaffMembersWithStats(): Promise<{
  members: StaffMemberWithStats[];
  pulse: NewsroomPulse;
}> {
  const adminClient = createSupabaseAdminClient();

  // 1. Obtener perfiles
  const { data: profiles, error: profilesError } = await adminClient
    .from("profiles")
    .select("id, display_name, role, created_at")
    .order("created_at", { ascending: true });

  if (profilesError || !profiles) {
    console.error("Error al obtener perfiles:", profilesError);
    return {
      members: [],
      pulse: {
        totalStaff: 0,
        activeToday: 0,
        articlesThisWeek: 0,
        totalPublished: 0,
        totalDrafts: 0,
        globalCompletionRate: 0,
        categoryDistribution: [],
        orphanCategoriesCount: 0,
      },
    };
  }

  // 2. Obtener usuarios de Auth para emails, last_sign_in_at y banned_until
  const { data: authData, error: authError } = await adminClient.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });

  if (authError) {
    console.error("Error al obtener usuarios de auth:", authError);
  }

  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);

  const authUsersMap = new Map<
    string,
    { email: string; lastSignInAt: string | null; isSuspended: boolean; activityLevel: "online" | "recent" | "inactive" }
  >();

  let activeTodayCount = 0;

  if (authData?.users) {
    for (const u of authData.users) {
      const isSuspended = Boolean(u.banned_until && new Date(u.banned_until) > now);
      const lastSignIn = u.last_sign_in_at ? new Date(u.last_sign_in_at) : null;

      let activityLevel: "online" | "recent" | "inactive" = "inactive";
      if (lastSignIn) {
        if (lastSignIn >= twoHoursAgo) activityLevel = "online";
        else if (lastSignIn >= oneWeekAgo) activityLevel = "recent";

        if (lastSignIn >= oneDayAgo) activeTodayCount += 1;
      }

      authUsersMap.set(u.id, {
        email: u.email ?? "",
        lastSignInAt: u.last_sign_in_at ?? null,
        isSuspended,
        activityLevel,
      });
    }
  }

  // 3. Consultar artículos con categoría para métricas editoriales
  const { data: rawArticles, error: articlesError } = await adminClient
    .from("articles")
    .select(`
      id, title, slug, author_id, status, is_featured, published_at, created_at,
      category:categories ( id, name, slug )
    `);

  const articles = (rawArticles ?? []) as unknown as ArticleWithCategory[];

  // Mapas por autor
  const authorArticlesMap = new Map<string, ArticleWithCategory[]>();
  const categoryCountGlobal = new Map<string, number>();
  let publishedThisWeekCount = 0;
  let totalPublishedGlobal = 0;
  let totalDraftsGlobal = 0;

  if (!articlesError && articles) {
    for (const a of articles) {
      if (a.status === "published") {
        totalPublishedGlobal += 1;
        if (a.published_at && new Date(a.published_at) >= oneWeekAgo) {
          publishedThisWeekCount += 1;
        }
      } else if (a.status === "draft") {
        totalDraftsGlobal += 1;
      }

      if (a.category?.name) {
        categoryCountGlobal.set(a.category.name, (categoryCountGlobal.get(a.category.name) ?? 0) + 1);
      }

      if (a.author_id) {
        const list = authorArticlesMap.get(a.author_id) ?? [];
        list.push(a);
        authorArticlesMap.set(a.author_id, list);
      }
    }
  }

  // 3b. Obtener todas las categorías para diagnosticar la cobertura real
  const { data: rawCategories } = await adminClient
    .from("categories")
    .select("id, name, slug")
    .order("name", { ascending: true });

  const allCategories = (rawCategories ?? []) as { id: string; name: string; slug: string }[];
  const categoryStatsMap = new Map<string, { count: number; latestDate: string | null; slug: string; id: string }>();

  for (const c of allCategories) {
    categoryStatsMap.set(c.name, { count: 0, latestDate: null, slug: c.slug, id: c.id });
  }

  // Acumular desde los artículos publicados
  for (const a of articles) {
    if (a.status === "published" && a.category?.name) {
      const existing = categoryStatsMap.get(a.category.name);
      if (existing) {
        const currentLatest = existing.latestDate ? new Date(existing.latestDate).getTime() : 0;
        const articleTime = a.published_at ? new Date(a.published_at).getTime() : 0;
        const newerDate = articleTime > currentLatest ? a.published_at : existing.latestDate;
        existing.count += 1;
        existing.latestDate = newerDate;
      } else {
        categoryStatsMap.set(a.category.name, {
          count: 1,
          latestDate: a.published_at,
          slug: a.category.slug,
          id: a.category.id,
        });
      }
    }
  }

  const totalPublishedWithCat = Array.from(categoryStatsMap.values()).reduce((sum, item) => sum + item.count, 0);

  const categoryDistribution: CategoryDiagnosis[] = Array.from(categoryStatsMap.entries())
    .map(([name, item]) => {
      const percentage = totalPublishedWithCat > 0 ? Math.round((item.count / totalPublishedWithCat) * 100) : 0;
      let status: "solid" | "active" | "low" | "none" = "none";
      if (item.count === 0) status = "none";
      else if (percentage < 15) status = "low";
      else if (percentage <= 35) status = "active";
      else status = "solid";

      return {
        id: item.id,
        name,
        slug: item.slug,
        count: item.count,
        percentage,
        status,
        latestDate: item.latestDate,
      };
    })
    .sort((a, b) => b.count - a.count);

  const orphanCategoriesCount = categoryDistribution.filter((c) => c.count === 0).length;

  const globalTotalNotes = totalPublishedGlobal + totalDraftsGlobal;
  const globalCompletionRate =
    globalTotalNotes > 0 ? Math.round((totalPublishedGlobal / globalTotalNotes) * 100) : 0;

  // 4. Calcular métricas por redactor
  const members: StaffMemberWithStats[] = profiles.map((p) => {
    const authInfo = authUsersMap.get(p.id);
    const authorArticles = authorArticlesMap.get(p.id) ?? [];

    let published = 0;
    let draft = 0;
    let featuredCount = 0;
    const catMap = new Map<string, number>();
    let latestArticle: ArticleWithCategory | null = null;

    for (const a of authorArticles) {
      if (a.status === "published") {
        published += 1;
        if (!latestArticle || new Date(a.published_at || a.created_at) > new Date(latestArticle.published_at || latestArticle.created_at)) {
          latestArticle = a;
        }
      } else if (a.status === "draft") {
        draft += 1;
        if (!latestArticle) latestArticle = a;
      }

      if (a.is_featured) featuredCount += 1;

      if (a.category?.name) {
        catMap.set(a.category.name, (catMap.get(a.category.name) ?? 0) + 1);
      }
    }

    const total = published + draft;
    const completionRate = total > 0 ? Math.round((published / total) * 100) : 0;

    // Categoría principal del redactor
    let topCategory: { name: string; percentage: number } | null = null;
    if (catMap.size > 0) {
      const sortedCats = Array.from(catMap.entries()).sort((a, b) => b[1] - a[1]);
      const [topName, topCount] = sortedCats[0];
      topCategory = {
        name: topName,
        percentage: total > 0 ? Math.round((topCount / total) * 100) : 100,
      };
    }

    return {
      id: p.id,
      email: authInfo?.email ?? "",
      displayName: p.display_name,
      role: (p.role === "admin" ? "admin" : "editor") as EditorialRole,
      createdAt: p.created_at,
      lastSignInAt: authInfo?.lastSignInAt ?? null,
      isSuspended: authInfo?.isSuspended ?? false,
      activityLevel: authInfo?.activityLevel ?? "inactive",
      stats: {
        published,
        draft,
        total,
        featuredCount,
        completionRate,
        latestArticle: latestArticle
          ? {
              title: latestArticle.title,
              slug: latestArticle.slug,
              publishedAt: latestArticle.published_at,
              status: latestArticle.status,
            }
          : null,
        topCategory,
      },
    };
  });

  return {
    members,
    pulse: {
      totalStaff: members.length,
      activeToday: activeTodayCount,
      articlesThisWeek: publishedThisWeekCount,
      totalPublished: totalPublishedGlobal,
      totalDrafts: totalDraftsGlobal,
      globalCompletionRate,
      categoryDistribution,
      orphanCategoriesCount,
    },
  };
}
