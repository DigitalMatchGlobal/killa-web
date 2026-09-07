import { z } from "zod";

import { sanitizeBody, sanitizeSingleLine } from "./sanitize";
import { BYLINE_MAX } from "./types";

/**
 * Validación de servidor.
 *
 * Todo lo que llega de un formulario se vuelve a validar acá, con el mismo
 * esquema, sin importar lo que haya chequeado el navegador. El orden es
 * siempre: sanear primero, validar después — así el largo mínimo se mide sobre
 * el texto real y no sobre etiquetas HTML que después se van a descartar.
 *
 * Los límites de imagen (3 MB, JPEG/PNG/WebP) están además declarados en el
 * bucket (supabase/migrations/...storage.sql): son dos rejas, no una sola.
 */

export const IMAGE_RECOMMENDED_BYTES = 2 * 1024 * 1024;
export const IMAGE_MAX_BYTES = 3 * 1024 * 1024;
export const IMAGE_MIN_WIDTH = 1200;
export const IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const IMAGE_EXTENSIONS: Record<(typeof IMAGE_MIME_TYPES)[number], string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export const TITLE_MAX = 140;
export const EXCERPT_MAX = 320;
export const IMAGE_ALT_MAX = 180;
export { BYLINE_MAX };

const cleanLine = (value: unknown) =>
  typeof value === "string" ? sanitizeSingleLine(value) : value;

const cleanBody = (value: unknown) =>
  typeof value === "string" ? sanitizeBody(value) : value;

export const articleDraftSchema = z.object({
  title: z.preprocess(
    cleanLine,
    z
      .string()
      .min(8, "El título necesita al menos 8 caracteres.")
      .max(TITLE_MAX, `El título no puede pasar de ${TITLE_MAX} caracteres.`),
  ),
  excerpt: z.preprocess(
    cleanLine,
    z.string().max(EXCERPT_MAX, `La bajada no puede pasar de ${EXCERPT_MAX} caracteres.`),
  ),
  body: z.preprocess(cleanBody, z.string()),
  categoryId: z.preprocess(
    (value) => (value === "" || value === undefined ? null : value),
    z.string().uuid("Categoría inválida.").nullable(),
  ),
  imageAlt: z.preprocess(
    cleanLine,
    z.string().max(IMAGE_ALT_MAX, `El texto alternativo no puede pasar de ${IMAGE_ALT_MAX} caracteres.`),
  ),
  featuredImagePath: z.preprocess(
    (value) => (value === "" || value === undefined ? null : value),
    z.string().max(400).nullable(),
  ),
  /**
   * Firma editorial opcional.
   *
   * Se sanea como una línea y, si queda vacía, se guarda `null`: no existe un
   * checkbox de "mostrar firma", la presencia del texto es lo que decide. Un
   * campo que el editor vacía tiene que llegar a la base como `null`, no como
   * cadena vacía, para que el portal deje de renderizar la firma.
   */
  byline: z.preprocess(
    (value) => {
      if (typeof value !== "string") return null;
      const clean = sanitizeSingleLine(value);
      return clean.length > 0 ? clean : null;
    },
    z
      .string()
      .max(BYLINE_MAX, `La firma no puede pasar de ${BYLINE_MAX} caracteres.`)
      .nullable(),
  ),
  priority: z.coerce
    .number()
    .int("La prioridad es un número entero.")
    .min(1, "La prioridad va de 1 a 5.")
    .max(5, "La prioridad va de 1 a 5."),
  isFeatured: z.preprocess(
    (value) => value === "on" || value === "true" || value === true,
    z.boolean(),
  ),
  /** Slug opcional: si no viene, lo deriva del título el trigger de la base. */
  slug: z.preprocess(
    (value) => (value === "" || value === undefined ? null : value),
    z.string().max(120).nullable(),
  ),
});

export type ArticleDraftInput = z.infer<typeof articleDraftSchema>;

/**
 * Requisitos EXTRA para publicar. Un borrador puede estar incompleto; una nota
 * publicada no. El mismo par de reglas está como CHECK en la tabla: si algo
 * elude esta validación, la base rechaza igual.
 */
export const publishableSchema = articleDraftSchema.extend({
  excerpt: articleDraftSchema.shape.excerpt.pipe(
    z.string().min(20, "Para publicar, la bajada necesita al menos 20 caracteres."),
  ),
  body: articleDraftSchema.shape.body.pipe(
    z.string().min(120, "Para publicar, el cuerpo necesita al menos 120 caracteres."),
  ),
  featuredImagePath: z
    .string({ message: "Para publicar hace falta una imagen destacada." })
    .min(1, "Para publicar hace falta una imagen destacada."),
  imageAlt: articleDraftSchema.shape.imageAlt.pipe(
    z
      .string()
      .min(
        10,
        "El texto alternativo de la imagen es obligatorio para publicar (accesibilidad).",
      ),
  ),
});

export const credentialsSchema = z.object({
  email: z.string().trim().toLowerCase().email("Email inválido."),
  password: z.string().min(8, "La contraseña necesita al menos 8 caracteres."),
});

export const imageUploadSchema = z.object({
  size: z
    .number()
    .positive("El archivo está vacío.")
    .max(IMAGE_MAX_BYTES, "La imagen no puede pasar de 3 MB."),
  type: z.enum(IMAGE_MIME_TYPES, {
    message: "Formato no admitido. Se aceptan JPEG, PNG y WebP.",
  }),
});

/** Primer mensaje de error de un ZodError, listo para mostrar en el panel. */
export function firstIssue(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Los datos no son válidos.";
}

/**
 * Firma real del archivo (magic bytes).
 *
 * El `Content-Type` de un upload lo elige el cliente y se puede mentir. Sin
 * esta comprobación, un `.html` renombrado a `.jpg` con `type: image/jpeg`
 * entraría al bucket y quedaría servido desde nuestro dominio.
 */
export function sniffImageMime(bytes: Uint8Array): (typeof IMAGE_MIME_TYPES)[number] | null {
  if (bytes.length < 12) return null;

  // JPEG: FF D8 FF
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  const png = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  if (png.every((byte, index) => bytes[index] === byte)) return "image/png";

  // WebP: "RIFF" .... "WEBP"
  const riff = String.fromCharCode(...bytes.slice(0, 4));
  const webp = String.fromCharCode(...bytes.slice(8, 12));
  if (riff === "RIFF" && webp === "WEBP") return "image/webp";

  return null;
}
