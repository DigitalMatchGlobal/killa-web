"use client";

import { ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";

/**
 * Navegación de retorno para páginas largas. Comparte el eje del FAB de
 * WhatsApp, pero aparece encima para que ambos controles sigan siendo
 * alcanzables con el pulgar sin superponerse.
 */
export function ScrollToTop() {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const onScroll = () => setShown(window.scrollY > window.innerHeight);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const returnToTop = () => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  };

  return (
    <button
      type="button"
      onClick={returnToTop}
      aria-label="Volver al inicio"
      title="Volver arriba"
      tabIndex={shown ? 0 : -1}
      aria-hidden={!shown}
      className={`fixed bottom-[4.75rem] right-4 z-40 grid size-12 place-items-center rounded-full border border-line-strong bg-midnight/90 text-fg-muted shadow-[0_12px_32px_-16px_rgb(var(--moon-shadow)/0.75)] backdrop-blur-md transition-all duration-300 hover:border-cyan/60 hover:text-cyan active:scale-95 sm:bottom-[5.5rem] sm:right-5 ${
        shown
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-3 opacity-0"
      }`}
    >
      <ArrowUp size={19} strokeWidth={1.8} aria-hidden />
    </button>
  );
}
