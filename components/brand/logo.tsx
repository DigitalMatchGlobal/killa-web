import Image from "next/image";

import { cn } from "@/lib/utils";

/**
 * Logotipo oficial provisto por Killa. La variante de color con lettering
 * negro se usa en claro; la variante blanca existente conserva legibilidad en
 * oscuro. Ambas comparten exactamente el mismo espacio para evitar saltos.
 */
export function Logo({ className, priority }: { className?: string; priority?: boolean }) {
  return (
    <span
      className={cn(
        "relative block h-10 w-[8.25rem] overflow-visible sm:h-11 sm:w-[9.1rem]",
        className,
      )}
    >
      <Image
        src="/brand/killa-internet.png"
        alt="Killa Internet"
        width={2160}
        height={825}
        priority={priority}
        className="brand-logo-dark absolute -inset-y-1 inset-x-0 h-[calc(100%+0.5rem)] w-full object-contain"
      />
      <Image
        src="/brand/killa-official-horizontal.png"
        alt=""
        width={2160}
        height={896}
        priority={priority}
        className="brand-logo-light absolute -inset-y-1 inset-x-0 hidden h-[calc(100%+0.5rem)] w-full object-contain"
      />
    </span>
  );
}
