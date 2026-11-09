"use client";

import { useEffect } from "react";

/**
 * Fuerza el scroll al tope de la pantalla al montarse.
 *
 * Se usa principalmente tras la redirección de Server Actions (como crear borrador),
 * donde los navegadores móviles conservan por defecto la posición de scroll anterior
 * (donde estaba el botón de guardar) en lugar de llevar al usuario al inicio de la nota.
 */
export function ScrollToTopOnMount({ force = true }: { force?: boolean }) {
  useEffect(() => {
    if (!force) return;

    if (typeof window !== "undefined" && "scrollRestoration" in window.history) {
      try {
        window.history.scrollRestoration = "manual";
      } catch {
        // no-op
      }
    }

    window.scrollTo({ top: 0, left: 0, behavior: "instant" });

    const raf = requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    });

    const t1 = setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }, 40);

    const t2 = setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      const target = document.getElementById("panel-nota-top");
      target?.scrollIntoView({ behavior: "instant", block: "start" });
    }, 120);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [force]);

  return null;
}
