import "server-only";

import { createClient } from "@supabase/supabase-js";

import { supabaseServiceRoleKey, supabaseUrl } from "./env";

/**
 * Cliente con privilegios administrativos (service_role).
 *
 * ⚠️ EXCLUSIVO DEL SERVIDOR: sólo se utiliza en Server Actions y Server Components
 * que ya hayan verificado que la sesión activa corresponde a un rol `admin`.
 * Salta RLS por diseño.
 */
export function createSupabaseAdminClient() {
  return createClient(supabaseUrl(), supabaseServiceRoleKey(), {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
