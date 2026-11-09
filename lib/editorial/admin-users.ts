import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { EditorialRole } from "./types";

export type StaffMemberStats = {
  published: number;
  draft: number;
  total: number;
};

export type StaffMemberWithStats = {
  id: string;
  email: string;
  displayName: string;
  role: EditorialRole;
  createdAt: string;
  lastSignInAt: string | null;
  isSuspended: boolean;
  stats: StaffMemberStats;
};

/**
 * Obtiene el listado completo del equipo con sus métricas:
 * - Cantidad de artículos (publicados, borradores y total)
 * - Último acceso a la plataforma
 * - Estado de acceso (activo / suspendido)
 */
export async function getStaffMembersWithStats(): Promise<StaffMemberWithStats[]> {
  const adminClient = createSupabaseAdminClient();

  // 1. Obtener perfiles
  const { data: profiles, error: profilesError } = await adminClient
    .from("profiles")
    .select("id, display_name, role, created_at")
    .order("created_at", { ascending: true });

  if (profilesError || !profiles) {
    console.error("Error al obtener perfiles:", profilesError);
    return [];
  }

  // 2. Obtener usuarios de Auth para emails, last_sign_in_at y banned_until
  const { data: authData, error: authError } = await adminClient.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });

  if (authError) {
    console.error("Error al obtener usuarios de auth:", authError);
  }

  const authUsersMap = new Map<string, { email: string; lastSignInAt: string | null; isSuspended: boolean }>();
  if (authData?.users) {
    for (const u of authData.users) {
      const isSuspended = Boolean(u.banned_until && new Date(u.banned_until) > new Date());
      authUsersMap.set(u.id, {
        email: u.email ?? "",
        lastSignInAt: u.last_sign_in_at ?? null,
        isSuspended,
      });
    }
  }

  // 3. Contar artículos por autor
  const { data: articles, error: articlesError } = await adminClient
    .from("articles")
    .select("author_id, status");

  const statsMap = new Map<string, StaffMemberStats>();
  if (!articlesError && articles) {
    for (const article of articles) {
      if (!article.author_id) continue;
      const current = statsMap.get(article.author_id) ?? { published: 0, draft: 0, total: 0 };
      if (article.status === "published") {
        current.published += 1;
      } else if (article.status === "draft") {
        current.draft += 1;
      }
      current.total += 1;
      statsMap.set(article.author_id, current);
    }
  }

  // 4. Combinar
  return profiles.map((p) => {
    const authInfo = authUsersMap.get(p.id);
    const stats = statsMap.get(p.id) ?? { published: 0, draft: 0, total: 0 };

    return {
      id: p.id,
      email: authInfo?.email ?? "",
      displayName: p.display_name,
      role: (p.role === "admin" ? "admin" : "editor") as EditorialRole,
      createdAt: p.created_at,
      lastSignInAt: authInfo?.lastSignInAt ?? null,
      isSuspended: authInfo?.isSuspended ?? false,
      stats,
    };
  });
}
