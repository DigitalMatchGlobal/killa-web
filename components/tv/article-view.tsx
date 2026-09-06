import Image from "next/image";
import { CalendarDays } from "lucide-react";

import { formatArticleDate } from "@/lib/editorial/format";
import type { Article } from "@/lib/editorial/types";
import { site } from "@/lib/site";
import { MarkdownContent } from "./markdown-content";
import { CopyLinkButton } from "./share-actions";
import { FacebookIcon, LinkedInIcon, WhatsAppIcon, XIcon } from "./share-icons";
import { sharePillClass } from "./share-pill";

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
  const canonicalUrl = `${site.url}${canonicalPath}`;
  const encodedUrl = encodeURIComponent(canonicalUrl);
  const publishedLabel = formatArticleDate(article.publishedAt);

  /**
   * WhatsApp, Facebook y LinkedIn arman la tarjeta con las etiquetas OG de la
   * nota, así que se les manda **sólo la URL**: si además se les pasa el
   * título, el destinatario ve el titular dos veces —una en el texto y otra en
   * la previsualización—. X es la excepción: ahí el texto sí es el cuerpo del
   * posteo y la tarjeta va aparte.
   */
  const redes = [
    {
      nombre: "WhatsApp",
      href: `https://wa.me/?text=${encodedUrl}`,
      Icono: WhatsAppIcon,
      tinte: "hover:border-emerald-400/60 hover:text-emerald-300",
    },
    {
      nombre: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      Icono: FacebookIcon,
      tinte: "hover:border-blue-400/60 hover:text-blue-300",
    },
    {
      nombre: "X",
      href: `https://x.com/intent/post?text=${encodeURIComponent(article.title)}&url=${encodedUrl}`,
      Icono: XIcon,
      tinte: "hover:border-fg/50 hover:text-fg",
    },
    {
      nombre: "LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      Icono: LinkedInIcon,
      tinte: "hover:border-sky-400/60 hover:text-sky-300",
    },
  ] as const;

  return (
    <article className="shell py-10 sm:py-16">
      <div className="mx-auto max-w-4xl">
        <p className="inline-flex rounded-full border border-sand/25 bg-sand/[0.06] px-3 py-1.5 font-mono text-[0.62rem] uppercase tracking-[0.14em] text-sand">
          {article.category.name}
        </p>
        <h1 className="display mt-5 break-words text-[clamp(2.2rem,8vw,4.7rem)]">{article.title}</h1>
        {article.excerpt ? (
          <p className="mt-5 max-w-2xl break-words text-lg text-fg-muted">{article.excerpt}</p>
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

        {/*
          Las columnas van con `minmax(0, …)` y los hijos con `min-w-0`: sin eso
          el piso de una pista de grilla es el ancho *mínimo de contenido* de lo
          que hay adentro. En mobile las dos columnas colapsan en una sola, y la
          fila de "Compartir nota" —cuatro píldoras que no se achican— estiraba
          esa única pista a ~455 px. El cuerpo de la nota se maquetaba a ese
          ancho y quedaba cortado contra el margen derecho, sin scroll para
          recuperarlo porque `body` tiene `overflow-x: hidden`.
          `npm run test:desbordes` vigila que no vuelva a pasar.
        */}
        <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_auto]">
          <div className="min-w-0 max-w-[68ch]">
            <MarkdownContent body={article.body} />
          </div>

          {isPreview ? null : (
            <aside className="min-w-0 lg:sticky lg:top-6 lg:self-start">
              <p className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-fg-faint">
                Compartir nota
              </p>
              <div className="mt-3 flex flex-wrap gap-2 lg:flex-nowrap lg:flex-col">
                {redes.map(({ nombre, href, Icono, tinte }) => (
                  <a
                    key={nombre}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Compartir en ${nombre}`}
                    className={`${sharePillClass} ${tinte}`}
                  >
                    <Icono />
                    {nombre}
                  </a>
                ))}
                <CopyLinkButton url={canonicalUrl} />
              </div>
            </aside>
          )}
        </div>
      </div>
    </article>
  );
}
