import sharp from "sharp";

import { getArticleBySlug } from "@/lib/editorial/queries";

/**
 * Imagen para las vistas previas al compartir una nota (WhatsApp, Facebook,
 * X, LinkedIn, iMessage…).
 *
 * Por qué existe: la foto destacada la sube el equipo de prensa tal cual sale
 * de la cámara (hasta 3 MB) y WhatsApp **descarta la imagen** de la vista
 * previa cuando pesa más de unos ~300 KB: en vez de la foto muestra el ícono
 * del sitio. Acá la servimos redimensionada y recomprimida, así que cualquier
 * foto que suba el equipo, hoy o mañana, se ve bien al compartir.
 *
 * Mantiene la proporción de la foto (sin recortar: los afiches con texto en
 * los bordes no se pueden cortar), con un ancho de 1200 px y un tope de peso
 * por debajo del límite de WhatsApp.
 */
const MAX_WIDTH = 1200;
const MAX_HEIGHT = 900;
const MAX_BYTES = 250 * 1024;
const FALLBACK = "/og-tv.png?v=20260917";

function cacheHeaders() {
  return {
    // Los crawlers piden la imagen una sola vez; el CDN la guarda un día y la
    // URL cambia (?v=) cuando se edita la nota, así que no queda desactualizada.
    "Cache-Control": "public, max-age=300, s-maxage=86400, stale-while-revalidate=604800",
  };
}

async function compress(input: Buffer): Promise<Buffer> {
  const base = sharp(input, { failOn: "none" })
    .rotate()
    .resize({ width: MAX_WIDTH, height: MAX_HEIGHT, fit: "inside", withoutEnlargement: true })
    .flatten({ background: "#040A16" });

  let output = Buffer.alloc(0);
  for (const quality of [82, 74, 66, 58, 50]) {
    output = await base.clone().jpeg({ quality, mozjpeg: true }).toBuffer();
    if (output.byteLength <= MAX_BYTES) break;
  }
  return output;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const fallback = () => Response.redirect(new URL(FALLBACK, request.url), 302);

  try {
    const article = await getArticleBySlug(slug);
    if (!article?.featuredImageUrl) return fallback();

    const origin = process.env.NEXT_PUBLIC_SUPABASE_URL;
    // Sólo se procesan imágenes de nuestro propio bucket.
    if (!origin || !article.featuredImageUrl.startsWith(`${origin}/storage/v1/object/public/`)) {
      return fallback();
    }

    const upstream = await fetch(article.featuredImageUrl, { signal: AbortSignal.timeout(8000) });
    if (!upstream.ok) return fallback();

    const image = await compress(Buffer.from(await upstream.arrayBuffer()));
    return new Response(new Uint8Array(image), {
      headers: { "Content-Type": "image/jpeg", ...cacheHeaders() },
    });
  } catch {
    return fallback();
  }
}
