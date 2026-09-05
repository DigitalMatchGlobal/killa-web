"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";

import { LOGIN_PATH, PANEL_PATH, getCurrentProfile, requireEditorialStaff } from "./auth";
import { getPanelArticleById } from "./panel";
import {
  IMAGE_EXTENSIONS,
  IMAGE_MAX_BYTES,
  articleDraftSchema,
  credentialsSchema,
  firstIssue,
  imageUploadSchema,
  publishableSchema,
  sniffImageMime,
} from "./validation";
import type { ArticleStatus } from "./types";

/**
 * Mutaciones del panel, como Server Actions.
 *
 * Reglas que valen para TODAS:
 *  1. exigen staff editorial antes de tocar nada (`requireEditorialStaff`);
 *  2. re-validan la entrada con Zod en el servidor, sin confiar en el form;
 *  3. escriben con la sesión del editor, nunca con service_role: la RLS es la
 *     última palabra incluso si esta capa tuviera un bug;
 *  4. devuelven `ActionResult` en vez de tirar la excepción a la cara del
 *     usuario, así el panel muestra un mensaje en castellano.
 *
 * NO hay ninguna acción de borrado de notas: la baja editorial es archivar, y
 * la tabla directamente no tiene policy de DELETE.
 */

export type ActionResult<T = undefined> =
  | ({ ok: true } & (T extends undefined ? { data?: undefined } : { data: T }))
  | { ok: false; error: string };

const fail = (error: string): ActionResult<never> => ({ ok: false, error });

const BUCKET = "killa-news";

function formString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

// ---------------------------------------------------------------------------
// Sesión
// ---------------------------------------------------------------------------

export async function signInAction(
  _previous: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = credentialsSchema.safeParse({
    email: formString(formData, "email"),
    password: formString(formData, "password"),
  });

  if (!parsed.success) return fail(firstIssue(parsed.error));

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  // Mensaje genérico a propósito: distinguir "no existe el usuario" de
  // "contraseña incorrecta" le regala a un atacante la lista de emails con
  // acceso al panel.
  if (error) return fail("Email o contraseña incorrectos.");

  const profile = await getCurrentProfile();
  if (!profile) {
    // Usuario de Auth sin perfil editorial: no tiene nada que hacer adentro.
    await supabase.auth.signOut();
    return fail("Esta cuenta no tiene acceso al panel editorial.");
  }

  revalidatePath(PANEL_PATH);
  redirect(PANEL_PATH);
}

export async function signOutAction(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  revalidatePath(PANEL_PATH);
  redirect(LOGIN_PATH);
}

/** Sesión actual, para quien la necesite desde el panel. */
export async function getSessionAction() {
  return getCurrentProfile();
}

// ---------------------------------------------------------------------------
// Noticias
// ---------------------------------------------------------------------------

function readDraftForm(formData: FormData) {
  return articleDraftSchema.safeParse({
    title: formString(formData, "title"),
    excerpt: formString(formData, "excerpt"),
    body: formString(formData, "body"),
    categoryId: formString(formData, "categoryId"),
    imageAlt: formString(formData, "imageAlt"),
    featuredImagePath: formString(formData, "featuredImagePath"),
    priority: formString(formData, "priority") || "1",
    isFeatured: formString(formData, "isFeatured"),
    slug: formString(formData, "slug"),
  });
}

/**
 * Crea la nota. Siempre nace como borrador.
 *
 * En el camino feliz redirige al editor de la nota nueva, así que sólo
 * "devuelve" cuando algo falló.
 */
export async function createDraftAction(
  _previous: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  await requireEditorialStaff();

  const parsed = readDraftForm(formData);
  if (!parsed.success) return fail(firstIssue(parsed.error));

  const input = parsed.data;
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("articles")
    .insert({
      title: input.title,
      slug: input.slug ?? input.title,
      excerpt: input.excerpt,
      body: input.body,
      category_id: input.categoryId,
      featured_image_path: input.featuredImagePath,
      image_alt: input.imageAlt,
      priority: input.priority,
      is_featured: input.isFeatured,
      status: "draft" satisfies ArticleStatus,
    })
    .select("id")
    .single<{ id: string }>();

  if (error) return fail(`No se pudo crear el borrador: ${error.message}`);

  revalidatePath(PANEL_PATH);
  redirect(`${PANEL_PATH}/notas/${data.id}`);
}

