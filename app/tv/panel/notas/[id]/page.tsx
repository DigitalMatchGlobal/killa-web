import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, ExternalLink } from "lucide-react";

import { ArticleForm } from "@/components/panel/article-form";
import { PanelHeader } from "@/components/panel/panel-header";
import { ScrollToTopOnMount } from "@/components/panel/scroll-to-top";
import { StatusActions } from "@/components/panel/status-actions";
import { requireEditorialStaff } from "@/lib/editorial/auth";
import { formatPanelDate } from "@/lib/editorial/format";
import { getPanelArticleById } from "@/lib/editorial/panel";
import { getCategories } from "@/lib/editorial/queries";

/** Edición de una nota, en cualquier estado. */
export const dynamic = "force-dynamic";

export default async function EditArticlePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ creada?: string }>;
}) {
  const profile = await requireEditorialStaff();
  const { id } = await params;
  const query = await searchParams;
  const isNewlyCreated = query.creada === "1";

  const [article, categories] = await Promise.all([
    getPanelArticleById(id),
    getCategories(),
  ]);

  if (!article) notFound();

  return (
    <>
      <PanelHeader profile={profile} />

      <main id="panel-nota-top" className="shell py-6 sm:py-9 scroll-mt-20 w-full min-w-0 max-w-full">
        <ScrollToTopOnMount force={isNewlyCreated} />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/tv/panel"
            className="inline-flex items-center gap-2 text-sm text-fg-muted hover:text-fg"
          >
            <ArrowLeft size={16} aria-hidden />
            Noticias
          </Link>

          {article.status === "published" ? (
            <Link
              href={`/tv/noticias/${article.slug}`}
              className="inline-flex items-center gap-2 font-mono text-[0.6rem] uppercase tracking-[0.1em] text-fg-muted hover:text-sand"
            >
              Ver en el portal
              <ExternalLink size={13} aria-hidden />
            </Link>
          ) : null}
        </div>

        {isNewlyCreated ? (
          <div className="mt-4 flex items-start gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-800 dark:text-emerald-300">
            <CheckCircle2 size={18} className="shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
            <div>
              <p className="font-semibold text-sm">¡Borrador creado con éxito!</p>
              <p className="mt-0.5 text-xs text-fg-muted">
                Tu noticia ya está guardada. Podés previsualizarla, seguir completando los campos o publicarla aquí arriba cuando esté lista.
              </p>
            </div>
          </div>
        ) : null}

        <div className="mt-5">
          <p className="eyebrow text-sand">Editar</p>
          <h1 className="display mt-3 text-[clamp(1.8rem,6vw,3rem)]">{article.title}</h1>
          <p className="mt-2 font-mono text-[0.6rem] uppercase tracking-[0.1em] text-fg-faint">
            /tv/noticias/{article.slug} · creada {formatPanelDate(article.createdAt)} ·
            última modificación {formatPanelDate(article.updatedAt)}
          </p>
        </div>

        <div className="mt-6">
          <StatusActions article={article} />
        </div>

        <ArticleForm categories={categories} article={article} />
      </main>
    </>
  );
}
