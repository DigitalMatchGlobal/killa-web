import Image from "next/image";
import Link from "next/link";
import { Archive, ArrowLeft, ArrowRight, Edit3, Eye, FileText, Plus } from "lucide-react";

import { PanelHeader } from "@/components/panel/panel-header";
import { requireEditorialStaff } from "@/lib/editorial/auth";
import { formatPanelDate, STATUS_LABELS } from "@/lib/editorial/format";
import { getPanelCounts, listPanelArticles, PANEL_PAGE_SIZE } from "@/lib/editorial/panel";
import { isArticleStatus, type ArticleStatus } from "@/lib/editorial/types";

/**
 * Tablero del panel: contadores, filtro por estado y el listado paginado de
 * todas las publicaciones (borradores y archivadas incluidas).
 *
 * `dynamic = "force-dynamic"` porque acá se ve contenido no publicado: no
 * queremos que quede cacheado en ningún borde.
 */
export const dynamic = "force-dynamic";

const FILTERS: { value: ArticleStatus | "all"; label: string }[] = [
  { value: "all", label: "Todas" },
  { value: "draft", label: "Borradores" },
  { value: "published", label: "Publicadas" },
  { value: "archived", label: "Archivadas" },
];

export default async function EditorialPanelPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string; pagina?: string }>;
}) {
  const profile = await requireEditorialStaff();
  const query = await searchParams;

  const status = isArticleStatus(query.estado ?? "") ? (query.estado as ArticleStatus) : "all";
  const parsedPage = Number.parseInt(query.pagina ?? "1", 10);
  const page = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;

  const [counts, result] = await Promise.all([
    getPanelCounts(),
    listPanelArticles({ status, page, pageSize: PANEL_PAGE_SIZE }),
  ]);

  const filterHref = (value: ArticleStatus | "all") =>
    value === "all" ? "/tv/panel" : `/tv/panel?estado=${value}`;

  return (
    <>
      <PanelHeader profile={profile} />

      <main className="shell py-7 sm:py-10">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow text-sand">Administración editorial</p>
            <h1 className="display mt-3 text-[clamp(2rem,7vw,3.4rem)]">Noticias</h1>
            <p className="mt-2 text-sm text-fg-muted">
              Crear, previsualizar, publicar y archivar. Sin asistencia técnica.
            </p>
          </div>
          <Link href="/tv/panel/notas/nueva" className="btn btn-primary w-full sm:w-auto">
            <Plus size={17} aria-hidden />
            Nueva noticia
          </Link>
        </div>

        <section className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            { icon: FileText, value: counts.published, label: "Publicadas" },
            { icon: Edit3, value: counts.draft, label: "Borradores" },
            { icon: Archive, value: counts.archived, label: "Archivadas" },
            { icon: Eye, value: counts.total, label: "Total" },
          ].map(({ icon: Icon, value, label }) => (
            <article key={label} className="card p-4 sm:p-5">
              <Icon size={17} className="text-sand" aria-hidden />
              <p className="mt-4 font-display text-2xl font-semibold">{value}</p>
              <p className="mt-0.5 font-mono text-[0.58rem] uppercase tracking-[0.12em] text-fg-faint">
                {label}
              </p>
            </article>
          ))}
        </section>

        <nav
          className="mt-6 flex flex-wrap gap-2 font-mono text-[0.6rem] uppercase tracking-[0.1em]"
          aria-label="Filtrar por estado"
        >
          {FILTERS.map((filter) => (
            <Link
              key={filter.value}
              href={filterHref(filter.value)}
              aria-current={status === filter.value ? "page" : undefined}
              className={
                "rounded-full border px-3.5 py-2 transition-colors " +
                (status === filter.value
                  ? "border-sand/60 bg-sand/10 text-sand"
                  : "border-line text-fg-muted hover:border-sand/40 hover:text-fg")
              }
            >
              {filter.label}
            </Link>
          ))}
        </nav>

        <section className="mt-6 overflow-hidden rounded-2xl border border-line bg-midnight/60">
          <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3 sm:px-5">
            <h2 className="font-display text-sm font-semibold">Publicaciones</h2>
            <span className="font-mono text-[0.52rem] uppercase tracking-[0.1em] text-fg-faint">
              {result.total} {result.total === 1 ? "nota" : "notas"}
            </span>
          </div>

          {result.items.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-fg-muted">
              No hay notas con este filtro. Empezá con{" "}
              <Link href="/tv/panel/notas/nueva" className="text-sand hover:underline">
                una nueva noticia
              </Link>
              .
            </p>
          ) : (
            <div className="divide-y divide-line">
              {result.items.map((article) => (
                <article
                  key={article.id}
                  className="grid grid-cols-[56px_1fr_auto] items-center gap-3 px-4 py-4 sm:grid-cols-[84px_1fr_auto] sm:gap-4 sm:px-5"
                >
                  <div className="relative aspect-square overflow-hidden rounded-lg border border-line bg-surface">
                    {article.featuredImageUrl ? (
                      <Image
                        src={article.featuredImageUrl}
                        alt=""
                        fill
                        sizes="84px"
                        className="object-cover"
                        unoptimized
                      />
                    ) : null}
                  </div>

                  <div className="min-w-0">
                    <p className="flex flex-wrap items-center gap-2 font-mono text-[0.52rem] uppercase tracking-[0.1em]">
                      <span className="text-sand">{article.category.name}</span>
                      <span
                        className={
                          "rounded-full px-2 py-0.5 " +
                          (article.status === "published"
                            ? "bg-emerald-400/12 text-emerald-300"
                            : article.status === "archived"
                              ? "bg-fg-faint/10 text-fg-faint"
                              : "bg-sand/12 text-sand")
                        }
                      >
                        {STATUS_LABELS[article.status]}
                      </span>
                      {article.priority > 1 ? (
                        <span className="text-fg-faint">prioridad {article.priority}</span>
                      ) : null}
                    </p>
                    <h3 className="mt-1 line-clamp-2 font-display text-sm font-semibold sm:text-base">
                      {article.title}
                    </h3>
                    <p className="mt-1 font-mono text-[0.52rem] text-fg-faint">
                      {article.status === "published"
                        ? `Publicada ${formatPanelDate(article.publishedAt)}`
                        : `Modificada ${formatPanelDate(article.updatedAt)}`}
                      {article.authorName ? ` · ${article.authorName}` : ""}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/tv/panel/notas/${article.id}/vista-previa`}
                      aria-label={`Previsualizar ${article.title}`}
                      className="grid size-9 place-items-center rounded-full border border-line text-fg-muted hover:border-sand/60 hover:text-fg"
                    >
                      <Eye size={15} aria-hidden />
                    </Link>
                    <Link
                      href={`/tv/panel/notas/${article.id}`}
                      aria-label={`Editar ${article.title}`}
                      className="grid size-9 place-items-center rounded-full border border-line text-fg-muted hover:border-sand/60 hover:text-fg"
                    >
                      <Edit3 size={15} aria-hidden />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {result.pageCount > 1 ? (
          <nav
            className="mt-6 flex items-center justify-between gap-4 font-mono text-xs text-fg-muted"
            aria-label="Paginación"
          >
            {result.page > 1 ? (
              <Link
                href={`${filterHref(status)}${status === "all" ? "?" : "&"}pagina=${result.page - 1}`}
                className="btn btn-ghost"
              >
                <ArrowLeft size={15} aria-hidden />
                Anteriores
              </Link>
            ) : (
              <span />
            )}
            <span>
              Página {result.page} de {result.pageCount}
            </span>
            {result.page < result.pageCount ? (
              <Link
                href={`${filterHref(status)}${status === "all" ? "?" : "&"}pagina=${result.page + 1}`}
                className="btn btn-ghost"
              >
                Siguientes
                <ArrowRight size={15} aria-hidden />
              </Link>
            ) : (
              <span />
            )}
          </nav>
        ) : null}
      </main>
    </>
  );
}
