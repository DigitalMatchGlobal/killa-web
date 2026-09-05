import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { ArticleView } from "@/components/tv/article-view";
import { requireEditorialStaff } from "@/lib/editorial/auth";
import { getPanelArticleById } from "@/lib/editorial/panel";
import { STATUS_LABELS } from "@/lib/editorial/format";

/**
 * Vista previa de una nota antes de publicarla.
 *
 * Usa el MISMO componente que la página pública (`ArticleView`), así que lo que
 * el editor ve acá es exactamente lo que va a salir: no es una maqueta
 * parecida. Sólo es accesible con sesión de staff — la nota puede ser un
 * borrador, que el público no puede leer.
 */
export const dynamic = "force-dynamic";

export default async function ArticlePreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireEditorialStaff();
  const { id } = await params;

  const article = await getPanelArticleById(id);
  if (!article) notFound();

  return (
    <div className="min-h-screen bg-midnight text-fg">
      <div className="border-b border-line bg-sand/[0.06]">
        <div className="shell flex flex-wrap items-center justify-between gap-3 py-3">
          <Link
            href={`/tv/panel/notas/${article.id}`}
            className="inline-flex items-center gap-2 text-sm text-fg-muted hover:text-fg"
          >
            <ArrowLeft size={16} aria-hidden />
            Volver a editar
          </Link>
          <p className="font-mono text-[0.58rem] uppercase tracking-[0.12em] text-sand">
            Vista previa · {STATUS_LABELS[article.status] ?? article.status}
          </p>
        </div>
      </div>

      <main>
        <ArticleView article={article} isPreview />
      </main>
    </div>
  );
}
