import Image from "next/image";

import { cn } from "@/lib/utils";

/**
 * Logotipo oficial provisto por Killa. La variante de color con lettering
 * negro se usa en claro; la variante blanca existente conserva legibilidad en
 * oscuro. Ambas comparten exactamente el mismo espacio para evitar saltos.
 */
export function Logo({ className, priority }: { className?: string; priority?: boolean }) {
  return (
    <span className={cn("relative block h-9 w-[7.9rem] sm:h-10 sm:w-[8.8rem]", className)}>
      <Image
        src="/brand/killa-internet.png"
        alt="Killa Internet"
        width={2160}
        height={825}
        priority={priority}
        className="brand-logo-dark absolute inset-0 h-full w-full object-contain"
      />
      <Image
        src="/brand/killa-official.png"
        alt=""
        width={1600}
        height={533}
        priority={priority}
        className="brand-logo-light absolute inset-0 hidden h-full w-full object-contain"
      />
    </span>
  );
}