/** Guarda cambios de un borrador o de una nota ya publicada. */
export async function saveArticleAction(
  _previous: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  await requireEditorialStaff();

  const id = formString(formData, "id");
  if (!id) return fail("Falta el identificador de la nota.");

  const current = await getPanelArticleById(id);
  if (!current) return fail("La nota no existe o no tenés acceso.");

  const parsed = readDraftForm(formData);
  if (!parsed.success) return fail(firstIssue(parsed.error));
  const input = parsed.data;

  // Editar una nota YA publicada no puede dejarla sin imagen ni sin alt: se
  // exigen los mismos requisitos que para publicar.
  if (current.status === "published") {
    const publishable = publishableSchema.safeParse(input);
    if (!publishable.success) return fail(firstIssue(publishable.error));
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("articles")
    .update({
      title: input.title,
      excerpt: input.excerpt,
      body: input.body,
      category_id: input.categoryId,
      featured_image_path: input.featuredImagePath,
      image_alt: input.imageAlt,
      priority: input.priority,
      is_featured: input.isFeatured,
      // El slug de una nota publicada NO se cambia: los links compartidos por
      // WhatsApp dejarían de funcionar. Sólo se reescribe si sigue en borrador.
      ...(current.status === "published" ? {} : { slug: input.slug ?? input.title }),
    })
    .eq("id", id);

  if (error) return fail(`No se pudo guardar: ${error.message}`);

  revalidatePath(PANEL_PATH);
  revalidatePath("/tv");
  revalidatePath(`/tv/noticias/${current.slug}`);
  return { ok: true };
}

/** Publica: exige imagen, alt y contenido mínimo. `published_at` lo pone la base. */
export async function publishArticleAction(
  _previous: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  await requireEditorialStaff();

  const id = formString(formData, "id");
  if (!id) return fail("Falta el identificador de la nota.");

  const current = await getPanelArticleById(id);
  if (!current) return fail("La nota no existe o no tenés acceso.");

  const parsed = publishableSchema.safeParse({
    title: current.title,
    excerpt: current.excerpt,
    body: current.body,
    categoryId: current.categoryId,
    imageAlt: current.imageAlt,
    featuredImagePath: current.featuredImagePath,
    priority: current.priority,
    isFeatured: current.isFeatured,
    slug: current.slug,
  });
  if (!parsed.success) return fail(firstIssue(parsed.error));

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("articles")
    .update({ status: "published" satisfies ArticleStatus })
    .eq("id", id);

  if (error) return fail(`No se pudo publicar: ${error.message}`);

  revalidatePath(PANEL_PATH);
  revalidatePath("/tv");
  revalidatePath(`/tv/noticias/${current.slug}`);
  return { ok: true };
}

/** Baja editorial: archiva. La fila y su imagen se conservan. */
export async function archiveArticleAction(
  _previous: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  await requireEditorialStaff();

  const id = formString(formData, "id");
  if (!id) return fail("Falta el identificador de la nota.");

  const current = await getPanelArticleById(id);
  if (!current) return fail("La nota no existe o no tenés acceso.");

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("articles")
    .update({ status: "archived" satisfies ArticleStatus })
    .eq("id", id);

  if (error) return fail(`No se pudo archivar: ${error.message}`);

  revalidatePath(PANEL_PATH);
  revalidatePath("/tv");
  revalidatePath(`/tv/noticias/${current.slug}`);
  return { ok: true };
}

/** Vuelve una nota publicada o archivada al estado de borrador. */
export async function unpublishArticleAction(
  _previous: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  await requireEditorialStaff();

  const id = formString(formData, "id");
  if (!id) return fail("Falta el identificador de la nota.");

  const current = await getPanelArticleById(id);
  if (!current) return fail("La nota no existe o no tenés acceso.");

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("articles")
    .update({ status: "draft" satisfies ArticleStatus })
    .eq("id", id);

  if (error) return fail(`No se pudo volver a borrador: ${error.message}`);

  revalidatePath(PANEL_PATH);
  revalidatePath("/tv");
  revalidatePath(`/tv/noticias/${current.slug}`);
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Imágenes
// ---------------------------------------------------------------------------

/**
 * Sube la imagen destacada al bucket y devuelve su key.
 *
 * Tres validaciones, en este orden:
 *  1. tamaño y `Content-Type` declarado (Zod);
 *  2. **firma real del archivo** (magic bytes): el tipo declarado se puede
 *     mentir, los primeros bytes no;
 *  3. el bucket vuelve a chequear tamaño y mime del lado de Storage.
 *
 * El nombre es único (uuid + extensión según la firma real), así que subir dos
 * fotos con el mismo nombre nunca sobreescribe una nota publicada.
 */
export async function uploadFeaturedImageAction(
  _previous: ActionResult<{ path: string }> | null,
  formData: FormData,
): Promise<ActionResult<{ path: string }>> {
  await requireEditorialStaff();

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return fail("Elegí un archivo de imagen.");
  }

  const parsed = imageUploadSchema.safeParse({ size: file.size, type: file.type });
  if (!parsed.success) return fail(firstIssue(parsed.error));

  const buffer = new Uint8Array(await file.arrayBuffer());
  if (buffer.byteLength > IMAGE_MAX_BYTES) return fail("La imagen no puede pasar de 3 MB.");

  const sniffed = sniffImageMime(buffer);
  if (!sniffed) {
    return fail("El archivo no es una imagen JPEG, PNG ni WebP válida.");
  }

  const now = new Date();
  const folder = `${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
  const path = `${folder}/${crypto.randomUUID()}.${IMAGE_EXTENSIONS[sniffed]}`;

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.storage.from(BUCKET).upload(path, buffer, {
    contentType: sniffed,
    upsert: false,
  });

  if (error) return fail(`No se pudo subir la imagen: ${error.message}`);

  return { ok: true, data: { path } };
}

/**
 * Borra una imagen del bucket **sólo si ninguna nota la referencia**.
 *
 * Se consulta `public.article_image_in_use()`, que ve todos los estados
 * (incluidas las archivadas: una archivada puede volver a publicarse y
 * necesita su foto). Las imágenes migradas de `public/` no se tocan: no viven
 * en el bucket.
 */
export async function deleteUnusedImageAction(
  _previous: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  await requireEditorialStaff();

  const path = formString(formData, "path");
  if (!path) return fail("Falta la ruta de la imagen.");
  if (path.startsWith("/")) {
    return fail("Esa imagen es un asset del repositorio, no se borra desde el panel.");
  }

  const supabase = await createSupabaseServerClient();

  const { data: inUse, error: checkError } = await supabase.rpc("article_image_in_use", {
    image_path: path,
  });
  if (checkError) return fail(`No se pudo verificar la imagen: ${checkError.message}`);
  if (inUse) return fail("La imagen sigue en uso por una nota. No se borró.");

  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  if (error) return fail(`No se pudo borrar la imagen: ${error.message}`);

  return { ok: true };
}
