import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { ArticleCard } from "@/components/tv/article-card";
import { TvFooter } from "@/components/tv/tv-footer";
import { TvLogo } from "@/components/tv/tv-logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { getArticlesByCategory, getCategories } from "@/lib/editorial/queries";

/**
 * Sección (categoría) del portal.
 *
 * La paginación es real y va por query string (`?pagina=2`) aunque hoy haya
 * tres notas: el backend ya la soporta y así el día que el equipo cargue
 * cincuenta no hay que rehacer la página.
 */
export const revalidate = 300;

const PAGE_SIZE = 9;

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((category) => ({ slug: category.slug }));
}

async function findCategory(slug: string) {
  const categories = await getCategories();
  return categories.find((category) => category.slug === slug) ?? null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await findCategory(slug);
  if (!category) return {};

  return {
    title: `${category.name} · Killa TV`,
    description: `Noticias de ${category.name} en Killa TV.`,
    alternates: { canonical: `/tv/categoria/${category.slug}` },
    openGraph: {
      type: "website",
      url: `/tv/categoria/${category.slug}`,
      title: `${category.name} · Killa TV`,
      description: `Noticias de ${category.name} en Killa TV.`,
      images: [{ url: "/og-tv.png", alt: "Killa TV" }],
    },
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ pagina?: string }>;
}) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);

  const category = await findCategory(slug);
  if (!category) notFound();

  const page = Number.parseInt(query.pagina ?? "1", 10);
  const result = await getArticlesByCategory(slug, {
    page: Number.isFinite(page) && page > 0 ? page : 1,
    pageSize: PAGE_SIZE,
  });

  return (
    <div className="min-h-screen bg-midnight text-fg">
      <header className="sticky top-0 z-40 border-b border-line bg-midnight/88 backdrop-blur-xl">
        <div className="shell flex h-[72px] items-center justify-between gap-4">
          <Link href="/tv" aria-label="Portada de Killa TV" className="shrink-0">
            <TvLogo priority />
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              href="/tv"
              className="inline-flex min-h-10 items-center gap-2 rounded-full border border-line px-3.5 font-display text-xs font-semibold text-fg-muted hover:border-sand/60 hover:text-fg sm:text-sm"
            >
              <ArrowLeft size={15} aria-hidden />
              Killa TV
            </Link>
          </div>
        </div>
      </header>

      <main className="shell section-pad">
        <p className="eyebrow text-sand">Sección</p>
        <h1 className="display mt-4 text-[clamp(2.4rem,9vw,4.6rem)]">{category.name}</h1>
        <p className="mt-4 text-sm text-fg-muted">
          {result.total === 0
            ? "Todavía no hay notas publicadas en esta sección."
            : `${result.total} ${result.total === 1 ? "nota publicada" : "notas publicadas"}.`}
        </p>

        {result.items.length > 0 ? (
          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {result.items.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        ) : null}

        {result.pageCount > 1 ? (
          <nav
            className="mt-10 flex items-center justify-between gap-4 font-mono text-xs text-fg-muted"
            aria-label="Paginación"
          >
            {result.page > 1 ? (
              <Link
                href={`/tv/categoria/${category.slug}?pagina=${result.page - 1}`}
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
                href={`/tv/categoria/${category.slug}?pagina=${result.page + 1}`}
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

      <TvFooter />
    </div>
  );
}
