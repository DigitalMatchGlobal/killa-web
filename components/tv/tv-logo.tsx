import Image from "next/image";

import { cn } from "@/lib/utils";

/** Identidad oficial provista por Killa TV, adaptada a ambos temas. */
export function TvLogo({
  className,
  priority = false,
  showSymbol = true,
}: {
  className?: string;
  priority?: boolean;
  showSymbol?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      {showSymbol ? (
        <Image
          src="/brand/killa-tv-symbol.png"
          alt=""
          width={450}
          height={450}
          priority={priority}
          className="tv-logo-image size-9 shrink-0 object-contain sm:size-10"
        />
      ) : null}
      <Image
        src="/brand/killa-tv-wordmark.png"
        alt="Killa TV"
        width={1040}
        height={330}
        priority={priority}
        className="tv-logo-image h-auto w-[7.6rem] object-contain sm:w-[8.6rem]"
      />
    </span>
  );
}

