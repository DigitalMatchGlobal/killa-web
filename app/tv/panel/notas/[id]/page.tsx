import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";

import { ArticleForm } from "@/components/panel/article-form";
import { PanelHeader } from "@/components/panel/panel-header";
import { StatusActions } from "@/components/panel/status-actions";
import { requireEditorialStaff } from "@/lib/editorial/auth";
import { formatPanelDate } from "@/lib/editorial/format";
import { getPanelArticleById } from "@/lib/editorial/panel";
import { getCategories } from "@/lib/editorial/queries";

/** Edición de una nota, en cualquier estado. */
export const dynamic = "force-dynamic";

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const profile = await requireEditorialStaff();
  const { id } = await params;

  const [article, categories] = await Promise.all([
    getPanelArticleById(id),
    getCategories(),
  ]);

  if (!article) notFound();

  return (
    <>
      <PanelHeader profile={profile} />

      <main className="shell py-6 sm:py-9">
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
