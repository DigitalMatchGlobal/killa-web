"use client";

import { useReveal } from "@/lib/hooks/use-reveal";

/**
 * Enciende las animaciones de entrada de toda la página con un único
 * IntersectionObserver. No renderiza nada.
 */
export function RevealOnScroll() {
  useReveal();
  return null;
}
