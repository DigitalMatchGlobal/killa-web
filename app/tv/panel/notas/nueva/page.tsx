import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { ArticleForm } from "@/components/panel/article-form";
import { PanelHeader } from "@/components/panel/panel-header";
import { requireEditorialStaff } from "@/lib/editorial/auth";
import { getCategories } from "@/lib/editorial/queries";

/** Alta de noticia. Nace como borrador; publicar es un paso aparte. */
export const dynamic = "force-dynamic";

export default async function NewArticlePage() {
  const profile = await requireEditorialStaff();
  const categories = await getCategories();

  return (
    <>
      <PanelHeader profile={profile} />

      <main className="shell py-6 sm:py-9">
        <Link
          href="/tv/panel"
          className="inline-flex items-center gap-2 text-sm text-fg-muted hover:text-fg"
        >
          <ArrowLeft size={16} aria-hidden />
          Noticias
        </Link>

        <div className="mt-5">
          <p className="eyebrow text-sand">Alta editorial</p>
          <h1 className="display mt-3 text-[clamp(2rem,8vw,3.5rem)]">Nueva noticia</h1>
          <p className="mt-2 text-sm text-fg-muted">
            Se guarda como borrador. Nada sale al portal hasta que la publiquen.
          </p>
        </div>

        <ArticleForm categories={categories} />
      </main>
    </>
  );
}
