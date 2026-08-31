import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, CalendarDays, Share2 } from "lucide-react";

import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { site } from "@/lib/site";
import { getTvNews, tvNews } from "@/lib/tv-news";

export function generateStaticParams() {
  return tvNews.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = getTvNews(slug);
  if (!article) return {};

  return {
    title: article.title,
    description: article.excerpt,
    openGraph: {
      type: "article",
      title: article.title,
      description: article.excerpt,
      images: [{ url: article.image, alt: article.imageAlt }],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.excerpt,
      images: [article.image],
    },
  };
}

export default async function TvNewsDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getTvNews(slug);
  if (!article) notFound();

  const canonicalPath = "/tv/noticias/" + article.slug;
  const shareText = encodeURIComponent(
    article.title + " - Killa TV\n" + site.url + canonicalPath,
  );

  return (
    <div className="min-h-screen bg-midnight text-fg">
      <header className="border-b border-line bg-midnight/90 backdrop-blur-xl">
        <div className="shell flex h-[72px] items-center justify-between gap-4">
          <Link href="/" aria-label="Killa Comunicaciones">
            <Logo priority />
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

      <main>
        <article className="shell py-10 sm:py-16">
          <div className="mx-auto max-w-4xl">
            <p className="inline-flex rounded-full border border-sand/25 bg-sand/[0.06] px-3 py-1.5 font-mono text-[0.62rem] uppercase tracking-[0.14em] text-sand">
              {article.category}
            </p>
            <h1 className="display mt-5 text-[clamp(2.2rem,8vw,4.7rem)]">
              {article.title}
            </h1>
            <p className="mt-5 max-w-2xl text-lg text-fg-muted">{article.excerpt}</p>

            <div className="mt-6 flex flex-wrap items-center gap-4 font-mono text-xs text-fg-faint">
              <span className="inline-flex items-center gap-2">
                <CalendarDays size={14} aria-hidden />
                {article.date}
              </span>
              <span>·</span>
              <span>Contenido inicial de muestra</span>
            </div>

            <div className="relative mt-8 aspect-[16/10] overflow-hidden rounded-[1.4rem] border border-line bg-surface sm:mt-10">
              <Image
                src={article.image}
                alt={article.imageAlt}
                fill
                sizes="(max-width: 900px) 100vw, 900px"
                className="object-cover"
                priority
              />
            </div>

            <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_auto]">
              <div className="max-w-[68ch] space-y-5 text-[1.05rem] leading-8 text-fg-muted">
                {article.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>

              <aside className="lg:sticky lg:top-6 lg:self-start">
                <p className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-fg-faint">
                  Compartir nota
                </p>
                <div className="mt-3 flex gap-2 lg:flex-col">
                  <a
                    href={"https://wa.me/?text=" + shareText}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-line px-4 text-sm text-fg-muted hover:border-cyan/60 hover:text-fg"
                  >
                    <Share2 size={15} aria-hidden />
                    WhatsApp
                  </a>
                  <a
                    href={canonicalPath}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-line px-4 text-sm text-fg-muted hover:border-cyan/60 hover:text-fg"
                  >
                    Vista previa
                    <ArrowUpRight size={15} aria-hidden />
                  </a>
                </div>
              </aside>
            </div>
          </div>
        </article>
      </main>
    </div>
  );
}
