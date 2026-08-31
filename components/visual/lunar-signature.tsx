"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

function BrandMoon() {
  return (
    <svg viewBox="0 0 80 80" className="size-full" aria-hidden>
      <defs>
        <radialGradient id="killa-moon-light" cx="34%" cy="28%" r="72%">
          <stop offset="0%" stopColor="rgb(var(--moon-light))" />
          <stop offset="68%" stopColor="rgb(var(--moon-mid))" />
          <stop offset="100%" stopColor="rgb(var(--moon-mid) / 0.8)" />
        </radialGradient>
      </defs>
      <circle cx="40" cy="40" r="32" fill="url(#killa-moon-light)" />
      <circle cx="40" cy="40" r="31.5" className="lunar-disc-ring" />
      <circle cx="27" cy="27" r="2.4" className="lunar-crater" />
      <circle cx="49" cy="48" r="3.6" className="lunar-crater" />
      <circle cx="51" cy="25" r="1.7" className="lunar-crater" />
      <circle cx="31" cy="52" r="1.5" className="lunar-crater" />
    </svg>
  );
}

export function LunarSignature() {
  const [open, setOpen] = useState(false);
  const [pulseVersion, setPulseVersion] = useState(0);

  useEffect(() => {
    const onThemeSequence = (event: Event) => {
      const detail = (event as CustomEvent<{ theme: "light" | "dark" }>).detail;
      if (detail.theme === "light") setOpen(false);
      setPulseVersion((version) => version + 1);
    };

    window.addEventListener("killa:theme-sequence", onThemeSequence);
    return () => window.removeEventListener("killa:theme-sequence", onThemeSequence);
  }, []);

  const activate = () => {
    setOpen((current) => !current);
    setPulseVersion((version) => version + 1);
    window.dispatchEvent(new CustomEvent("killa:lunar-pulse"));
  };

  return (
    <div className="lunar-signature">
      <div className="lunar-orbit" aria-hidden>
        <span />
      </div>
      <button
        type="button"
        onClick={activate}
        aria-expanded={open}
        aria-label={
          open
            ? "Cerrar historia de Killa"
            : "Descubrir la historia de Killa"
        }
        className="lunar-trigger"
      >
        <span key={pulseVersion} className="lunar-pulse" aria-hidden />
        <span className="lunar-moon">
          <BrandMoon />
        </span>
        <span className="lunar-date">SEÑAL KILLA</span>
      </button>

      <div className={"lunar-story " + (open ? "is-open" : "")}>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Cerrar"
          className="absolute right-2.5 top-2.5 grid size-7 place-items-center rounded-full text-fg-faint hover:bg-fg/[0.06] hover:text-fg"
        >
          <X size={14} aria-hidden />
        </button>
        <p className="font-mono text-[0.52rem] uppercase tracking-[0.15em] text-sand">
          Una señal en los Valles
        </p>
        <p className="mt-2 font-display text-base font-semibold text-fg">
          Killa es la luna.
        </p>
        <p className="mt-1 text-[0.68rem] leading-relaxed text-fg-muted">
          La misma que guiaba a quienes cruzaban los Valles Calchaquíes de noche,
          sin otra luz. Hoy nos mueve la misma idea: llevar señal donde antes no
          llegaba nada.
        </p>
      </div>
    </div>
  );
}
