"use client";

import { useEffect, useState } from "react";
import { Menu, Phone, X } from "lucide-react";

import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { navLinks, site, whatsappLink } from "@/lib/site";
import { cn } from "@/lib/utils";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Con el menú abierto el fondo no se mueve, y Escape lo cierra.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-500",
          scrolled || open
            ? "border-b border-line bg-midnight/85 backdrop-blur-xl"
            : "border-b border-transparent bg-transparent",
        )}
      >
        <div className="shell flex h-[72px] items-center justify-between gap-4">
          <a href="#top" aria-label="Killa Internet — inicio" className="shrink-0">
            <Logo priority />
          </a>

          <nav className="hidden items-center gap-1 lg:flex">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="relative rounded-full px-3.5 py-2 text-sm text-fg-muted transition-colors duration-300 hover:text-fg"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <a
              href={site.phoneHref}
              className="hidden items-center gap-2 rounded-full border border-line px-4 py-2 font-mono text-xs text-fg-muted transition-colors duration-300 hover:border-cyan/60 hover:text-fg md:inline-flex"
            >
              <Phone size={14} aria-hidden />
              {site.phoneDisplay}
            </a>

            <a
              href={whatsappLink("Hola Killa, quiero consultar por el servicio de internet.")}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary hidden min-h-0 px-5 py-2.5 text-sm sm:inline-flex"
            >
              Contratar
            </a>

            <ThemeToggle />

            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              aria-expanded={open}
              aria-controls="menu-movil"
              aria-label={open ? "Cerrar menú" : "Abrir menú"}
              className="grid size-11 place-items-center rounded-full border border-line text-fg transition-colors duration-300 hover:border-cyan/60 lg:hidden"
            >
              {open ? <X size={19} aria-hidden /> : <Menu size={19} aria-hidden />}
            </button>
          </div>
        </div>
      </header>

      {/* Menú de celular: pantalla completa, objetivos táctiles grandes. */}
      <div
        id="menu-movil"
        hidden={!open}
        className="fixed inset-0 top-[72px] z-40 bg-midnight/97 backdrop-blur-xl lg:hidden"
      >
        <nav className="shell flex flex-col gap-1 py-8">
          {navLinks.map((link, index) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              style={{ transitionDelay: `${index * 45}ms` }}
              className={cn(
                "flex items-center gap-4 border-b border-line/70 py-5 font-display text-2xl font-semibold tracking-tight transition-all duration-500",
                open ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
              )}
            >
              <span className="node-dot" aria-hidden />
              {link.label}
            </a>
          ))}

          <a
            href={whatsappLink("Hola Killa, quiero consultar por el servicio de internet.")}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className="btn btn-primary mt-7 w-full"
          >
            Escribir por WhatsApp
          </a>

          <a
            href={site.phoneHref}
            className="mt-4 text-center font-mono text-sm text-fg-muted"
          >
            {site.phoneDisplay} · {site.email}
          </a>
        </nav>
      </div>
    </>
  );
}
