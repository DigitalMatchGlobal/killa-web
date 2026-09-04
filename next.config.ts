import type { NextConfig } from "next";

/**
 * Las imágenes destacadas de las noticias se sirven desde el bucket público de
 * Supabase, así que `next/image` necesita tenerlo autorizado. El host se
 * deriva de la misma variable que usa la app: si mañana cambia el proyecto, no
 * hay una segunda constante que se pueda olvidar de actualizar.
 */
const supabaseHost = (() => {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!raw) return null;
  try {
    return new URL(raw).hostname;
  } catch {
    return null;
  }
})();

const nextConfig: NextConfig = {
  // Permite probar el servidor de desarrollo desde el iPhone en la misma red.
  // Para mostrarle la propuesta al cliente usamos igualmente el build de producción.
  allowedDevOrigins: ["192.168.1.187"],
  images: {
    remotePatterns: supabaseHost
      ? [
          {
            protocol: supabaseHost === "127.0.0.1" || supabaseHost === "localhost" ? "http" : "https",
            hostname: supabaseHost,
            pathname: "/storage/v1/object/public/killa-news/**",
          },
        ]
      : [],
  },
};

export default nextConfig;
