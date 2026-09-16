import Image from "next/image";

import { cn } from "@/lib/utils";

/**
 * Logotipo oficial de Killa Internet. Las dos variantes (lettering blanco para
 * oscuro, negro para claro) comparten exactamente el mismo lienzo (2108×820),
 * así el cambio de tema no produce ningún salto de tamaño.
 *
 * `size` fija el tamaño de forma coherente en todos los breakpoints: "default"
 * es el del header; "lg" es el de la grilla del ecosistema (sin variantes `sm:`
 * que antes invertían el tamaño entre móvil y escritorio).
 */
const SIZES = {
  default: "h-10 w-[8.25rem] sm:h-11 sm:w-[9.1rem]",
  // En el ecosistema se busca peso visual parejo con Killa TV. Como el wordmark
  // "killa" ocupa menos alto (globo arriba, "internet" abajo), va un poco más
  // alto. Ancho exacto a la proporción del logo (2.571).
  lg: "h-16 w-[10.3rem]",
} as const;

export function Logo({
  className,
  priority,
  size = "default",
}: {
  className?: string;
  priority?: boolean;
  size?: keyof typeof SIZES;
}) {
  return (
    <span className={cn("relative block overflow-visible", SIZES[size], className)}>
      <Image
        src="/brand/killa-internet-dark.png"
        alt="Killa Internet"
        width={2108}
        height={820}
        priority={priority}
        className="brand-logo-dark absolute -inset-y-1 inset-x-0 h-[calc(100%+0.5rem)] w-full object-contain"
      />
      <Image
        src="/brand/killa-internet-light.png"
        alt=""
        width={2108}
        height={820}
        priority={priority}
        className="brand-logo-light absolute -inset-y-1 inset-x-0 hidden h-[calc(100%+0.5rem)] w-full object-contain"
      />
    </span>
  );
}
