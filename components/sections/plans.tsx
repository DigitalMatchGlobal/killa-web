"use client";

import { useMemo, useState } from "react";
import { ArrowUpRight, Check, MessageCircle, Search } from "lucide-react";

import {
  FOCUS_LOCALITY_EVENT,
  findLocality,
  localityDetails,
  matchLocality,
} from "@/lib/localities";
import { homePlans, whatsappLink } from "@/lib/site";
import { cn } from "@/lib/utils";

/**
 * Planes de hogar.
 *
 * El sitio actual dice "Consultar precio" en los tres planes, y en el
 * relevamiento quedó claro por qué: Cafayate tiene tarifas distintas al resto
 * del valle (ver ../docs/00-CONTEXTO.md). Como todavía no hay precios públicos,
 * el selector de localidad no puede mostrar un número —sería inventarlo—, así
 * que hace algo mejor: convierte la elección en datos reales (corredor + oficina
 * Killa de referencia) y deja la consulta lista para WhatsApp con la localidad
 * ya escrita. Cuando se conecte Mikrowisp, el mismo selector muestra el precio
 * real por zona sin rehacer la sección (requerimiento WEB-03).
 */
export function Plans() {
  // Sin preselección: la sección arranca lista para filtrar y elegir.
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [province, setProvince] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const selected = selectedId ? findLocality(selectedId) : null;
  const trimmedQuery = query.trim();

  const byName = (a: { name: string }, b: { name: string }) =>
    a.name.localeCompare(b.name, "es");

  // Provincias presentes, de norte a sur (orden geográfico del corredor).
  const provinces = useMemo(() => {
    const order = ["Jujuy", "Salta", "Tucumán", "Catamarca"];
    return order.filter((p) => localityDetails.some((loc) => loc.province === p));
  }, []);

  // Al escribir, el buscador manda: busca en TODAS las provincias (así "Cafayate"
  // aparece aunque el filtro esté en otra provincia). Sin texto, filtra por la
  // provincia elegida; si no hay ninguna, muestra todas.
  const filtered = useMemo(() => {
    const base = trimmedQuery
      ? localityDetails.filter((loc) => matchLocality(loc, trimmedQuery))
      : province
        ? localityDetails.filter((loc) => loc.province === province)
        : localityDetails;
    return [...base].sort(byName);
  }, [province, trimmedQuery]);

  function chooseProvince(next: string) {
    // Volver a tocar la provincia activa la deselecciona (vuelve a "todas").
    setProvince((current) => (current === next ? null : next));
    setQuery("");
  }

  function chooseLocality(id: string, localityProvince: string) {
    setSelectedId(id);
    setProvince(localityProvince); // el chip acompaña a la localidad elegida
  }

  function focusOnMap() {
    if (!selected) return;
    window.dispatchEvent(
      new CustomEvent(FOCUS_LOCALITY_EVENT, { detail: { id: selected.id } }),
    );
  }

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

        {/* Selector de localidad: buscador + chips filtrables. */}
        <div className="reveal mt-8" style={{ ["--reveal-delay" as string]: "80ms" }}>
          <label
            htmlFor="plan-locality-search"
            className="font-mono text-[0.7rem] uppercase tracking-[0.16em] text-fg-faint"
          >
            ¿Dónde vivís?
          </label>

          {/* Filtro por provincia (opcional): acota las localidades por región. */}
          <div className="mt-3 flex flex-wrap gap-1.5" role="group" aria-label="Filtrar por provincia">
            {provinces.map((p) => {
              const active = province === p;
              return (
                <button
                  key={p}
                  type="button"
                  aria-pressed={active}
                  onClick={() => chooseProvince(p)}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs font-medium transition-colors duration-300",
                    active
                      ? "border-cyan/50 bg-cyan/[0.08] text-cyan"
                      : "border-line text-fg-faint hover:border-line-strong hover:text-fg-muted",
                  )}
                >
                  {p}
                </button>
              );
            })}
          </div>

          <div className="relative mt-3 max-w-sm">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-fg-faint"
              size={17}
              aria-hidden
            />
            <input
              id="plan-locality-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscá tu localidad"
              autoComplete="off"
              className="h-11 w-full rounded-xl border border-line bg-night/70 pl-10 pr-3 text-base text-fg outline-none transition-colors placeholder:text-fg-faint focus:border-cyan sm:text-sm"
            />
          </div>

          <div
            role="radiogroup"
            aria-label="Localidad"
            className="mt-3 flex snap-x gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            style={{
              // el degradado al borde derecho avisa que la fila sigue,
              // que en celular no se ve de otra manera
              maskImage:
                "linear-gradient(90deg, #000 0, #000 calc(100% - 3rem), transparent)",
            }}
          >
            {filtered.map((loc) => {
              const active = loc.id === selected?.id;
              return (
                <button
                  key={loc.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => chooseLocality(loc.id, loc.province)}
                  className={cn(
                    "snap-start whitespace-nowrap rounded-full border px-4 py-2.5 text-sm transition-all duration-300 active:scale-[0.97]",
                    active
                      ? "border-cyan bg-cyan/12 text-fg"
                      : "border-line text-fg-muted hover:border-line-strong hover:text-fg",
                  )}
                >
                  {loc.name}
                </button>
              );
            })}
          </div>

          {filtered.length === 0 && (
            <p className="mt-1 text-sm text-fg-muted">
              No la encontramos en la lista, pero{" "}
              <a
                href={whatsappLink(
                  `Hola Killa, quiero consultar si llegan a ${query.trim() || "mi localidad"}.`,
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan underline-offset-2 hover:underline"
              >
                consultá igual por WhatsApp
              </a>
              .
            </p>
          )}
        </div>

        {/* Panel "tu localidad": confirma la cobertura y lleva a los planes. Los
            datos de oficina y de pago viven en la sección Cobertura, para no
            repetir y mantener la historia ordenada. */}
        {selected && (
        <div
          key={selected.id}
          className="locality-panel mt-4 rounded-2xl border border-cyan/25 bg-cyan/[0.05] p-5 sm:p-6"
          aria-live="polite"
        >
          <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
            <div className="min-w-0">
              <p className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-cyan">
                Llegamos a tu zona
              </p>
              <p className="mt-1 flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
                <span className="font-display text-xl font-semibold text-fg">{selected.name}</span>
                <span className="text-sm text-fg-muted">
                  {selected.corridor}
                  {selected.province ? ` · ${selected.province}` : ""}
                </span>
              </p>
            </div>
            <button
              type="button"
              onClick={focusOnMap}
              className="inline-flex shrink-0 items-center gap-1.5 text-xs font-medium text-cyan transition-opacity hover:opacity-80"
            >
              Oficina y medios de pago
              <ArrowUpRight size={14} aria-hidden />
            </button>
          </div>

          {selected.higherTariff && (
            <p className="mt-3 inline-flex items-center gap-2 rounded-lg border border-sand/30 bg-sand/[0.07] px-3 py-1.5 text-xs text-sand">
              <span className="size-1.5 rounded-full bg-sand" aria-hidden />
              Cafayate maneja una tarifa diferenciada del resto del valle.
            </p>
          )}
        </div>
        )}

        <div className="mt-6 grid gap-4 md:grid-cols-3">
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
                  selected
                    ? `Hola Killa, quiero consultar el precio del plan de ${plan.speed} Megas en ${selected.name}.`
                    : `Hola Killa, quiero consultar el precio del plan de ${plan.speed} Megas.`,
                )}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "btn mt-7 w-full",
                  plan.featured ? "btn-primary" : "btn-ghost",
                )}
              >
                <MessageCircle size={17} aria-hidden />
                {selected ? `Consultar en ${selected.name}` : "Consultar precio"}
              </a>
            </article>
          ))}
        </div>

        <p className="reveal mt-6 font-mono text-xs text-fg-faint">
          Instalación y disponibilidad sujetas a factibilidad técnica
          {selected ? (
            <>
              {" "}en <span className="text-fg-muted">{selected.name}</span>.
            </>
          ) : (
            " según tu localidad."
          )}
        </p>
      </div>
    </section>
  );
}
