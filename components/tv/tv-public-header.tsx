import Link from "next/link";
import { ArrowLeft, Radio } from "lucide-react";

import { ThemeToggle } from "@/components/ui/theme-toggle";
import type { Category } from "@/lib/editorial/types";
import { TvLogo } from "./tv-logo";

const youtubeLive = "https://www.youtube.com/@killatvok/streams";

export function TvPublicHeader({
  categories,
  activeCategory,
  isHome = false,
}: {
  categories: Category[];
  activeCategory?: string;
  isHome?: boolean;
}) {
  const itemClass =
    "inline-flex min-h-11 items-center border-b-2 px-0.5 font-display text-sm font-semibold transition-colors";

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-midnight/92 backdrop-blur-xl">
      <div className="shell flex h-16 items-center justify-between gap-3 sm:h-[72px]">
        <Link href="/tv" aria-label="Ir a la portada de Killa TV" className="shrink-0 leading-none">
          <TvLogo priority />
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
            aria-label="Ir a Killa Internet"
            className="grid size-11 shrink-0 place-items-center rounded-full border border-line font-display text-xs font-semibold text-fg-muted transition-colors hover:border-sand/60 hover:text-fg sm:inline-flex sm:size-auto sm:min-h-10 sm:gap-2 sm:px-3.5 sm:text-sm"
          >
            <ArrowLeft size={15} aria-hidden />
            <span className="hidden sm:inline">Killa Internet</span>
          </Link>
        </div>
      </div>

      <div className="border-t border-line/70">
        <div className="shell">
          <nav
            className="-mx-5 flex w-[calc(100%+2.5rem)] min-w-0 items-center gap-6 overflow-x-auto px-5 [scrollbar-width:none] sm:mx-0 sm:w-full sm:px-0 [&::-webkit-scrollbar]:hidden"
            aria-label="Secciones de Killa TV"
          >
            <Link
              href="/tv"
              aria-current={isHome ? "page" : undefined}
              className={`${itemClass} ${isHome ? "border-sand text-sand" : "border-transparent text-fg-muted hover:text-sand"}`}
            >
              Portada
            </Link>
            {categories.map((category) => {
              const active = category.slug === activeCategory;
              return (
                <Link
                  key={category.id}
                  href={`/tv/categoria/${category.slug}`}
                  aria-current={active ? "page" : undefined}
                  className={`${itemClass} ${active ? "border-sand text-sand" : "border-transparent text-fg-muted hover:text-sand"}`}
                >
                  {category.name}
                </Link>
              );
            })}
            <a
              href={youtubeLive}
              target="_blank"
              rel="noopener noreferrer"
              className={`${itemClass} shrink-0 gap-2 border-transparent text-fg-muted hover:text-red-400 sm:hidden`}
            >
              <Radio size={14} className="text-red-500" aria-hidden />
              En vivo
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
}
