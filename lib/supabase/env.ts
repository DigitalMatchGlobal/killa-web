/**
 * Variables de entorno de Supabase, leídas en un solo lugar y con mensajes de
 * error que dicen qué falta.
 *
 * REGLA DURA: `SUPABASE_SERVICE_ROLE_KEY` no se exporta desde acá con prefijo
 * NEXT_PUBLIC_ ni se importa en ningún archivo que llegue al navegador. La
 * clave de servicio salta RLS: en el cliente equivale a entregar la base.
 */

function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(
      `Falta la variable de entorno ${name}. Copiá .env.example a .env.local y completala (ver supabase/README.md).`,
    );
  }
  return value;
}

/** URL del proyecto. Es pública: viaja al navegador. */
export function supabaseUrl(): string {
  return required("NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL);
}

/**
 * Clave anónima / publishable. Es pública por diseño: sin RLS no sirve de nada
 * y con RLS sólo alcanza lo que las policies permiten.
 */
export function supabaseAnonKey(): string {
  return required(
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

/** ¿Hay backend configurado? Permite caer al fallback estático en desarrollo. */
export function hasSupabaseConfig(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
