"use client";

import { useEffect } from "react";

/**
 * Fija la altura visual inicial del navegador móvil en una variable CSS.
 *
 * `svh` resuelve Safari moderno, pero versiones anteriores de WebKit siguen
 * midiendo `100vh` detrás de las barras. `visualViewport.height` nos da el alto
 * realmente visible. Sólo recalculamos si cambia el ancho (rotación): cuando
 * Safari esconde la barra al scrollear no queremos que el hero salte de tamaño.
 */
export function ViewportHeightSync() {
  useEffect(() => {
    let lastWidth = window.innerWidth;

    const apply = () => {
      if (window.innerWidth >= 1024) {
        document.documentElement.style.removeProperty("--killa-mobile-vh");
        return;
      }

      const height = window.visualViewport?.height ?? window.innerHeight;
      document.documentElement.style.setProperty(
        "--killa-mobile-vh",
        `${Math.round(height)}px`,
      );
    };

    const onResize = () => {
      const width = window.innerWidth;
      if (Math.abs(width - lastWidth) < 20) return;
      lastWidth = width;
      window.requestAnimationFrame(apply);
    };

    apply();
    window.addEventListener("resize", onResize, { passive: true });
    window.addEventListener("orientationchange", apply);

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", apply);
      document.documentElement.style.removeProperty("--killa-mobile-vh");
    };
  }, []);

  return null;
}
