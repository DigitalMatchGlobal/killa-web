import "server-only";

import sharp from "sharp";

/**
 * Optimiza la foto destacada antes de guardarla en Storage.
 *
 * El equipo de prensa sube la foto tal como sale del celular o de la cámara
 * (hasta 3 MB). Servirla así tiene tres costos que se repiten en cada visita:
 * ancho de banda de Supabase (el plan gratuito incluye muy poco), una portada
 * más lenta, y vistas previas que WhatsApp descarta por pesadas (> ~300 KB).
 *
 * Se achica a 1600 px de lado mayor (sobra para una pantalla grande) y se
 * recomprime a JPEG. No recorta: los afiches con texto en los bordes se
 * conservan enteros. Si algo falla o el resultado no mejora el original, se
 * devuelve `null` y se sube el archivo original.
 */
const MAX_SIDE = 1600;
const QUALITY = 82;

export type OptimizedImage = { bytes: Uint8Array; mime: "image/jpeg"; extension: "jpg" };

export async function optimizeFeaturedImage(
  input: Uint8Array,
  originalMime: string,
): Promise<OptimizedImage | null> {
  try {
    const output = await sharp(input, { failOn: "none" })
      .rotate()
      .resize({ width: MAX_SIDE, height: MAX_SIDE, fit: "inside", withoutEnlargement: true })
      .flatten({ background: "#040A16" })
      .jpeg({ quality: QUALITY, mozjpeg: true })
      .toBuffer();

    // Un JPEG ya liviano puede salir más pesado al recomprimirlo: se deja igual.
    if (originalMime === "image/jpeg" && output.byteLength >= input.byteLength) return null;

    return { bytes: new Uint8Array(output), mime: "image/jpeg", extension: "jpg" };
  } catch {
    return null;
  }
}
