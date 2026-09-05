import Link from "next/link";
import { ArrowUpRight, Play } from "lucide-react";

import { ScrollToTop } from "@/components/layout/scroll-to-top";
import { TvLogo } from "@/components/tv/tv-logo";

const youtubeLive = "https://www.youtube.com/@killatvok/streams";

export function TvFooter() {
  return (
    <>
      <footer className="border-t border-line bg-night/55">
        <div className="shell py-10 sm:py-12">
          <div className="grid gap-9 sm:grid-cols-[minmax(0,1.35fr)_minmax(10rem,0.65fr)] lg:grid-cols-[minmax(0,1.5fr)_repeat(2,minmax(10rem,0.55fr))]">
            <div>
              <Link href="/tv" aria-label="Portada de Killa TV" className="inline-flex">
                <TvLogo />
              </Link>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-fg-muted">
                Noticias, historias y actualidad de las comunidades del norte argentino.
                Una señal cercana, hecha desde el territorio.
              </p>
            </div>

            <div>
              <p className="font-mono text-[0.68rem] uppercase tracking-[0.16em] text-sand">
                Explorar
              </p>
              <nav className="mt-4 grid gap-2.5 text-sm text-fg-muted" aria-label="Secciones del portal">
                <Link href="/tv" className="transition-colors hover:text-sand">Portada</Link>
                <Link href="/tv/categoria/noticias" className="transition-colors hover:text-sand">Noticias</Link>
                <Link href="/tv/categoria/deportes" className="transition-colors hover:text-sand">Deportes</Link>
                <Link href="/tv/categoria/turismo" className="transition-colors hover:text-sand">Turismo</Link>
              </nav>
            </div>

            <div className="sm:col-start-2 lg:col-start-auto">
              <p className="font-mono text-[0.68rem] uppercase tracking-[0.16em] text-sand">
                La red Killa
              </p>
              <div className="mt-4 grid gap-3 text-sm text-fg-muted">
                <a
                  href={youtubeLive}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 transition-colors hover:text-red-400"
                >
                  <Play size={13} fill="currentColor" aria-hidden />
                  Señal en vivo
                </a>
                <Link href="/" className="inline-flex items-center gap-1.5 transition-colors hover:text-sand">
                  Killa Internet
                  <ArrowUpRight size={13} aria-hidden />
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-4 border-t border-line pt-5 text-xs text-fg-faint sm:flex-row sm:items-center sm:justify-between">
            <p>© 2026 Killa TV · Norte argentino</p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <a
                href="https://www.digitalmatchglobal.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-1.5 rounded-full border border-sand/20 bg-sand/[0.04] px-3 py-1.5 transition-colors hover:border-sand/45"
                aria-label="Sitio desarrollado por DigitalMatchGlobal"
              >
                <span className="text-[0.6rem] uppercase tracking-[0.13em] text-fg-faint">Desarrollado por</span>
                <span className="font-display text-[0.68rem] font-semibold text-sand transition-colors group-hover:text-fg">
                  DigitalMatchGlobal
                </span>
              </a>
              <Link
                href="/tv/panel"
                className="text-[0.62rem] uppercase tracking-[0.12em] text-fg-faint/45 transition-colors hover:text-fg-muted"
                rel="nofollow"
              >
                Administración
              </Link>
            </div>
          </div>
        </div>
      </footer>
      <ScrollToTop />
    </>
  );
}

