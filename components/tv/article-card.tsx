import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, CalendarDays } from "lucide-react";

import { formatCardDate } from "@/lib/editorial/format";
import { bylineLabel, type Article } from "@/lib/editorial/types";

/** Tarjeta de nota. La comparten la portada y las páginas de sección. */
export function ArticleCard({ article, sizes }: { article: Article; sizes?: string }) {
  return (
    <article className="card group h-full overflow-hidden active:scale-[0.985]">
      <Link
        href={`/tv/noticias/${article.slug}`}
        className="block h-full focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-sand"
      >
        <div className="relative aspect-[16/10] overflow-hidden border-b border-line bg-surface">
          {article.featuredImageUrl ? (
            <Image
              src={article.featuredImageUrl}
              alt={article.imageAlt}
              fill
              sizes={sizes ?? "(max-width: 1024px) 100vw, 400px"}
              className="object-cover transition-transform duration-700 group-hover:scale-[1.035]"
            />
          ) : null}
        </div>
        <div className="p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3 font-mono text-[0.58rem] uppercase tracking-[0.11em]">
            <span className="text-sand">{article.category.name}</span>
            <span className="inline-flex items-center gap-1.5 text-fg-faint">
              <CalendarDays size={12} aria-hidden />
              {formatCardDate(article.publishedAt)}
            </span>
          </div>
          <h3 className="mt-4 font-display text-xl font-semibold leading-tight tracking-tight">
            {article.title}
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-fg-muted">{article.excerpt}</p>
          {article.byline ? (
            <p className="mt-3 truncate text-xs leading-snug text-fg-faint">
              {bylineLabel(article.byline)}
            </p>
          ) : null}
          <span className="mt-6 inline-flex items-center gap-2 font-display text-sm font-semibold text-sand">
            Leer nota
            <ArrowUpRight size={15} aria-hidden />
          </span>
        </div>
      </Link>
    </article>
  );
}
