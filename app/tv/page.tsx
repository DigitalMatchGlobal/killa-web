import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
} from "lucide-react";

import { ArticleCard } from "@/components/tv/article-card";
import { TvFooter } from "@/components/tv/tv-footer";
import { TvPublicHeader } from "@/components/tv/tv-public-header";
import { formatCardDate } from "@/lib/editorial/format";
import { getCategories, getTvHomeData } from "@/lib/editorial/queries";
import type { Article } from "@/lib/editorial/types";

export const metadata: Metadata = {
  title: "Killa TV",
  description:
    "Noticias y actualidad regional. El portal editorial de Killa TV para las comunidades del norte argentino.",
  alternates: { canonical: "/tv" },
  openGraph: {
    type: "website",
    locale: "es_AR",
    url: "/tv",
    title: "Killa TV — La señal del norte",
    description:
      "Noticias, deporte, turismo y actualidad de las comunidades del norte argentino.",
    images: [
      {
        url: "/og-tv.png",
        width: 1536,
        height: 1024,
        alt: "Killa TV — La señal del norte",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Killa TV — La señal del norte",
    description:
      "Noticias, deporte, turismo y actualidad de las comunidades del norte argentino.",
    images: ["/og-tv.png"],
  },
};

/** Se revalida sola cada 5 minutos; el panel además invalida al publicar. */
export const revalidate = 300;

function publicationDate() {
  const formatted = new Intl.DateTimeFormat("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "America/Argentina/Salta",
  }).format(new Date());

  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

function compactPublicationDate() {
  return new Intl.DateTimeFormat("es-AR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "America/Argentina/Salta",
  }).format(new Date());
}

function SecondaryStory({ article }: { article: Article }) {
  return (
    <article className="group border-t border-line py-5 first:border-t-0 first:pt-0">
      <Link
        href={`/tv/noticias/${article.slug}`}
        className="grid grid-cols-[7rem_minmax(0,1fr)] gap-4 sm:grid-cols-[9rem_minmax(0,1fr)] lg:grid-cols-1"
      >
        <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-surface lg:aspect-[16/9]">
          {article.featuredImageUrl ? (
            <Image
              src={article.featuredImageUrl}
              alt={article.imageAlt}
              fill
              sizes="(max-width: 640px) 112px, (max-width: 1024px) 144px, 360px"
              className="object-cover transition-transform duration-700 group-hover:scale-[1.035]"
            />
          ) : null}
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs uppercase tracking-[0.1em]">
            <span className="font-semibold text-sand">{article.category.name}</span>
            <span className="text-fg-faint">{formatCardDate(article.publishedAt)}</span>
          </div>
          <h3 className="mt-2 font-display text-base font-semibold leading-[1.2] tracking-tight transition-colors group-hover:text-sand sm:text-lg lg:text-xl">
            {article.title}
          </h3>
          <p className="mt-2 hidden text-sm leading-relaxed text-fg-muted lg:line-clamp-2 lg:block">
            {article.excerpt}
          </p>
        </div>
      </Link>
    </article>
  );
}

export default async function KillaTvPage() {
  const [{ featured, latest }, categories] = await Promise.all([
    getTvHomeData({ latestLimit: 9 }),
    getCategories(),
  ]);

  const coverStories = latest.items.slice(0, 2);
  const remainingStories = latest.items.slice(2);

  return (
    <div className="min-h-screen bg-midnight text-fg">
      <TvPublicHeader categories={categories} isHome />

      <main>
        <section className="shell py-7 sm:py-10">
          <div className="mb-5 flex items-center gap-3 border-b border-line pb-3">
            <span className="size-2 rounded-full bg-sand shadow-[0_0_12px_rgb(var(--sand)/0.55)]" aria-hidden />
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-sand">
              La portada
            </p>
            <span className="ml-auto text-right text-xs text-fg-faint">
              <span className="sm:hidden">{compactPublicationDate()}</span>
              <span className="hidden sm:inline">{publicationDate()}</span>
            </span>
          </div>

          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.7fr)_minmax(18rem,0.7fr)] lg:gap-10">
            {featured ? (
              <article className="min-w-0">
                <Link href={`/tv/noticias/${featured.slug}`} className="group block">
                  <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-surface sm:aspect-[16/9]">
                    {featured.featuredImageUrl ? (
                      <Image
                        src={featured.featuredImageUrl}
                        alt={featured.imageAlt}
                        fill
                        sizes="(max-width: 1024px) 100vw, 820px"
                        className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                        priority
                      />
                    ) : null}
                    <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/45 to-transparent" aria-hidden />
                    <span className="absolute left-4 top-4 rounded-full bg-sand px-3 py-1.5 text-xs font-bold uppercase tracking-[0.09em] text-[#161006] sm:left-5 sm:top-5">
                      Noticia destacada
                    </span>
                  </div>

                  <div className="pt-5 sm:pt-6">
                    <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.11em]">
                      <span className="font-bold text-sand">{featured.category.name}</span>
                      <span className="text-line-strong" aria-hidden>•</span>
                      <span className="inline-flex items-center gap-1.5 text-fg-faint">
                        <CalendarDays size={13} aria-hidden />
                        {formatCardDate(featured.publishedAt)}
                      </span>
                    </div>
                    <h2 className="mt-3 max-w-4xl font-display text-[clamp(1.68rem,6.7vw,3.5rem)] font-bold leading-[1.06] tracking-[-0.04em] transition-colors group-hover:text-sand">
                      {featured.title}
                    </h2>
                    <p className="mt-4 max-w-3xl text-base leading-relaxed text-fg-muted sm:text-lg">
                      {featured.excerpt}
                    </p>
                    <span className="mt-5 inline-flex items-center gap-2 font-display text-sm font-semibold text-sand">
                      Leer la noticia
                      <ArrowRight size={16} aria-hidden />
                    </span>
                  </div>
                </Link>
              </article>
            ) : (
              <div className="grid min-h-80 place-items-center rounded-2xl border border-dashed border-line-strong bg-surface/40 p-8 text-center text-base text-fg-muted">
                La primera noticia publicada desde el panel aparecerá como portada.
              </div>
            )}

            <aside aria-labelledby="latest-cover-title">
              <div className="flex items-center justify-between border-b-2 border-sand pb-3">
                <h2 id="latest-cover-title" className="font-display text-xl font-bold tracking-tight">
                  Últimas noticias
                </h2>
                <span className="font-mono text-xs text-fg-faint">EN ORDEN</span>
              </div>
              <div className="pt-5 sm:pt-6">
                {coverStories.map((article) => (
                  <SecondaryStory key={article.id} article={article} />
                ))}
                {coverStories.length === 0 ? (
                  <p className="py-6 text-sm text-fg-muted">
                    Las próximas publicaciones aparecerán acá en orden cronológico.
                  </p>
                ) : null}
              </div>
            </aside>
          </div>
        </section>

        {remainingStories.length > 0 ? (
          <section className="shell border-t border-line py-10 sm:py-14">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.15em] text-sand">
                  Actualidad regional
                </p>
                <h2 className="mt-2 font-display text-[clamp(1.8rem,5vw,2.8rem)] font-bold tracking-tight">
                  Más publicaciones
                </h2>
              </div>
              <span className="hidden text-sm text-fg-faint sm:block">
                {latest.total} noticias publicadas
              </span>
            </div>
            <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {remainingStories.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          </section>
        ) : null}

      </main>
      <TvFooter />
    </div>
  );
}
