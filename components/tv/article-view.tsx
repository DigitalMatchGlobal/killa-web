import Image from "next/image";
import { CalendarDays, Share2 } from "lucide-react";

import { formatArticleDate } from "@/lib/editorial/format";
import { toParagraphs } from "@/lib/editorial/sanitize";
import type { Article } from "@/lib/editorial/types";
import { site } from "@/lib/site";

/**
 * Cuerpo de una nota. Lo comparten la página pública y la vista previa del
 * panel, así que **lo que el editor previsualiza es literalmente lo que se va
 * a publicar**, no una maqueta parecida.
 *
 * El texto del cuerpo se renderiza como nodos de React (`{parrafo}`), que React
 * escapa siempre. No hay `dangerouslySetInnerHTML` en ningún lado: no hay
 * superficie de XSS que dependa de que un sanitizador esté bien configurado.
 */
export function ArticleView({
  article,
  isPreview = false,
}: {
  article: Article;
  isPreview?: boolean;
}) {
  const canonicalPath = `/tv/noticias/${article.slug}`;
  const shareText = encodeURIComponent(
    `${article.title} - Killa TV\n${site.url}${canonicalPath}`,
  );
  const publishedLabel = formatArticleDate(article.publishedAt);
  const paragraphs = toParagraphs(article.body);

  return (
    <article className="shell py-10 sm:py-16">
      <div className="mx-auto max-w-4xl">
        <p className="inline-flex rounded-full border border-sand/25 bg-sand/[0.06] px-3 py-1.5 font-mono text-[0.62rem] uppercase tracking-[0.14em] text-sand">
          {article.category.name}
        </p>
        <h1 className="display mt-5 text-[clamp(2.2rem,8vw,4.7rem)]">{article.title}</h1>
        {article.excerpt ? (
          <p className="mt-5 max-w-2xl text-lg text-fg-muted">{article.excerpt}</p>
        ) : null}

        <div className="mt-6 flex flex-wrap items-center gap-4 font-mono text-xs text-fg-faint">
          {publishedLabel ? (
            <span className="inline-flex items-center gap-2">
              <CalendarDays size={14} aria-hidden />
              {publishedLabel}
            </span>
          ) : (
            <span className="inline-flex items-center gap-2 text-sand">
              <CalendarDays size={14} aria-hidden />
              Sin publicar
            </span>
          )}
        </div>

        {article.featuredImageUrl ? (
          <div className="relative mt-8 aspect-[16/10] overflow-hidden rounded-[1.4rem] border border-line bg-surface sm:mt-10">
            <Image
              src={article.featuredImageUrl}
              alt={article.imageAlt}
              fill
              sizes="(max-width: 900px) 100vw, 900px"
              className="object-cover"
              priority
            />
          </div>
        ) : (
          <div className="mt-8 grid aspect-[16/10] place-items-center rounded-[1.4rem] border border-dashed border-line-strong bg-surface/50 px-6 text-center text-sm text-fg-faint sm:mt-10">
            Esta nota todavía no tiene imagen destacada. Es obligatoria para publicar.
          </div>
        )}

        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_auto]">
          <div className="max-w-[68ch] space-y-5 text-[1.05rem] leading-8 text-fg-muted">
            {paragraphs.length > 0 ? (
              paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)
            ) : (
              <p className="text-fg-faint">El cuerpo de la nota está vacío.</p>
            )}
          </div>

          {isPreview ? null : (
            <aside className="lg:sticky lg:top-6 lg:self-start">
              <p className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-fg-faint">
                Compartir nota
              </p>
              <div className="mt-3 flex gap-2 lg:flex-col">
                <a
                  href={`https://wa.me/?text=${shareText}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-line px-4 text-sm text-fg-muted hover:border-cyan/60 hover:text-fg"
                >
                  <Share2 size={15} aria-hidden />
                  WhatsApp
                </a>
              </div>
            </aside>
          )}
        </div>
      </div>
    </article>
  );
}
