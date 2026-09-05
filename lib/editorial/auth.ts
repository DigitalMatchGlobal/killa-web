import "server-only";

import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";

import type { EditorialProfile, EditorialRole } from "./types";

export const PANEL_PATH = "/tv/panel";
export const LOGIN_PATH = "/tv/panel/ingresar";

/**
 * Sesión y rol del usuario del panel.
 *
 * `getUser()` (y no `getSession()`) porque valida el token contra el servidor
 * de Auth; la cookie de sesión, sola, se puede manipular.
 *
 * El rol NO se lee de los claims del token: se lee de `public.profiles`, que
 * es la tabla que además gobierna las RLS. Un token viejo con un rol que ya se
 * revocó no alcanza para escribir nada.
 */
export async function getCurrentProfile(): Promise<EditorialProfile | null> {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("id, display_name, role")
    .eq("id", user.id)
    .maybeSingle<{ id: string; display_name: string; role: EditorialRole }>();

  if (error || !data) return null;
  if (data.role !== "admin" && data.role !== "editor") return null;

  return {
    id: data.id,
    email: user.email ?? "",
    displayName: data.display_name,
    role: data.role,
  };
}

/**
 * Exige staff editorial. Redirige al login si no hay sesión válida.
 *
 * Se llama en CADA página del panel y en CADA Server Action, no sólo en el
 * middleware: el middleware es conveniencia de navegación, esto es el control
 * real. Una Server Action se puede invocar por POST directo sin pasar por una
 * página.
 */
export async function requireEditorialStaff(): Promise<EditorialProfile> {
  const profile = await getCurrentProfile();
  if (!profile) redirect(LOGIN_PATH);
  return profile;
}
