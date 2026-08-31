import { MapPin, Phone } from "lucide-react";

import { CoverageExplorer } from "@/components/sections/coverage-explorer";

import { offices, whatsappLink } from "@/lib/site";

/**
 * Cobertura y oficinas.
 *
 * Para un ISP regional esto es la sección que más se consulta: la primera
 * pregunta de todo visitante es "¿llegás a mi casa?". Las localidades son las
 * mismas que dibuja el corredor del hero, tomadas de lib/network.ts.
 *
 * El explorador agrupa las localidades en corredores operativos para que la
 * cobertura se entienda de un vistazo, especialmente desde el teléfono.
 */
export function Coverage() {
  return (
    <section id="cobertura" className="section-pad relative border-t border-line">
      <div className="shell">
        <header className="reveal max-w-2xl">
          <p className="eyebrow">
            <span className="node-dot" aria-hidden />
            Área de cobertura
          </p>
          <h2 className="display mt-4 text-[clamp(2rem,7vw,3.25rem)]">
            Tres corredores.
            <br />Una red que los conecta.
          </h2>
          <p className="mt-5 text-fg-muted">
            Agrupamos la cobertura como Killa presta el servicio: Ramal Norte,
            Valles Calchaquíes y Corredor Sur. Seleccioná una zona para explorar
            sus localidades.
          </p>
        </header>

        <CoverageExplorer />

        {/* Oficinas verificadas y puntos de soporte publicados por Killa. */}
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {offices.map((office, index) => (
            <article
              key={office.city}
              className="card card-topline reveal p-6"
              style={{ ["--reveal-delay" as string]: `${index * 80}ms` }}
            >
              <p className="font-mono text-[0.7rem] uppercase tracking-[0.16em] text-cyan">
                {"kind" in office ? office.kind : "Oficina"}
              </p>
              <h3 className="mt-2 font-display text-xl font-semibold tracking-tight text-fg">
                {office.city}
                <span className="ml-2 text-sm font-normal text-fg-faint">
                  {office.province}
                </span>
              </h3>
              {"address" in office ? (
                <p className="mt-4 flex items-start gap-2.5 text-sm text-fg-muted">
                  <MapPin size={16} className="mt-0.5 shrink-0 text-fg-faint" aria-hidden />
                  {office.address}
                </p>
              ) : (
                <p className="mt-4 flex items-start gap-2.5 text-sm text-fg-muted">
                  <MapPin size={16} className="mt-0.5 shrink-0 text-fg-faint" aria-hidden />
                  Atención en la localidad
                </p>
              )}
              {"phoneHref" in office && (
                <a
                  href={office.phoneHref}
                  className="mt-2.5 flex items-center gap-2.5 font-mono text-sm text-fg-muted transition-colors duration-300 hover:text-cyan"
                >
                  <Phone size={16} className="shrink-0 text-fg-faint" aria-hidden />
                  {office.phone}
                </a>
              )}
            </article>
          ))}
        </div>

        <div className="reveal mt-8">
          <a
            href={whatsappLink("Hola Killa, quiero saber si llegan a mi domicilio. Estoy en:")}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary w-full sm:w-auto"
          >
            Consultar factibilidad en mi domicilio
          </a>
        </div>
      </div>
    </section>
  );
}
