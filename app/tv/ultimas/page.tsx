import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { ArticleCard } from "@/components/tv/article-card";
import { TvFooter } from "@/components/tv/tv-footer";
import { TvPublicHeader } from "@/components/tv/tv-public-header";
import { getCategories, getLatestArticles } from "@/lib/editorial/queries";

/**
 * Todas las noticias publicadas, con el mismo orden que la portada
 * (prioridad editorial y luego fecha). Es a donde lleva "Ver todas las
 * noticias": la portada muestra siempre las mismas 9, así que sin esta página
 * las notas más viejas sólo se alcanzarían desde cada sección.
 *
 * La paginación va por query string (`?pagina=2`), igual que las secciones.
 */
export const revalidate = 300;

const PAGE_SIZE = 12;

export const metadata: Metadata = {
  title: "Todas las noticias · Killa TV",
  description: "Todas las noticias publicadas en Killa TV: Valle Calchaquí y todo el NOA.",
  alternates: { canonical: "/tv/ultimas" },
  openGraph: {
    type: "website",
    url: "/tv/ultimas",
    title: "Todas las noticias · Killa TV",
    description: "Todas las noticias publicadas en Killa TV: Valle Calchaquí y todo el NOA.",
    images: [{ url: "/og-tv.png?v=20260917", alt: "Killa TV — El Canal Oficial del Valle Calchaquí" }],
  },
};

export default async function AllNewsPage({
  searchParams,
}: {
  searchParams: Promise<{ pagina?: string }>;
}) {
  const query = await searchParams;
  const parsed = Number.parseInt(query.pagina ?? "1", 10);
  const page = Number.isFinite(parsed) && parsed > 0 ? parsed : 1;

  const [categories, result] = await Promise.all([
    getCategories(),
    getLatestArticles({ page, pageSize: PAGE_SIZE }),
  ]);

  // Una página fuera de rango no es "vacía": no existe.
  if (page > 1 && result.items.length === 0) notFound();

  return (
    <div className="min-h-screen bg-midnight text-fg">
      <TvPublicHeader categories={categories} />

      <main className="shell py-9 sm:py-14">
        <Link
          href="/tv"
          className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line px-4 font-display text-sm font-semibold text-fg-muted transition-colors hover:border-sand/60 hover:text-sand"
        >
          <ArrowLeft size={16} aria-hidden />
          Volver a la portada
        </Link>
        <p className="eyebrow mt-8 flex w-fit text-sand">Archivo</p>
        <h1 className="display mt-5 text-[clamp(2.4rem,9vw,4.6rem)]">Todas las noticias</h1>
        {result.total > 0 ? (
          <p className="mt-4 text-sm text-fg-muted">
            {result.total} {result.total === 1 ? "nota publicada" : "notas publicadas"}.
          </p>
        ) : null}

        {result.items.length > 0 ? (
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {result.items.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        ) : (
          <p className="mt-10 text-fg-muted">Todavía no hay notas publicadas.</p>
        )}

        {result.pageCount > 1 ? (
          <nav
            className="mt-10 flex items-center justify-between gap-4 font-mono text-xs text-fg-muted"
            aria-label="Paginación"
          >
            {result.page > 1 ? (
              <Link
                href={result.page - 1 === 1 ? "/tv/ultimas" : `/tv/ultimas?pagina=${result.page - 1}`}
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
              <Link href={`/tv/ultimas?pagina=${result.page + 1}`} className="btn btn-ghost">
                Siguientes
                <ArrowRight size={15} aria-hidden />
              </Link>
            ) : (
              <span />
            )}
          </nav>
        ) : null}
      </main>
      <TvFooter />
    </div>
  );
}
