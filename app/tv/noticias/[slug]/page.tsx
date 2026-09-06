import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ArticleCard } from "@/components/tv/article-card";
import { ArticleView } from "@/components/tv/article-view";
import { TvFooter } from "@/components/tv/tv-footer";
import { TvPublicHeader } from "@/components/tv/tv-public-header";
import { getArticleBySlug, getCategories, getLatestArticles, getPublishedSlugs } from "@/lib/editorial/queries";

/**
 * Nota pública. Sale de la base con la clave anónima, así que la RLS garantiza
 * que un borrador o una nota archivada devuelvan 404 incluso si alguien
 * adivina el slug.
 *
 * Se revalida cada 5 minutos y las Server Actions del panel llaman a
 * `revalidatePath` al publicar, editar o archivar: la nota aparece o
 * desaparece del sitio sin esperar el próximo build.
 */
export const revalidate = 300;

export async function generateStaticParams() {
  const slugs = await getPublishedSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return {};

  const canonical = `/tv/noticias/${article.slug}`;
  const images = article.featuredImageUrl
    ? [{ url: article.featuredImageUrl, alt: article.imageAlt }]
    : [{ url: "/og-tv.png", alt: "Killa TV" }];

  return {
    title: article.title,
    description: article.excerpt,
    alternates: { canonical },
    openGraph: {
      type: "article",
      url: canonical,
      title: article.title,
      description: article.excerpt,
      publishedTime: article.publishedAt ?? undefined,
      modifiedTime: article.updatedAt,
      section: article.category.name,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.excerpt,
      images: images.map((image) => image.url),
    },
  };
}

export default async function TvNewsDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();
  const [related, categories] = await Promise.all([
    getLatestArticles({ pageSize: 3, excludeId: article.id }),
    getCategories(),
  ]);

  return (
    <div className="min-h-screen bg-midnight text-fg">
      <TvPublicHeader categories={categories} activeCategory={article.category.slug} />

      <main>
        <ArticleView article={article} />
        {related.items.length > 0 ? (
          <section className="border-t border-line bg-night/35">
            <div className="shell py-10 sm:py-14">
              <div className="flex items-end justify-between gap-4 border-b border-line pb-4">
                <div>
                  <p className="font-mono text-xs uppercase tracking-[0.15em] text-sand">Seguir leyendo</p>
                  <h2 className="mt-2 font-display text-2xl font-bold tracking-tight sm:text-3xl">Otras noticias</h2>
                </div>
                <Link href="/tv" className="text-sm font-semibold text-fg-muted hover:text-sand">Ver portada</Link>
              </div>
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                {related.items.map((item) => <ArticleCard key={item.id} article={item} />)}
              </div>
            </div>
          </section>
        ) : null}
      </main>
      <TvFooter />
    </div>
  );
}
