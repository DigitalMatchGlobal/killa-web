import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  LockKeyhole,
  Play,
  Share2,
} from "lucide-react";

import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { tvNews } from "@/lib/tv-news";

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

const youtubeLive = "https://www.youtube.com/@killatvok/streams";
const featured = tvNews[0];

export default function KillaTvPage() {
  return (
    <div className="min-h-screen bg-midnight text-fg">
      <header className="sticky top-0 z-40 border-b border-line bg-midnight/88 backdrop-blur-xl">
        <div className="shell flex h-[72px] items-center justify-between gap-4">
          <Link href="/" aria-label="Volver a Killa Internet" className="shrink-0">
            <Logo priority />
          </Link>

          <div className="flex items-center gap-2">
            <a
              href={youtubeLive}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden min-h-10 items-center gap-2 rounded-full border border-red-400/25 bg-red-400/[0.06] px-4 font-display text-sm font-semibold text-fg sm:inline-flex"
            >
              <span className="size-2 rounded-full bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.75)]" aria-hidden />
              Señal en vivo
            </a>
            <ThemeToggle />
            <Link
              href="/"
              className="inline-flex min-h-10 items-center gap-2 rounded-full border border-line px-3.5 font-display text-xs font-semibold text-fg-muted transition-colors hover:border-sand/60 hover:text-fg sm:text-sm"
            >
              <ArrowLeft size={15} aria-hidden />
              <span className="hidden sm:inline">Killa Internet</span>
              <span className="sm:hidden">Volver</span>
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden border-b border-line">
          <div className="absolute inset-0 -z-20 grid-weave opacity-30" aria-hidden />
          <div
            className="absolute inset-0 -z-10"
            style={{
              background:
                "radial-gradient(70% 65% at 72% 25%, rgba(233,208,160,0.16), transparent 72%)",
            }}
            aria-hidden
          />

          <div className="shell py-8 sm:py-12">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="inline-flex rounded-full border border-sand/25 bg-sand/[0.06] px-3 py-1.5 font-mono text-[0.58rem] uppercase tracking-[0.13em] text-sand">
                Mockup editorial · contenido inicial de muestra
              </p>
              <nav className="flex gap-4 font-mono text-[0.62rem] uppercase tracking-[0.12em] text-fg-muted" aria-label="Categorías">
                <span>Noticias</span>
                <span>Deportes</span>
                <span>Turismo</span>
              </nav>
            </div>

            <div className="mt-8 grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-end lg:gap-12">
              <div>
                <p className="eyebrow text-sand">La señal del norte</p>
                <h1 className="display mt-4 text-[clamp(3.5rem,15vw,6.8rem)] lowercase">
                  killa<span className="text-sand">tv</span>
                </h1>
                <p className="mt-4 max-w-md text-fg-muted">
                  Un portal de noticias propio, preparado para que el equipo de prensa
                  publique y comparta sin intervención técnica.
                </p>

                <div className="mt-6 flex flex-wrap gap-2.5">
                  <a href="#ultimas" className="btn btn-primary">
                    Ver noticias
                    <ArrowRight size={17} aria-hidden />
                  </a>
                  <a
                    href={youtubeLive}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-ghost sm:hidden"
                  >
                    <Play size={16} fill="currentColor" aria-hidden />
                    Ver vivo
                  </a>
                </div>
              </div>

              <a
                href={"/tv/noticias/" + featured.slug}
                className="group relative block aspect-[4/3] overflow-hidden rounded-[1.4rem] border border-line bg-surface sm:aspect-[16/9]"
              >
                <Image
                  src={featured.image}
                  alt={featured.imageAlt}
                  fill
                  sizes="(max-width: 1024px) 100vw, 760px"
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.025]"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent" aria-hidden />
                <div className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-7">
                  <p className="font-mono text-[0.62rem] uppercase tracking-[0.15em] text-sand">
                    {featured.category} · Destacada
                  </p>
                  <h2 className="mt-2 max-w-2xl font-display text-[clamp(1.35rem,4vw,2.2rem)] font-semibold leading-tight tracking-tight">
                    {featured.title}
                  </h2>
                  <p className="mt-2 hidden max-w-xl text-sm text-white/70 sm:block">
                    {featured.excerpt}
                  </p>
                </div>
              </a>
            </div>
          </div>
        </section>

        <section id="ultimas" className="shell section-pad">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow text-sand">Portada de noticias</p>
              <h2 className="display mt-4 text-[clamp(2rem,7vw,3.4rem)]">
                Últimas publicaciones
              </h2>
            </div>
            <p className="max-w-sm text-sm text-fg-muted">
              Tres noticias iniciales incluidas para entregar el portal listo para operar.
            </p>
          </div>

          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {tvNews.map((article) => (
              <article key={article.slug} className="card group overflow-hidden">
                <Link href={"/tv/noticias/" + article.slug} className="block">
                  <div className="relative aspect-[16/10] overflow-hidden border-b border-line">
                    <Image
                      src={article.image}
                      alt={article.imageAlt}
                      fill
                      sizes="(max-width: 1024px) 100vw, 400px"
                      className="object-cover transition-transform duration-700 group-hover:scale-[1.035]"
                    />
                  </div>
                  <div className="p-5 sm:p-6">
                    <div className="flex items-center justify-between gap-3 font-mono text-[0.58rem] uppercase tracking-[0.11em]">
                      <span className="text-sand">{article.category}</span>
                      <span className="inline-flex items-center gap-1.5 text-fg-faint">
                        <CalendarDays size={12} aria-hidden />
                        30 AGO
                      </span>
                    </div>
                    <h3 className="mt-4 font-display text-xl font-semibold leading-tight tracking-tight">
                      {article.title}
                    </h3>
                    <p className="mt-3 text-sm text-fg-muted">{article.excerpt}</p>
                    <span className="mt-6 inline-flex items-center gap-2 font-display text-sm font-semibold text-sand">
                      Leer nota
                      <ArrowUpRight size={15} aria-hidden />
                    </span>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section className="border-y border-line bg-night/70">
          <div className="shell grid gap-8 py-10 lg:grid-cols-[1fr_auto] lg:items-center lg:py-12">
            <div className="flex items-start gap-4">
              <span className="grid size-11 shrink-0 place-items-center rounded-full border border-sand/25 bg-sand/[0.07] text-sand">
                <LockKeyhole size={19} aria-hidden />
              </span>
              <div>
                <p className="font-mono text-[0.6rem] uppercase tracking-[0.14em] text-sand">
                  Incluido en la Etapa 1
                </p>
                <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight">
                  Panel editorial para el equipo de prensa
                </h2>
                <p className="mt-2 max-w-2xl text-sm text-fg-muted">
                  Acceso privado, alta, edición, vista previa, publicación, baja de notas
                  y carga de imágenes. La versión final incluye capacitación.
                </p>
              </div>
            </div>
            <Link href="/tv/panel" className="btn btn-ghost w-full border-sand/35 hover:border-sand/70 lg:w-auto">
              Ver mockup del panel
              <ArrowUpRight size={17} aria-hidden />
            </Link>
          </div>
        </section>

        <section className="shell py-10 sm:py-12">
          <div className="flex flex-col gap-5 rounded-[1.4rem] border border-line bg-surface/55 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <div className="flex items-start gap-4">
              <Share2 size={20} className="mt-1 shrink-0 text-cyan" aria-hidden />
              <div>
                <h2 className="font-display text-xl font-semibold">
                  Cada nota, lista para compartir
                </h2>
                <p className="mt-1 max-w-xl text-sm text-fg-muted">
                  Título, imagen destacada y vista previa optimizada para WhatsApp y redes.
                </p>
              </div>
            </div>
            <Link href={"/tv/noticias/" + featured.slug} className="btn btn-ghost w-full sm:w-auto">
              Ver una nota
              <ArrowUpRight size={17} aria-hidden />
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-line">
        <div className="shell flex flex-col gap-2 py-6 font-mono text-xs text-fg-faint sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Killa TV · Norte argentino</p>
          <Link href="/" className="transition-colors hover:text-sand">
            Volver a Killa Comunicaciones
          </Link>
        </div>
      </footer>
    </div>
  );
}
