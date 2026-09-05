import { Zap } from "lucide-react";

type PoweredByProps = {
  accent?: "cyan" | "sand";
  compact?: boolean;
};

/**
 * Firma discreta y reutilizable de DigitalMatchGlobal.
 *
 * Se inspira en la firma de Matukana, pero usa únicamente los acentos y
 * superficies de Killa para que no parezca un elemento pegado desde otro sitio.
 */
export function PoweredBy({ accent = "cyan", compact = false }: PoweredByProps) {
  const accentClasses =
    accent === "sand"
      ? "border-sand/20 bg-sand/[0.04] hover:border-sand/50"
      : "border-cyan/20 bg-cyan/[0.04] hover:border-cyan/50";
  const textClasses = accent === "sand" ? "text-sand" : "text-cyan";

  return (
    <a
      href="https://www.digitalmatchglobal.com/"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Powered by DigitalMatchGlobal"
      className={`group relative inline-flex w-fit items-center gap-2 overflow-hidden rounded-full border transition-[border-color,transform,background-color] duration-300 hover:-translate-y-0.5 ${accentClasses} ${
        compact ? "px-3 py-1.5" : "px-4 py-2"
      }`}
    >
      <span
        className={`absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-[450%]`}
        aria-hidden
      />
      <span className="relative font-mono text-[0.56rem] uppercase tracking-[0.14em] text-fg-faint">
        Powered by
      </span>
      <span className={`relative font-display text-[0.7rem] font-semibold ${textClasses}`}>
        DigitalMatchGlobal
      </span>
      <Zap size={11} className={`relative ${textClasses}`} aria-hidden />
    </a>
  );
}
