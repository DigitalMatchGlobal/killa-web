import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

import { supabaseAnonKey, supabaseUrl } from "./env";

/**
 * Cliente de Supabase para Server Components, Server Actions y Route Handlers.
 *
 * Usa la clave anónima y la sesión del visitante que viaja en cookies: **todas
 * las consultas pasan por RLS**. Es lo que queremos incluso en el panel; que
 * un editor no pueda hacer más de lo que las policies permiten es la garantía
 * de que un bug de UI no se convierte en un agujero de permisos.
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(supabaseUrl(), supabaseAnonKey(), {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Los Server Components no pueden escribir cookies. El refresh de la
          // sesión lo hace el middleware, así que ignorar acá es correcto.
        }
      },
    },
  });
}

/**
 * Cliente de sólo lectura para las páginas públicas.
 *
 * No toca cookies: así las consultas del portal público quedan cacheables y no
 * fuerzan renderizado dinámico en cada nota.
 */
export function createSupabasePublicClient() {
  return createServerClient(supabaseUrl(), supabaseAnonKey(), {
    cookies: {
      getAll() {
        return [];
      },
      setAll() {
        /* el portal público no escribe sesión */
      },
    },
  });
}
