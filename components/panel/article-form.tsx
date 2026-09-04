"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useRef, useState, useTransition } from "react";
import { AlertCircle, Check, Eye, Save, Upload } from "lucide-react";

import {
  createDraftAction,
  saveArticleAction,
  uploadFeaturedImageAction,
  type ActionResult,
} from "@/lib/editorial/actions";
import { EXCERPT_MAX, IMAGE_ALT_MAX, TITLE_MAX } from "@/lib/editorial/validation";
import { resolveFeaturedImageUrl, type Category, type PanelArticle } from "@/lib/editorial/types";

/**
 * Formulario de alta y edición.
 *
 * Todo lo que se ve acá se vuelve a validar en el servidor: los `maxLength` y
 * los `required` del navegador son comodidad, no control. Los mensajes de error
 * que se muestran son los que devuelve la Server Action.
 *
 * La imagen se sube aparte del guardado (llamada imperativa a la acción) y lo
 * único que viaja con el formulario es su key en el bucket. Así una imagen
 * cargada no se pierde si el guardado falla por otro campo.
 */
export function ArticleForm({
  categories,
  article,
}: {
  categories: Category[];
  article?: PanelArticle;
}) {
  const isEditing = Boolean(article);
  const supabaseOrigin = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    isEditing ? saveArticleAction : createDraftAction,
    null,
  );

  const [title, setTitle] = useState(article?.title ?? "");
  const [excerpt, setExcerpt] = useState(article?.excerpt ?? "");
  const [body, setBody] = useState(article?.body ?? "");
  const [categoryId, setCategoryId] = useState(article?.categoryId ?? categories[0]?.id ?? "");
  const [priority, setPriority] = useState(String(article?.priority ?? 1));
  const [imageAlt, setImageAlt] = useState(article?.imageAlt ?? "");
  const [imagePath, setImagePath] = useState(article?.featuredImagePath ?? "");
  const [imageError, setImageError] = useState<string | null>(null);
  const [uploading, startUpload] = useTransition();
  const fileInput = useRef<HTMLInputElement>(null);

  const imageUrl = resolveFeaturedImageUrl(imagePath || null, supabaseOrigin);
  const selectedCategory = categories.find((category) => category.id === categoryId);

  function handleFile(file: File | undefined) {
    if (!file) return;
    setImageError(null);

    startUpload(async () => {
      const payload = new FormData();
      payload.set("file", file);
      const result = await uploadFeaturedImageAction(null, payload);

      if (result.ok) {
        setImagePath(result.data.path);
      } else {
        setImageError(result.error);
        if (fileInput.current) fileInput.current.value = "";
      }
    });
  }

  return (
    <form action={formAction} className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.72fr]">
      {article ? <input type="hidden" name="id" value={article.id} /> : null}
      <input type="hidden" name="featuredImagePath" value={imagePath} />

      <div className="card p-5 sm:p-7">
        <div className="grid gap-5">
          <label className="grid gap-2">
            <span className="font-mono text-[0.58rem] uppercase tracking-[0.12em] text-fg-faint">
              Sección
            </span>
            <select
              name="categoryId"
              value={categoryId}
              onChange={(event) => setCategoryId(event.target.value)}
              className="min-h-12 w-full rounded-xl border border-line bg-midnight px-4 text-sm text-fg outline-none focus:border-sand"
            >
              <option value="">Sin sección</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2">
            <span className="flex items-center justify-between gap-3 font-mono text-[0.58rem] uppercase tracking-[0.12em] text-fg-faint">
              Título
              <span>
                {title.length}/{TITLE_MAX}
              </span>
            </span>
            <textarea
              name="title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={TITLE_MAX}
              rows={3}
              required
              minLength={8}
              className="w-full resize-none rounded-xl border border-line bg-midnight px-4 py-3 font-display text-lg font-semibold leading-snug text-fg outline-none focus:border-sand"
            />
          </label>

          <label className="grid gap-2">
            <span className="flex items-center justify-between gap-3 font-mono text-[0.58rem] uppercase tracking-[0.12em] text-fg-faint">
              Bajada
              <span>
                {excerpt.length}/{EXCERPT_MAX}
              </span>
            </span>
            <textarea
              name="excerpt"
              value={excerpt}
              onChange={(event) => setExcerpt(event.target.value)}
              maxLength={EXCERPT_MAX}
              rows={3}
              className="w-full resize-none rounded-xl border border-line bg-midnight px-4 py-3 text-sm leading-relaxed text-fg outline-none focus:border-sand"
            />
          </label>

          <label className="grid gap-2">
            <span className="font-mono text-[0.58rem] uppercase tracking-[0.12em] text-fg-faint">
              Cuerpo de la nota
            </span>
            <textarea
              name="body"
              value={body}
              onChange={(event) => setBody(event.target.value)}
              rows={14}
              className="w-full rounded-xl border border-line bg-midnight px-4 py-3 text-sm leading-relaxed text-fg outline-none focus:border-sand"
            />
            <span className="font-mono text-[0.55rem] leading-relaxed text-fg-faint">
              Separá los párrafos con una línea en blanco. Es texto: no hace falta
              (ni se admite) código HTML.
            </span>
          </label>

          <label className="grid gap-2">
            <span className="font-mono text-[0.58rem] uppercase tracking-[0.12em] text-fg-faint">
              Prioridad editorial
            </span>
            <select
              name="priority"
              value={priority}
              onChange={(event) => setPriority(event.target.value)}
              className="min-h-12 w-full rounded-xl border border-line bg-midnight px-4 text-sm text-fg outline-none focus:border-sand"
            >
              <option value="1">1 — normal</option>
              <option value="2">2</option>
              <option value="3">3 — destacar</option>
              <option value="4">4</option>
              <option value="5">5 — tapa</option>
            </select>
            <span className="font-mono text-[0.55rem] leading-relaxed text-fg-faint">
              La portada muestra la nota publicada de mayor prioridad. Si hay empate,
              gana la más reciente.
            </span>
          </label>

          {/* --- Imagen destacada --- */}
          <div>
            <p className="font-mono text-[0.58rem] uppercase tracking-[0.12em] text-fg-faint">
              Imagen destacada
            </p>

            <input
              ref={fileInput}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              id="featured-image-input"
              onChange={(event) => handleFile(event.target.files?.[0])}
            />

            <label
              htmlFor="featured-image-input"
              className="mt-2 flex min-h-24 w-full cursor-pointer items-center gap-4 rounded-xl border border-dashed border-line-strong bg-midnight/55 px-4 py-3 text-left transition-colors hover:border-sand/60"
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-sand/10 text-sand">
                {imagePath ? <Check size={18} aria-hidden /> : <Upload size={18} aria-hidden />}
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-fg">
                  {uploading
                    ? "Subiendo…"
                    : imagePath
                      ? "Cambiar la imagen"
                      : "Elegir una imagen"}
                </span>
                <span className="mt-0.5 block truncate text-xs text-fg-faint">
                  JPEG, PNG o WebP · hasta 5 MB
                </span>
              </span>
            </label>

            {imageError ? (
              <p
                role="alert"
                className="mt-2 flex items-start gap-2 rounded-xl border border-red-400/30 bg-red-400/[0.07] px-4 py-3 text-sm text-red-200"
              >
                <AlertCircle size={16} className="mt-0.5 shrink-0" aria-hidden />
                {imageError}
              </p>
            ) : null}

            <label className="mt-4 grid gap-2">
              <span className="flex items-center justify-between gap-3 font-mono text-[0.58rem] uppercase tracking-[0.12em] text-fg-faint">
                Texto alternativo
                <span>
                  {imageAlt.length}/{IMAGE_ALT_MAX}
                </span>
              </span>
              <input
                type="text"
                name="imageAlt"
                value={imageAlt}
                onChange={(event) => setImageAlt(event.target.value)}
                maxLength={IMAGE_ALT_MAX}
                placeholder="Qué se ve en la foto"
                className="min-h-12 w-full rounded-xl border border-line bg-midnight px-4 text-sm text-fg outline-none focus:border-sand"
              />
              <span className="font-mono text-[0.55rem] leading-relaxed text-fg-faint">
                Obligatorio para publicar: es lo que leen los lectores de pantalla y lo
                que aparece si la imagen no carga.
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* --- Vista previa + guardar --- */}
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <p className="mb-2 font-mono text-[0.58rem] uppercase tracking-[0.12em] text-fg-faint">
          Vista previa
        </p>
        <div className="overflow-hidden rounded-2xl border border-line bg-midnight">
          <div className="relative aspect-[16/10] bg-surface">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={imageAlt || "Vista previa de la imagen destacada"}
                fill
                sizes="(max-width: 1024px) 100vw, 35vw"
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className="grid h-full place-items-center px-5 text-center text-xs text-fg-faint">
                Sin imagen destacada
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-midnight via-midnight/15 to-transparent" />
          </div>
          <div className="p-5">
            <p className="font-mono text-[0.55rem] uppercase tracking-[0.12em] text-sand">
              {selectedCategory?.name ?? "Sin sección"}
            </p>
            <h2 className="mt-2 font-display text-xl font-semibold leading-tight">
              {title || "Título de la noticia"}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-fg-muted">
              {excerpt || "La bajada aparecerá acá."}
            </p>
          </div>
        </div>

        {state && !state.ok ? (
          <p
            role="alert"
            className="mt-3 flex items-start gap-2 rounded-xl border border-red-400/30 bg-red-400/[0.07] px-4 py-3 text-sm text-red-200"
          >
            <AlertCircle size={16} className="mt-0.5 shrink-0" aria-hidden />
            {state.error}
          </p>
        ) : null}

        {state && state.ok ? (
          <p className="mt-3 flex items-start gap-2 rounded-xl border border-emerald-400/30 bg-emerald-400/[0.07] px-4 py-3 text-sm text-emerald-200">
            <Check size={16} className="mt-0.5 shrink-0" aria-hidden />
            Cambios guardados.
          </p>
        ) : null}

        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {article ? (
            <Link
              href={`/tv/panel/notas/${article.id}/vista-previa`}
              className="btn btn-ghost px-3"
            >
              <Eye size={16} aria-hidden />
              Previsualizar
            </Link>
          ) : (
            <span />
          )}
          <button
            type="submit"
            disabled={pending || uploading}
            className="btn bg-sand px-3 text-midnight hover:bg-sand/90 disabled:opacity-60"
          >
            {pending ? "Guardando…" : isEditing ? "Guardar cambios" : "Crear borrador"}
            <Save size={15} aria-hidden />
          </button>
        </div>
      </aside>
    </form>
  );
}
