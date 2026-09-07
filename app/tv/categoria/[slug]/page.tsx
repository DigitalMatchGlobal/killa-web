import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ExternalLink, Newspaper } from "lucide-react";

import { ArticleCard } from "@/components/tv/article-card";
import { InstagramIcon } from "@/components/tv/share-icons";
import { TvFooter } from "@/components/tv/tv-footer";
import { TvPublicHeader } from "@/components/tv/tv-public-header";
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
const KILLA_SPORTS_URL = "https://www.instagram.com/killasport.ar/";

function SportsNetworkPromo({ hasArticles }: { hasArticles: boolean }) {
  return (
    <section
      aria-labelledby="killa-sports-title"
      className="relative mt-10 overflow-hidden rounded-[1.5rem] border border-red-500/25 bg-night/55 p-4 shadow-[0_24px_70px_-44px_rgba(239,29,37,0.65)] sm:p-6 lg:p-8"
    >
      <div
        className="pointer-events-none absolute -right-24 -top-28 size-72 rounded-full bg-red-500/10 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-28 left-1/3 size-64 rounded-full bg-red-700/10 blur-3xl"
        aria-hidden
      />

      <div className="relative grid items-center gap-6 md:grid-cols-[minmax(14rem,0.85fr)_minmax(0,1.15fr)] md:gap-8">
        <div className="relative aspect-[1110/742] overflow-hidden rounded-[1.1rem] border border-white/10 bg-black shadow-xl">
          <Image
            src="/brand/killa-sports-concept.png"
            alt="Killa Sports"
            fill
            sizes="(max-width: 767px) 100vw, 42vw"
            className="object-cover"
          />
        </div>

        <div className="px-1 pb-2 sm:px-2">
          <p className="inline-flex items-center gap-2 font-mono text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-red-400">
            <span className="size-2 rounded-full bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.7)]" aria-hidden />
            La red deportiva de Killa
          </p>
          <h2
            id="killa-sports-title"
            className="mt-4 max-w-xl font-display text-[clamp(1.65rem,7vw,2.75rem)] font-bold leading-[1.04] tracking-[-0.035em] text-fg"
          >
            El deporte del norte se vive acá.
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-fg-muted sm:text-base">
            {hasArticles
              ? "Seguí resultados, coberturas y toda la actualidad deportiva en nuestra comunidad de Instagram."
              : "Mientras preparamos las primeras noticias deportivas del portal, seguí resultados, coberturas y toda la actualidad en nuestra cuenta de Instagram."}
          </p>
          <a
            href={KILLA_SPORTS_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Seguir a Killa Sports en Instagram (se abre en una pestaña nueva)"
            className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#ed1c24] px-5 font-display text-sm font-bold text-white shadow-[0_16px_35px_-20px_rgba(237,28,36,0.9)] transition-[background-color,transform] active:scale-[0.98] hover:bg-[#d9141c] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-400 sm:w-auto"
          >
            <InstagramIcon size={18} />
            Seguir a @killasport.ar
            <ExternalLink size={15} aria-hidden />
          </a>
        </div>
      </div>
    </section>
  );
}

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

  const categories = await getCategories();
  const category = categories.find((item) => item.slug === slug) ?? null;
  if (!category) notFound();

  const page = Number.parseInt(query.pagina ?? "1", 10);
  const result = await getArticlesByCategory(slug, {
    page: Number.isFinite(page) && page > 0 ? page : 1,
    pageSize: PAGE_SIZE,
  });

  return (
    <div className="min-h-screen bg-midnight text-fg">
      <TvPublicHeader categories={categories} activeCategory={category.slug} />

      <main className="shell py-9 sm:py-14">
        <Link
          href="/tv"
          className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line px-4 font-display text-sm font-semibold text-fg-muted transition-colors hover:border-sand/60 hover:text-sand"
        >
          <ArrowLeft size={16} aria-hidden />
          Volver a la portada
        </Link>
        <p className="eyebrow mt-8 flex w-fit text-sand">Sección</p>
        <h1 className="display mt-5 text-[clamp(2.4rem,9vw,4.6rem)]">{category.name}</h1>
        {result.total > 0 ? (
          <p className="mt-4 text-sm text-fg-muted">
            {result.total} {result.total === 1 ? "nota publicada" : "notas publicadas"}.
          </p>
        ) : null}

        {result.items.length > 0 ? (
          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {result.items.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        ) : category.slug !== "deportes" ? (
          <div className="mt-10 rounded-[1.5rem] border border-line bg-night/45 px-6 py-9 sm:px-9 sm:py-11">
            <span className="grid size-12 place-items-center rounded-full border border-sand/25 bg-sand/[0.07] text-sand">
              <Newspaper size={20} aria-hidden />
            </span>
            <h2 className="mt-5 font-display text-lg font-bold leading-tight text-fg sm:text-xl">
              Estamos preparando <span className="whitespace-nowrap">esta sección</span>
            </h2>
            <p className="mt-2 max-w-lg text-sm leading-relaxed text-fg-muted">
              Todavía no hay notas publicadas en {category.name}. Podés volver a la portada o explorar otra sección.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/tv" className="btn bg-sand text-midnight hover:bg-sand/90">
                Ver la portada
                <ArrowRight size={15} aria-hidden />
              </Link>
              {categories
                .filter((item) => item.slug !== category.slug)
                .slice(0, 1)
                .map((item) => (
                  <Link key={item.id} href={`/tv/categoria/${item.slug}`} className="btn btn-ghost">
                    Explorar {item.name}
                  </Link>
                ))}
            </div>
          </div>
        ) : null}

        {category.slug === "deportes" ? (
          <SportsNetworkPromo hasArticles={result.items.length > 0} />
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
