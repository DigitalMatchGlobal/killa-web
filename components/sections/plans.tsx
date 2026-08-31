"use client";

import { useState } from "react";
import { Check, MessageCircle } from "lucide-react";

import { homePlans, whatsappLink, zones, type ZoneId } from "@/lib/site";
import { cn } from "@/lib/utils";

/**
 * Planes de hogar.
 *
 * El sitio actual dice "Consultar precio" en los tres planes, y en el
 * relevamiento quedó claro por qué: Cafayate tiene tarifas distintas al resto
 * del valle (ver ../docs/00-CONTEXTO.md). En vez de esconder eso, el selector
 * de zona lo convierte en el mecanismo de la sección: el visitante elige dónde
 * vive y la consulta sale a WhatsApp con el plan y la zona ya escritos.
 *
 * Cuando se conecte Mikrowisp, este mismo selector muestra el precio real por
 * zona sin rehacer la sección (requerimiento WEB-03).
 */
export function Plans() {
  const [zone, setZone] = useState<ZoneId>("cafayate");
  const zoneLabel = zones.find((z) => z.id === zone)?.label ?? "";

  return (
    <section id="hogar" className="section-pad relative border-t border-line">
      <div className="shell">
        <header className="reveal max-w-2xl">
          <p className="eyebrow">
            <span className="node-dot" aria-hidden />
            Internet en tu casa
          </p>
          <h2 className="display mt-4 text-[clamp(2rem,7vw,3.25rem)]">
            Elegí la velocidad.
            <br />
            Nosotros ponemos la estabilidad.
          </h2>
          <p className="mt-5 text-fg-muted">
            Las tarifas cambian según la localidad y la tecnología disponible en cada
            zona. Elegí dónde vivís y te pasamos el precio exacto por WhatsApp, sin
            vueltas.
          </p>
        </header>

        {/* Selector de zona: chips grandes, scroll horizontal en celular. */}
        <div className="reveal mt-8" style={{ ["--reveal-delay" as string]: "80ms" }}>
          <p className="font-mono text-[0.7rem] uppercase tracking-[0.16em] text-fg-faint">
            ¿Dónde vivís?
          </p>
          <div
            role="radiogroup"
            aria-label="Zona de servicio"
            className="mt-3 flex snap-x gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            style={{
              // el degradado al borde derecho avisa que la fila sigue,
              // que en celular no se ve de otra manera
              maskImage:
                "linear-gradient(90deg, #000 0, #000 calc(100% - 3rem), transparent)",
            }}
          >
            {zones.map((option) => {
              const active = option.id === zone;
              return (
                <button
                  key={option.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setZone(option.id)}
                  className={cn(
                    "snap-start whitespace-nowrap rounded-full border px-4 py-2.5 text-sm transition-all duration-300",
                    active
                      ? "border-cyan bg-cyan/12 text-fg"
                      : "border-line text-fg-muted hover:border-line-strong hover:text-fg",
                  )}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {homePlans.map((plan, index) => (
            <article
              key={plan.speed}
              className={cn(
                "card card-topline reveal flex flex-col p-6 sm:p-7",
                plan.featured && "border-cyan/45",
              )}
              style={{ ["--reveal-delay" as string]: `${index * 90}ms` }}
            >
              {/*
                La insignia se reserva en las tres tarjetas aunque esté vacía:
                si no, el 150 baja y los tres números dejan de alinearse.
              */}
              <span
                className={cn(
                  "mb-4 inline-flex w-fit rounded-full px-3 py-1 font-mono text-[0.65rem] uppercase tracking-[0.14em]",
                  plan.featured ? "bg-cyan/14 text-cyan" : "invisible",
                )}
                aria-hidden={!plan.featured}
              >
                El más elegido
              </span>

              <p className="flex items-baseline gap-2">
                <span className="display text-[3.25rem] leading-none text-fg">
                  {plan.speed}
                </span>
                <span className="font-mono text-sm uppercase tracking-[0.14em] text-fg-faint">
                  {plan.unit}
                </span>
              </p>

              <p className="mt-4 text-sm text-fg-muted">{plan.blurb}</p>

              <ul className="mt-6 flex flex-col gap-2.5 border-t border-line pt-6">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 text-sm text-fg-muted">
                    <Check size={16} className="mt-0.5 shrink-0 text-cyan" aria-hidden />
                    {feature}
                  </li>
                ))}
              </ul>

              <a
                href={whatsappLink(
                  `Hola Killa, quiero consultar el precio del plan de ${plan.speed} Megas en ${zoneLabel}.`,
                )}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "btn mt-7 w-full",
                  plan.featured ? "btn-primary" : "btn-ghost",
                )}
              >
                <MessageCircle size={17} aria-hidden />
                Consultar precio
              </a>
            </article>
          ))}
        </div>

        <p className="reveal mt-6 font-mono text-xs text-fg-faint">
          Instalación y disponibilidad sujetas a factibilidad técnica en{" "}
          <span className="text-fg-muted">{zoneLabel}</span>.
        </p>
      </div>
    </section>
  );
}
