import { ArrowRight, Newspaper, Plane, Trophy } from "lucide-react";

/**
 * Banda de Killa TV.
 *
 * Es el único bloque del sitio con acento arena en lugar de cian: Killa TV es
 * el medio, no el ISP, y necesita voz propia sin salirse de la marca.
 *
 * En esta primera iteración es una banda de presentación con enlace al Killa TV
 * actual. El portal de noticias con carga propia (portada, nota, editores) es
 * la etapa siguiente — ver ../docs/08-MVP-WEB-TV-500.md.
 */

const verticals = [
  { icon: Trophy, label: "Deportes" },
  { icon: Newspaper, label: "Noticias" },
  { icon: Plane, label: "Turismo" },
];

export function KillaTV() {
  return (
    <section id="killa-tv" className="relative border-t border-line">
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(120% 100% at 12% 0%, rgba(233,208,160,0.11) 0%, transparent 58%), linear-gradient(180deg, rgb(var(--night)), rgb(var(--midnight)))",
        }}
        aria-hidden
      />

      <div className="shell section-pad">
        <div className="reveal grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:items-center">
          <div>
            <p className="eyebrow text-sand">
              <span className="node-dot bg-sand shadow-none" aria-hidden />
              Killa TV
            </p>
            <h2 className="display mt-4 text-[clamp(2rem,7vw,3.25rem)]">
              El valle también
              <br />
              se cuenta desde acá.
            </h2>
            <p className="mt-5 max-w-lg text-fg-muted">
              Nuestra señal de contenidos: deporte de las ligas del valle, noticias de
              las localidades y turismo de los Valles Calchaquíes. Lo que pasa en la
              zona, contado por gente de la zona.
            </p>

            <p className="mt-4 max-w-lg border-l border-sand/40 pl-4 text-sm text-fg-faint">
              También producimos eventos, campañas de cobertura y soluciones de
              circuito cerrado de televisación para instituciones y empresas.
            </p>

            <ul className="mt-8 flex flex-wrap gap-2.5">
              {verticals.map(({ icon: Icon, label }) => (
                <li
                  key={label}
                  className="inline-flex items-center gap-2.5 rounded-full border border-sand/25 bg-sand/[0.06] px-4 py-2.5 text-sm text-fg"
                >
                  <Icon size={16} className="text-sand" aria-hidden />
                  {label}
                </li>
              ))}
            </ul>

            <a
              href="/tv"
              className="btn btn-ghost mt-8 w-full border-sand/35 hover:border-sand/70 sm:w-auto"
            >
              Entrar a Killa TV
              <ArrowRight size={17} aria-hidden />
            </a>
          </div>

          {/* Marco de señal: un aparato encendido, no una captura de pantalla. */}
          <div
            className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-line lg:aspect-[5/4]"
            aria-hidden
          >
            <div
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(80% 70% at 50% 40%, rgba(233,208,160,0.16), transparent 70%), linear-gradient(160deg, rgb(var(--surface)), rgb(var(--midnight)))",
              }}
            />
            {/* Líneas de barrido: la textura de una señal en el aire. */}
            <div
              className="absolute inset-0 opacity-25"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(0deg, rgba(233,208,160,0.5) 0px, rgba(233,208,160,0.5) 1px, transparent 1px, transparent 5px)",
              }}
            />
            <div className="absolute inset-0 grid place-items-center">
              <div className="text-center">
                <p className="font-mono text-[0.7rem] uppercase tracking-[0.3em] text-sand/80">
                  En el aire
                </p>
                <p className="display mt-3 text-[clamp(2.5rem,9vw,4rem)] text-fg/90">
                  killa<span className="text-sand">tv</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
