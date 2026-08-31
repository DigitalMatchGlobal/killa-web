import Image from "next/image";

import { cn } from "@/lib/utils";

/**
 * Logotipo original de Killa (tomado de killa.com.ar). Es blanco sobre
 * transparente: sólo funciona sobre fondo oscuro, y esa es una de las razones
 * por las que todo el sitio es oscuro.
 * TODO(cliente): pedir el archivo vectorial (SVG/AI). Hoy es un PNG de 2160 px.
 */
export function Logo({ className, priority }: { className?: string; priority?: boolean }) {
  return (
    <Image
      src="/brand/killa-internet.png"
      alt="Killa Internet"
      width={2160}
      height={825}
      priority={priority}
      className={cn("brand-logo h-9 w-auto sm:h-10", className)}
    />
  );
}
