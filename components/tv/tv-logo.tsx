import Image from "next/image";

import { cn } from "@/lib/utils";

/**
 * Identidad oficial de Killa TV (manual de marca). Se usan variantes dedicadas
 * por fondo en vez de recolorear un único PNG: el lettering blanco resuelve el
 * tema oscuro y el negro el claro, ambos con la "tv" cian intacta. El símbolo es
 * a todo color y funciona igual en ambos temas, por eso es una sola pieza.
 *
 * `size` controla la escala del lockup horizontal (símbolo izquierda + wordmark
 * derecha): "md" para header/footer, "lg" para la grilla del ecosistema, donde
 * acompaña en peso al logotipo de Killa Internet.
 */
const SIZES = {
  md: { symbol: "size-9 sm:size-10", wordmark: "w-[7.6rem] sm:w-[8.6rem]" },
  lg: { symbol: "size-12 sm:size-14", wordmark: "w-[8.5rem] sm:w-[10rem]" },
} as const;

export function TvLogo({
  className,
  priority = false,
  showSymbol = true,
  size = "md",
}: {
  className?: string;
  priority?: boolean;
  showSymbol?: boolean;
  size?: keyof typeof SIZES;
}) {
  const s = SIZES[size];

  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      {showSymbol ? (
        <span className={cn("relative inline-flex shrink-0 items-center justify-center", s.symbol)}>
          <Image
            src="/brand/killatv-symbol-dark.png"
            alt=""
            width={421}
            height={436}
            priority={priority}
            className="tv-logo-symbol--dark h-full w-full object-contain"
          />
          <Image
            src="/brand/killatv-symbol.png"
            alt=""
            width={421}
            height={436}
            priority={priority}
            className="tv-logo-symbol--light hidden h-full w-full object-contain"
          />
        </span>
      ) : null}
      <span className={cn("relative inline-flex items-center", showSymbol ? s.wordmark : "w-full")}>
        <Image
          src="/brand/killatv-wordmark-dark.png"
          alt="Killa TV"
          width={1151}
          height={304}
          priority={priority}
          className="tv-logo-wordmark--dark h-auto w-full object-contain"
        />
        <Image
          src="/brand/killatv-wordmark-light.png"
          alt=""
          width={1151}
          height={304}
          priority={priority}
          className="tv-logo-wordmark--light hidden h-auto w-full object-contain"
        />
      </span>
    </span>
  );
}
