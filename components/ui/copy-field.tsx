"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

import { cn } from "@/lib/utils";

/** Copia al portapapeles con fallback para contextos donde la API async está
 * restringida (iframes, contextos no seguros). Devuelve si tuvo éxito. */
async function writeToClipboard(value: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
      return true;
    }
  } catch {
    // Cae al método clásico.
  }
  try {
    const el = document.createElement("textarea");
    el.value = value;
    el.setAttribute("readonly", "");
    el.style.position = "fixed";
    el.style.opacity = "0";
    document.body.appendChild(el);
    el.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(el);
    return ok;
  } catch {
    return false;
  }
}

/**
 * Valor copiable con un toque (alias de pago, titular). Muestra feedback breve
 * y cae con elegancia si el navegador no permite escribir en el portapapeles.
 */
export function CopyField({
  value,
  label,
  className,
}: {
  value: string;
  /** Descripción accesible de qué se copia (ej. "alias KILLA.CAFAYATE"). */
  label?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    const ok = await writeToClipboard(value);
    if (!ok) return; // el valor sigue visible para copiar a mano
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={`Copiar ${label ?? value}`}
      className={cn(
        "group inline-flex items-center gap-2 rounded-lg border border-cyan/30 bg-night/40 px-2.5 py-1.5 font-mono text-sm text-fg transition-colors hover:border-cyan/60",
        className,
      )}
    >
      <span className="truncate">{value}</span>
      {copied ? (
        <Check size={14} className="shrink-0 text-cyan" aria-hidden />
      ) : (
        <Copy size={14} className="shrink-0 text-fg-faint transition-colors group-hover:text-cyan" aria-hidden />
      )}
      <span className="text-[0.65rem] font-medium text-cyan" aria-live="polite">
        {copied ? "¡Copiado!" : "Copiar"}
      </span>
    </button>
  );
}
