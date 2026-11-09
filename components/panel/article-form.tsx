"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useRef, useState, useTransition } from "react";
import {
  AlertCircle,
  Bold,
  Check,
  Eye,
  Heading2,
  ImagePlus,
  Info,
  Italic,
  Link2,
  List,
  ListOrdered,
  Quote,
  Save,
  Send,
  Upload,
} from "lucide-react";

import { MarkdownContent } from "@/components/tv/markdown-content";
import {
  createDraftAction,
  saveArticleAction,
  uploadFeaturedImageAction,
  type ActionResult,
} from "@/lib/editorial/actions";
import {
  EXCERPT_MAX,
  BYLINE_MAX,
  IMAGE_ALT_MAX,
  IMAGE_MAX_BYTES,
  IMAGE_MIN_WIDTH,
  IMAGE_RECOMMENDED_BYTES,
  TITLE_MAX,
} from "@/lib/editorial/validation";
import {
  bylineLabel,
  resolveFeaturedImageUrl,
  type Category,
  type PanelArticle,
} from "@/lib/editorial/types";
import { subsectionsFor } from "@/lib/editorial/sections";

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
  const [subsection, setSubsection] = useState(article?.subsection ?? "");
  const [priority, setPriority] = useState(String(article?.priority ?? 3));
  const [isFeatured, setIsFeatured] = useState(article?.isFeatured ?? false);
  const [imageAlt, setImageAlt] = useState(article?.imageAlt ?? "");
  const [byline, setByline] = useState(article?.byline ?? "");
  const [imagePath, setImagePath] = useState(article?.featuredImagePath ?? "");
  const [imageError, setImageError] = useState<string | null>(null);
  const [imageWarning, setImageWarning] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [uploading, startUpload] = useTransition();
  const fileInput = useRef<HTMLInputElement>(null);
  const bodyInput = useRef<HTMLTextAreaElement>(null);
  const titleInputRef = useRef<HTMLTextAreaElement>(null);
  const excerptInputRef = useRef<HTMLTextAreaElement>(null);
  const imageSectionRef = useRef<HTMLDivElement>(null);
  const imageAltInputRef = useRef<HTMLInputElement>(null);

  const imageUrl = resolveFeaturedImageUrl(imagePath || null, supabaseOrigin);
  const selectedCategory = categories.find((category) => category.id === categoryId);
  const subsectionOptions = subsectionsFor(selectedCategory?.slug ?? "");
  // Misma función que usa el portal: lo que se ve en la vista previa es
  // exactamente lo que se va a publicar, incluido el caso "sólo espacios",
  // que no muestra nada.
  const bylinePreview = bylineLabel(byline);

  function handleFile(file: File | undefined) {
    if (!file) return;
    setImageError(null);
    setImageWarning(null);

    if (file.size > IMAGE_MAX_BYTES) {
      setImageError("La imagen no puede pasar de 3 MB.");
      if (fileInput.current) fileInput.current.value = "";
      return;
    }

    const localUrl = URL.createObjectURL(file);
    const probe = new window.Image();
    probe.onload = () => {
      const warnings: string[] = [];
      if (file.size > IMAGE_RECOMMENDED_BYTES) {
        warnings.push("pesa más de 2 MB");
      }
      if (probe.naturalWidth < IMAGE_MIN_WIDTH) {
        warnings.push(`tiene ${probe.naturalWidth}px de ancho; recomendamos 1200px o más`);
      }
      setImageWarning(
        warnings.length > 0
          ? `La imagen se puede usar, pero ${warnings.join(" y ")}. Puede perder calidad o cargar más lento.`
          : "Medidas correctas para portada y tarjetas.",
      );
      URL.revokeObjectURL(localUrl);
    };
    probe.onerror = () => URL.revokeObjectURL(localUrl);
    probe.src = localUrl;

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

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    const submitter = (event.nativeEvent as SubmitEvent)?.submitter as HTMLButtonElement | null;
    const isPublish = submitter?.value === "publish";

    if (!isPublish) {
      const trimmedTitle = title.trim();
      if (trimmedTitle.length < 8) {
        event.preventDefault();
        const msg =
          trimmedTitle.length === 0
            ? "El título es obligatorio para guardar el borrador (mínimo 8 caracteres)."
            : `El título debe tener al menos 8 caracteres (actualmente tiene ${trimmedTitle.length}).`;
        setValidationErrors([msg]);
        titleInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        titleInputRef.current?.focus();
        return;
      }
      setValidationErrors([]);
      if (!isEditing && typeof window !== "undefined") {
        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      }
      return;
    }

    // Comprobación de requisitos indispensables para publicar
    const missing: string[] = [];
    if (title.trim().length < 8) {
      missing.push(`Título: necesita al menos 8 caracteres (actualmente tiene ${title.trim().length}).`);
    }
    if (excerpt.trim().length < 20) {
      missing.push(`Bajada: necesita al menos 20 caracteres (actualmente tiene ${excerpt.trim().length}).`);
    }
    if (body.trim().length < 120) {
      missing.push(`Cuerpo: necesita al menos 120 caracteres (actualmente tiene ${body.trim().length}).`);
    }
    if (!imagePath) {
      missing.push("Foto destacada: es obligatoria para publicar.");
    } else if (imageAlt.trim().length < 10) {
      missing.push(`Texto descriptivo de la foto: necesita al menos 10 caracteres (actualmente tiene ${imageAlt.trim().length}).`);
    }

    if (missing.length > 0) {
      event.preventDefault();
      setValidationErrors(missing);
      if (title.trim().length < 8) {
        titleInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        titleInputRef.current?.focus();
      } else if (excerpt.trim().length < 20) {
        excerptInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        excerptInputRef.current?.focus();
      } else if (body.trim().length < 120) {
        bodyInput.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        bodyInput.current?.focus();
      } else if (!imagePath) {
        imageSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      } else if (imageAlt.trim().length < 10) {
        imageAltInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        imageAltInputRef.current?.focus();
      }
      return;
    }

    setValidationErrors([]);
  }

  function insertMarkdown(before: string, after: string, sample: string) {
    const textarea = bodyInput.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = body.slice(start, end) || sample;
    const next = `${body.slice(0, start)}${before}${selected}${after}${body.slice(end)}`;
    setBody(next);

    requestAnimationFrame(() => {
      textarea.focus();
      const cursorStart = start + before.length;
      textarea.setSelectionRange(cursorStart, cursorStart + selected.length);
    });
  }

  const markdownTools = [
    { label: "Negrita", icon: Bold, before: "**", after: "**", sample: "texto importante" },
    { label: "Itálica", icon: Italic, before: "*", after: "*", sample: "texto" },
    { label: "Título", icon: Heading2, before: "## ", after: "", sample: "Título de sección" },
    { label: "Lista", icon: List, before: "- ", after: "", sample: "Elemento" },
    { label: "Lista numerada", icon: ListOrdered, before: "1. ", after: "", sample: "Elemento" },
    { label: "Enlace", icon: Link2, before: "[", after: "](https://)", sample: "texto del enlace" },
    { label: "Imagen", icon: ImagePlus, before: "![", after: "](https://)", sample: "descripción" },
    { label: "Cita", icon: Quote, before: "> ", after: "", sample: "Cita destacada" },
  ] as const;

  return (
    <form
      id="article-edit-form"
      action={formAction}
      onSubmit={handleSubmit}
      noValidate
      className="mt-5 grid grid-cols-1 gap-5 w-full min-w-0 max-w-full lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)]"
    >
      <div className="hidden">
        {article ? <input type="hidden" name="id" value={article.id} /> : null}
        <input type="hidden" name="featuredImagePath" value={imagePath} />
      </div>

      {validationErrors.length > 0 ? (
        <div
          role="alert"
          className="col-span-full rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-amber-800 dark:text-amber-300"
        >
          <div className="flex items-start gap-3">
            <AlertCircle size={18} className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden />
            <div className="flex-1">
              <p className="font-semibold text-sm">
                {validationErrors.length === 1
                  ? validationErrors[0]
                  : "Para publicar la noticia faltan completar los siguientes requisitos:"}
              </p>
              {validationErrors.length > 1 ? (
                <ul className="mt-2 space-y-1 font-mono text-[0.68rem]">
                  {validationErrors.map((err, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="font-bold">•</span>
                      <span>{err}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      <div className="card p-4 sm:p-7 w-full min-w-0 max-w-full overflow-hidden">
        <div className="grid gap-5 w-full min-w-0">
          <label className="grid gap-2">
            <span className="font-mono text-[0.58rem] uppercase tracking-[0.12em] text-fg-faint">
              Sección
            </span>
            <select
              name="categoryId"
              value={categoryId}
              onChange={(event) => {
                setCategoryId(event.target.value);
                setSubsection("");
              }}
              className="min-h-12 w-full rounded-xl border border-line bg-midnight px-4 text-base text-fg outline-none focus:border-sand sm:text-sm"
            >
              <option value="">Sin sección</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>

          {subsectionOptions.length > 0 ? (
            <label className="grid gap-2">
              <span className="font-mono text-[0.58rem] uppercase tracking-[0.12em] text-fg-faint">
                Subsección (opcional)
              </span>
              <select
                name="subsection"
                value={subsection}
                onChange={(event) => setSubsection(event.target.value)}
                className="min-h-12 w-full rounded-xl border border-line bg-midnight px-4 text-base text-fg outline-none focus:border-sand sm:text-sm"
              >
                <option value="">Sin subsección</option>
                {subsectionOptions.map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
              <span className="text-xs text-fg-faint">Ayuda a organizar la sección sin sobrecargar el menú principal.</span>
            </label>
          ) : <input type="hidden" name="subsection" value="" />}

          <label className="grid gap-2">
            <span className="flex items-center justify-between gap-3 font-mono text-[0.58rem] uppercase tracking-[0.12em] text-fg-faint">
              Título
              <span>
                {title.length}/{TITLE_MAX}
              </span>
            </span>
            <textarea
              ref={titleInputRef}
              name="title"
              value={title}
              onChange={(event) => {
                setTitle(event.target.value);
                if (validationErrors.length > 0) setValidationErrors([]);
              }}
              maxLength={TITLE_MAX}
              rows={3}
              placeholder="Escribí un título descriptivo (mínimo 8 caracteres)"
              className="w-full resize-none rounded-xl border border-line bg-midnight px-4 py-3 font-display text-lg font-semibold leading-snug text-fg outline-none focus:border-sand"
            />
            <span className="font-mono text-[0.55rem] text-fg-faint">
              Mínimo 8 caracteres requeridos para guardar el borrador.
            </span>
          </label>

          <label className="grid gap-2">
            <span className="flex items-center justify-between gap-3 font-mono text-[0.58rem] uppercase tracking-[0.12em] text-fg-faint">
              Bajada
              <span>
                {excerpt.length}/{EXCERPT_MAX}
              </span>
            </span>
            <textarea
              ref={excerptInputRef}
              name="excerpt"
              value={excerpt}
              onChange={(event) => {
                setExcerpt(event.target.value);
                if (validationErrors.length > 0) setValidationErrors([]);
              }}
              maxLength={EXCERPT_MAX}
              rows={3}
              className="w-full resize-none rounded-xl border border-line bg-midnight px-4 py-3 text-base leading-relaxed text-fg outline-none focus:border-sand sm:text-sm"
            />
          </label>

          <div className="grid gap-2">
            <label htmlFor="article-body" className="font-mono text-[0.58rem] uppercase tracking-[0.12em] text-fg-faint">
              Cuerpo de la nota
            </label>
            <div className="flex flex-wrap gap-1 sm:gap-1.5 rounded-xl border border-line bg-surface/55 p-1.5 sm:p-2 w-full max-w-full" aria-label="Herramientas de formato Markdown">
              {markdownTools.map(({ label, icon: Icon, before, after, sample }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => insertMarkdown(before, after, sample)}
                  aria-label={label}
                  title={label}
                  className="grid size-9 sm:size-10 place-items-center rounded-lg text-fg-muted transition-colors hover:bg-cyan/10 hover:text-cyan shrink-0"
                >
                  <Icon size={16} aria-hidden />
                </button>
              ))}
            </div>
            <textarea
              ref={bodyInput}
              id="article-body"
              name="body"
              value={body}
              onChange={(event) => setBody(event.target.value)}
              rows={14}
              className="w-full rounded-xl border border-line bg-midnight px-4 py-3 text-base leading-relaxed text-fg outline-none focus:border-sand sm:text-sm"
            />
            <span className="font-mono text-[0.55rem] leading-relaxed text-fg-faint">
              Podés usar formato Markdown. Si no lo conocés, usá los botones de arriba.
            </span>
            <details className="rounded-xl border border-line bg-surface/35 p-4">
              <summary className="cursor-pointer text-sm font-semibold text-fg">Vista previa del cuerpo</summary>
              <div className="mt-4 border-t border-line pt-1">
                <MarkdownContent body={body} compact />
              </div>
            </details>
          </div>

          <label className="grid gap-2">
            <span className="font-mono text-[0.58rem] uppercase tracking-[0.12em] text-fg-faint">
              Prioridad editorial
            </span>
            <select
              name="priority"
              value={priority}
              onChange={(event) => setPriority(event.target.value)}
              className="min-h-12 w-full rounded-xl border border-line bg-midnight px-4 text-base text-fg outline-none focus:border-sand sm:text-sm"
            >
              <option value="1">1 — baja</option>
              <option value="2">2</option>
              <option value="3">3 — normal</option>
              <option value="4">4</option>
              <option value="5">5 — alta</option>
            </select>
            <span className="font-mono text-[0.55rem] leading-relaxed text-fg-faint">
              Prioridad editorial (1 = baja · 3 = normal · 5 = alta). Define el orden
              en los listados. La tapa se elige con “Destacada”.
            </span>
          </label>

          <details className="rounded-xl border border-line bg-surface/45 px-4 py-3 text-xs leading-relaxed text-fg-muted">
            <summary className="cursor-pointer font-semibold text-fg">¿Cómo se ordena el portal?</summary>
            <ul className="mt-3 space-y-2">
              <li>
                <strong className="text-fg">Tapa:</strong> una sola nota, la que marques como
                “Destacada”. Ocupa el bloque grande de la portada.
              </li>
              <li>
                <strong className="text-fg">Más noticias y secciones:</strong> primero las de prioridad
                más alta y, entre iguales, las más nuevas.
              </li>
              <li>
                <strong className="text-fg">Qué nivel usar:</strong> 5 = lo más importante de hoy ·
                3 = normal (casi todas) · 1 = puede esperar.
              </li>
              <li>
                <strong className="text-fg">Ojo:</strong> la prioridad no baja sola. Cuando una nota deje de
                ser urgente, volvé a ponerla en 3.
              </li>
            </ul>
          </details>

          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-line bg-surface/45 p-4">
            <input
              type="checkbox"
              name="isFeatured"
              checked={isFeatured}
              onChange={(event) => setIsFeatured(event.target.checked)}
              className="mt-1 size-4 accent-cyan"
            />
            <span>
              <span className="block text-sm font-semibold text-fg">Mostrar como noticia destacada</span>
              <span className="mt-1 block text-xs leading-relaxed text-fg-faint">
                Ocupa el bloque principal de la portada. Al elegirla, la destacada anterior se desmarca automáticamente.
              </span>
            </span>
          </label>

          {/* --- Imagen destacada --- */}
          <div ref={imageSectionRef}>
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
                  JPG, PNG o WebP · ideal 1600×900 · máximo 3 MB
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

            {imageWarning ? (
              <p className="mt-2 rounded-xl border border-cyan/25 bg-cyan/[0.06] px-4 py-3 text-sm text-fg-muted">
                {imageWarning}
              </p>
            ) : null}

            <p className="mt-3 rounded-xl border border-line bg-surface/35 px-4 py-3 text-xs leading-relaxed text-fg-muted">
              <strong className="font-semibold text-fg">Encuadre editorial 16:9.</strong>{" "}
              El portal respeta el formato 1600×900. Para que también funcione bien al compartir,
              mantené logos, personas y textos dentro de la zona central, dejando cerca de un 10% de
              margen en cada borde.
            </p>

            <label className="mt-4 grid gap-2">
              <span className="flex items-center justify-between gap-3 font-mono text-[0.58rem] uppercase tracking-[0.12em] text-fg-faint">
                Texto alternativo
                <span>
                  {imageAlt.length}/{IMAGE_ALT_MAX}
                </span>
              </span>
              <input
                ref={imageAltInputRef}
                type="text"
                name="imageAlt"
                value={imageAlt}
                onChange={(event) => {
                  setImageAlt(event.target.value);
                  if (validationErrors.length > 0) setValidationErrors([]);
                }}
                maxLength={IMAGE_ALT_MAX}
                placeholder="Qué se ve en la foto"
                className="min-h-12 w-full rounded-xl border border-line bg-midnight px-4 text-base text-fg outline-none focus:border-sand sm:text-sm"
              />
              <span className="font-mono text-[0.55rem] leading-relaxed text-fg-faint">
                Obligatorio para publicar: es lo que leen los lectores de pantalla y lo
                que aparece si la imagen no carga.
              </span>
            </label>
          </div>

          <label className="grid gap-2">
            <span className="flex items-center justify-between gap-3 font-mono text-[0.58rem] uppercase tracking-[0.12em] text-fg-faint">
              Firma de la nota (opcional)
              <span>
                {byline.trim().length}/{BYLINE_MAX}
              </span>
            </span>
            <input
              type="text"
              name="byline"
              value={byline}
              onChange={(event) => setByline(event.target.value)}
              maxLength={BYLINE_MAX}
              placeholder="Ej. Redacción o Nombre y apellido del autor"
              className="min-h-12 w-full rounded-xl border border-line bg-midnight px-4 text-base text-fg outline-none focus:border-sand sm:text-sm"
            />
            <span className="font-mono text-[0.55rem] leading-relaxed text-fg-faint">
              Si lo dejás vacío, la noticia se publicará sin firma.
            </span>
          </label>
        </div>
      </div>

      {/* --- Vista previa + guardar --- */}
      <aside className="w-full min-w-0 max-w-full lg:sticky lg:top-24 lg:self-start">
        <p className="mb-2 font-mono text-[0.58rem] uppercase tracking-[0.12em] text-fg-faint">
          Vista previa
        </p>
        <div className="overflow-hidden rounded-2xl border border-line bg-midnight">
          <div className="relative aspect-video bg-surface">
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
            {imageUrl ? (
              <div
                className="pointer-events-none absolute inset-[9%] rounded-lg border border-dashed border-white/60 shadow-[0_0_0_1px_rgba(0,0,0,0.2)]"
                aria-hidden
              >
                <span className="absolute right-1.5 top-1.5 rounded bg-black/65 px-1.5 py-0.5 font-mono text-[0.48rem] uppercase tracking-[0.08em] text-white/90">
                  Zona segura
                </span>
              </div>
            ) : null}
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
            {bylinePreview ? (
              <p className="mt-3 text-xs leading-snug text-fg-faint">
                {bylinePreview}
              </p>
            ) : null}
          </div>
        </div>

        {/* Requisitos mínimos / checklist editorial */}
        <div className="mt-4 rounded-xl border border-line bg-surface/50 p-4 text-xs text-fg-muted">
          <div className="flex items-center gap-2 font-semibold text-fg">
            <Info size={14} className="text-sand shrink-0" />
            <span>{isEditing ? "Requisitos para publicar" : "Requisitos para borrador"}</span>
          </div>

          {!isEditing ? (
            <div className="mt-2.5 space-y-2">
              <ul className="space-y-1.5 font-mono text-[0.62rem]">
                <li
                  className={`flex items-center gap-2 ${
                    title.trim().length >= 8 ? "text-emerald-500 font-medium" : "text-fg-faint"
                  }`}
                >
                  <span className="w-3.5 text-center font-bold">
                    {title.trim().length >= 8 ? "✓" : "○"}
                  </span>
                  <span>Título: mín. 8 caracteres ({title.trim().length}/8)</span>
                </li>
              </ul>
              <p className="text-[0.68rem] text-fg-faint leading-relaxed">
                Solo necesitás el título para guardar el borrador. Podés completar la bajada, el cuerpo y la foto más adelante desde la edición.
              </p>
            </div>
          ) : (
            <div className="mt-2.5 space-y-2">
              <ul className="space-y-1.5 font-mono text-[0.62rem]">
                <li
                  className={`flex items-center gap-2 ${
                    title.trim().length >= 8 ? "text-emerald-500 font-medium" : "text-fg-faint"
                  }`}
                >
                  <span className="w-3.5 text-center font-bold">
                    {title.trim().length >= 8 ? "✓" : "○"}
                  </span>
                  <span>Título ({title.trim().length}/8 mín.)</span>
                </li>
                <li
                  className={`flex items-center gap-2 ${
                    excerpt.trim().length >= 20 ? "text-emerald-500 font-medium" : "text-fg-faint"
                  }`}
                >
                  <span className="w-3.5 text-center font-bold">
                    {excerpt.trim().length >= 20 ? "✓" : "○"}
                  </span>
                  <span>Bajada ({excerpt.trim().length}/20 mín.)</span>
                </li>
                <li
                  className={`flex items-center gap-2 ${
                    body.trim().length >= 120 ? "text-emerald-500 font-medium" : "text-fg-faint"
                  }`}
                >
                  <span className="w-3.5 text-center font-bold">
                    {body.trim().length >= 120 ? "✓" : "○"}
                  </span>
                  <span>Cuerpo ({body.trim().length}/120 mín.)</span>
                </li>
                <li
                  className={`flex items-center gap-2 ${
                    imagePath && imageAlt.trim().length >= 10
                      ? "text-emerald-500 font-medium"
                      : "text-fg-faint"
                  }`}
                >
                  <span className="w-3.5 text-center font-bold">
                    {imagePath && imageAlt.trim().length >= 10 ? "✓" : "○"}
                  </span>
                  <span>
                    Foto con descripción (
                    {!imagePath
                      ? "falta foto"
                      : imageAlt.trim().length < 10
                        ? `alt: ${imageAlt.trim().length}/10`
                        : "completo"}
                    )
                  </span>
                </li>
              </ul>
            </div>
          )}
        </div>

        {validationErrors.length > 0 ? (
          <div
            role="alert"
            className="mt-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs text-amber-800 dark:text-amber-300"
          >
            <div className="flex items-start gap-2">
              <AlertCircle size={16} className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden />
              <div className="flex-1">
                <p className="font-semibold">
                  {validationErrors.length === 1 ? validationErrors[0] : "Requisitos pendientes:"}
                </p>
                {validationErrors.length > 1 ? (
                  <ul className="mt-1.5 space-y-1 font-mono text-[0.62rem]">
                    {validationErrors.map((err, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="font-bold">•</span>
                        <span>{err}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </div>
          </div>
        ) : null}

        {state && !state.ok ? (
          <div
            role="alert"
            className="mt-3 rounded-xl border border-red-400/30 bg-red-400/[0.07] px-4 py-3 text-sm text-red-200"
          >
            <div className="flex items-start gap-2">
              <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-400" aria-hidden />
              <div className="flex-1">
                <p className="font-semibold text-xs text-red-100">{state.error}</p>
                {state.issues && state.issues.length > 1 ? (
                  <ul className="mt-1.5 space-y-1 font-mono text-[0.62rem] text-red-200/90">
                    {state.issues.map((issue, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="font-bold text-red-400">•</span>
                        <span>{issue}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </div>
          </div>
        ) : null}

        {state && state.ok ? (
          <p className="mt-3 flex items-start gap-2 rounded-xl border border-emerald-400/30 bg-emerald-400/[0.07] px-4 py-3 text-sm text-emerald-700 dark:text-emerald-200">
            <Check size={16} className="mt-0.5 shrink-0" aria-hidden />
            Cambios guardados.
          </p>
        ) : null}

        <div className="mt-4 grid gap-2">
          {isEditing && article?.status !== "published" ? (
            <button
              type="submit"
              name="intent"
              value="publish"
              disabled={pending || uploading}
              className="btn bg-sand w-full text-midnight hover:bg-sand/90 disabled:opacity-60"
            >
              {pending ? "Publicando…" : "Publicar noticia"}
              <Send size={15} aria-hidden />
            </button>
          ) : null}

          <div className="grid gap-2 sm:grid-cols-2 w-full">
            {article ? (
              <Link
                href={`/tv/panel/notas/${article.id}/vista-previa`}
                className="btn btn-ghost px-3"
              >
                <Eye size={16} aria-hidden />
                Previsualizar
              </Link>
            ) : null}
            <button
              type="submit"
              name="intent"
              value="save"
              disabled={pending || uploading}
              className={`btn px-3 w-full disabled:opacity-60 ${
                isEditing && article?.status !== "published"
                  ? "btn-ghost"
                  : "bg-sand text-midnight hover:bg-sand/90"
              } ${!article ? "sm:col-span-2" : ""}`}
            >
              {pending ? "Guardando…" : isEditing ? "Guardar borrador" : "Crear borrador"}
              <Save size={15} aria-hidden />
            </button>
          </div>
        </div>
      </aside>
    </form>
  );
}
