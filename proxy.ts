import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * Proxy de sesión + guarda del panel.
 *
 * (En Next 16 esta convención se llama `proxy.ts`; es el ex `middleware.ts`.)
 *
 * Hace dos cosas:
 *  1. refresca el token de Supabase y reescribe las cookies (los Server
 *     Components no pueden escribirlas, así que si esto no corre la sesión se
 *     cae al expirar el access token);
 *  2. saca de `/tv/panel` a cualquiera sin sesión, antes de renderizar.
 *
 * OJO: esto es conveniencia de navegación, NO el control de acceso. El control
 * real está en `requireEditorialStaff()` dentro de cada página y cada Server
 * Action, y abajo de todo en las policies de RLS. Acá sólo se mira que exista
 * un usuario válido; el rol lo verifica el servidor contra `profiles`.
 */

const PANEL_PREFIX = "/tv/panel";
const LOGIN_PATH = "/tv/panel/ingresar";

export default async function proxy(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const isPanel = request.nextUrl.pathname.startsWith(PANEL_PREFIX);

  // Sin backend configurado el portal público sigue andando con el contenido
  // estático, pero el panel no tiene nada que ofrecer: mejor no mostrarlo.
  if (!url || !anonKey) {
    if (isPanel) {
      return NextResponse.redirect(new URL("/tv", request.url));
    }
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  // Llamada obligatoria: es la que dispara el refresh del token.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (isPanel && request.nextUrl.pathname !== LOGIN_PATH && !user) {
    const redirectUrl = new URL(LOGIN_PATH, request.url);
    // Para volver a donde quería entrar después de identificarse.
    redirectUrl.searchParams.set("volver", request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Ya identificado, el login no tiene sentido.
  if (request.nextUrl.pathname === LOGIN_PATH && user) {
    return NextResponse.redirect(new URL(PANEL_PREFIX, request.url));
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Todo menos assets estáticos e imágenes. Corre también en las páginas
     * públicas porque ahí es donde conviene refrescar la sesión de un editor
     * que anda navegando el sitio.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
