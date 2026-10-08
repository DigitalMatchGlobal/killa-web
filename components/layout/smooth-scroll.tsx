"use client";

import { useEffect } from "react";

/**
 * Navegación interna sin `#` en la URL.
 *
 * El sitio es una sola página: los enlaces a secciones son anclas. En vez de
 * dejar `/#contacto` en la barra de direcciones, interceptamos el clic, hacemos
 * scroll suave y limpiamos la URL con `replaceState`. Las tarjetas de oficina
 * (a las que llevan las pills de cobertura) se resaltan al llegar mediante una
 * clase, ya que sin `#` no aplica `:target`.
 */
function hashFromHref(href: string | null): string | null {
  if (!href) return null;
  if (href.startsWith("#")) return href.slice(1);
  if (href.startsWith("/#")) return href.slice(2);
  return null;
}

function scrollToId(id: string) {
  const el = id ? document.getElementById(id) : null;
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  } else {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  // URL limpia, sin hash ni el parámetro `seccion` de los redirects viejos.
  const params = new URLSearchParams(window.location.search);
  params.delete("seccion");
  const query = params.toString();
  window.history.replaceState(null, "", window.location.pathname + (query ? `?${query}` : ""));
  if (el?.classList.contains("office-card")) {
    el.classList.remove("is-flash");
    void el.offsetWidth; // reinicia la animación
    el.classList.add("is-flash");
    window.setTimeout(() => el.classList.remove("is-flash"), 1800);
  }
}

export function SmoothScroll() {
  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = (event.target as HTMLElement | null)?.closest?.("a");
      if (!link) return;
      const id = hashFromHref(link.getAttribute("href"));
      if (id === null) return;
      // Ancla desconocida (que no sea el tope): dejamos el comportamiento normal.
      if (id && id !== "top" && !document.getElementById(id)) return;
      event.preventDefault();
      scrollToId(id);
    }

    document.addEventListener("click", onClick);

    // Si se entra con un hash heredado o con `?seccion=` (redirects del WordPress
    // anterior), reposicionamos y limpiamos la URL.
    const entrada =
      window.location.hash.length > 1
        ? window.location.hash.slice(1)
        : new URLSearchParams(window.location.search).get("seccion");
    if (entrada) {
      window.requestAnimationFrame(() => scrollToId(entrada));
    }

    return () => document.removeEventListener("click", onClick);
  }, []);

  return null;
}
