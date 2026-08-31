"use client";

import { FormEvent, useMemo, useRef, useState } from "react";
import { Headphones, MapPin, MessageCircle, Search } from "lucide-react";

import { NetworkCorridor } from "@/components/visual/network-corridor";
import {
  coverageLocalities,
  serviceZones,
  type CoverageLocality,
  type ServiceZoneId,
} from "@/lib/network";
import { whatsappLink } from "@/lib/site";
import { cn } from "@/lib/utils";

const zoneStyles = {
  cyan: { selected: "border-cyan/70 bg-cyan/[0.11]", kicker: "text-cyan", dot: "bg-cyan" },
  sand: { selected: "border-sand/70 bg-sand/[0.11]", kicker: "text-sand", dot: "bg-sand" },
  mint: { selected: "border-emerald-400/60 bg-emerald-400/[0.1]", kicker: "text-emerald-300", dot: "bg-emerald-300" },
} as const;

function normalize(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("es").trim();
}

function localityMatches(locality: CoverageLocality, query: string) {
  const needle = normalize(query);
  const aliases = "aliases" in locality ? locality.aliases : [];
  return [locality.name, ...aliases].some((candidate) => normalize(candidate).includes(needle));
}

export function CoverageExplorer() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [activeZone, setActiveZone] = useState<ServiceZoneId>("valles-calchaquies");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<CoverageLocality | null>(null);
  const [unknownPlace, setUnknownPlace] = useState("");
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);

  const active = serviceZones.find((zone) => zone.id === activeZone) ?? serviceZones[0];
  const activeStyle = zoneStyles[active.accent];
  const suggestions = useMemo(
    () => query.trim().length > 0
      ? coverageLocalities.filter((locality) => localityMatches(locality, query)).slice(0, 6)
      : coverageLocalities.slice(0, 6),
    [query],
  );

  function choose(locality: CoverageLocality) {
    setQuery(locality.name);
    setSelected(locality);
    setUnknownPlace("");
    setActiveZone(locality.zoneId);
    setSuggestionsOpen(false);
    inputRef.current?.blur();
  }

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const exact = coverageLocalities.find((locality) => {
      const aliases = "aliases" in locality ? locality.aliases : [];
      return [locality.name, ...aliases].some((candidate) => normalize(candidate) === normalize(query));
    });
    if (exact) return choose(exact);
    setSelected(null);
    setUnknownPlace(query.trim() || "mi localidad");
    setSuggestionsOpen(false);
    inputRef.current?.blur();
  }

  const whatsappMessage = selected
    ? `Hola Killa, quiero consultar factibilidad en ${selected.name}. ¿Me pueden ayudar?`
    : `Hola Killa, quiero consultar si pueden llegar a ${unknownPlace || query || "mi localidad"}.`;

  return (
    <div className="reveal mt-10">
      <div className="card relative z-20 p-4 sm:p-5">
        <form onSubmit={submitSearch} className="relative" role="search">
          <label htmlFor="coverage-search" className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-cyan">Consultá tu localidad</label>
          <div className="mt-2 flex gap-2">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-fg-faint" size={18} aria-hidden />
              <input
                ref={inputRef}
                id="coverage-search"
                type="search"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setSuggestionsOpen(true);
                  setSelected(null);
                  setUnknownPlace("");
                }}
                onFocus={() => setSuggestionsOpen(true)}
                placeholder="Ej. Cachi o Santa María"
                autoComplete="off"
                aria-autocomplete="list"
                aria-expanded={suggestionsOpen}
                aria-controls="coverage-suggestions"
                className="h-12 w-full rounded-xl border border-line bg-night/70 pl-10 pr-3 text-base text-fg outline-none transition-colors placeholder:text-fg-faint focus:border-cyan sm:text-sm"
              />
              {suggestionsOpen && suggestions.length > 0 && (
                <ul id="coverage-suggestions" role="listbox" className="absolute inset-x-0 top-[calc(100%+0.4rem)] z-40 max-h-64 overflow-y-auto rounded-xl border border-line bg-midnight p-1.5 shadow-2xl">
                  {suggestions.map((locality) => {
                    const zone = serviceZones.find((item) => item.id === locality.zoneId);
                    return (
                      <li key={locality.id} role="option" aria-selected={selected?.id === locality.id}>
                        <button type="button" onClick={() => choose(locality)} className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-3 text-left transition-colors hover:bg-fg/[0.06] focus:bg-fg/[0.06] focus:outline-none">
                          <span className="flex min-w-0 items-center gap-2.5 text-sm font-medium text-fg">
                            <MapPin size={15} className="shrink-0 text-cyan" aria-hidden />
                            <span className="truncate">{locality.name}</span>
                          </span>
                          <span className="shrink-0 font-mono text-[0.5rem] uppercase tracking-[0.08em] text-fg-faint">{zone?.name}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
            <button type="submit" className="btn btn-primary h-12 min-h-0 shrink-0 px-4 sm:px-6">
              <span className="hidden sm:inline">Buscar</span>
              <Search className="sm:hidden" size={18} aria-hidden />
              <span className="sr-only sm:hidden">Buscar localidad</span>
            </button>
          </div>
          <p className="mt-2 text-[0.68rem] text-fg-faint">Elegí una sugerencia o escribí otra localidad.</p>
        </form>

        {(selected || unknownPlace) && (
          <div aria-live="polite" className={cn("mt-4 rounded-xl border p-4", selected ? "border-cyan/30 bg-cyan/[0.06]" : "border-sand/30 bg-sand/[0.06]")}>
            {selected ? (
              <>
                <p className="font-display text-lg font-semibold text-fg">Llegamos a {selected.name}</p>
                <div className="mt-2 grid gap-2 text-xs text-fg-muted sm:grid-cols-2">
                  <p className="flex items-center gap-2"><MapPin size={14} className="text-cyan" aria-hidden />{serviceZones.find((zone) => zone.id === selected.zoneId)?.name}</p>
                  <p className="flex items-center gap-2"><Headphones size={14} className="text-cyan" aria-hidden />Soporte de referencia: {selected.supportOffice}</p>
                </div>
                <p className="mt-3 text-[0.68rem] text-fg-faint">La disponibilidad final se confirma para cada domicilio.</p>
              </>
            ) : (
              <>
                <p className="font-display text-lg font-semibold text-fg">Todavía no llegamos ahí.</p>
                <p className="mt-1 text-sm text-fg-muted">Pero contanos dónde estás: registramos tu consulta y revisamos alternativas reales.</p>
              </>
            )}
            <a href={whatsappLink(whatsappMessage)} target="_blank" rel="noopener noreferrer" className="btn btn-primary mt-4 w-full sm:w-auto">
              <MessageCircle size={17} aria-hidden />Consultar por WhatsApp
            </a>
          </div>
        )}
      </div>

      <div className="card relative mt-3 h-[66svh] min-h-[460px] overflow-hidden sm:h-[72svh] lg:h-[76svh]">
        <NetworkCorridor mode="full" activeZone={activeZone} focusNodeId={selected?.nodeId} className="absolute inset-0 h-full w-full" />
        <p className="pointer-events-none absolute left-4 top-4 rounded-full border border-line bg-midnight/80 px-3 py-2 font-mono text-[0.58rem] uppercase tracking-[0.14em] text-fg-faint backdrop-blur-sm sm:left-5 sm:top-5 sm:text-[0.65rem]">
          {selected ? `En foco · ${selected.name}` : "Zonas de servicio · seleccioná una"}
        </p>
        <p className="pointer-events-none absolute bottom-4 left-4 flex items-center gap-2.5 rounded-full border border-line bg-midnight/80 px-3 py-2 font-mono text-[0.56rem] uppercase tracking-[0.1em] text-fg-faint backdrop-blur-sm sm:bottom-5 sm:left-5 sm:text-[0.65rem]">
          <span className={cn("size-2 rounded-full shadow-[0_0_10px_currentColor]", activeStyle.dot)} aria-hidden />{active.summary}
        </p>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-3" role="tablist" aria-label="Zonas de servicio de Killa">
        {serviceZones.map((zone, index) => {
          const isSelected = zone.id === activeZone;
          const style = zoneStyles[zone.accent];
          return (
            <button
              key={zone.id}
              type="button"
              role="tab"
              aria-selected={isSelected}
              aria-controls="detalle-zona"
              onClick={() => { setActiveZone(zone.id); setSelected(null); }}
              className={cn("flex min-h-[58px] items-center justify-between gap-4 rounded-xl border px-4 py-3 text-left transition-[background-color,border-color,transform] duration-300 active:scale-[0.98] sm:block sm:min-h-[72px]", isSelected ? style.selected : "border-line bg-surface/45 hover:border-line-strong")}
            >
              <span className="min-w-0">
                <span className={cn("block font-mono text-[0.48rem] uppercase tracking-[0.08em] sm:text-[0.58rem]", isSelected ? style.kicker : "text-fg-faint")}>Zona {index + 1}</span>
                <span className="mt-0.5 block font-display text-sm font-semibold leading-tight text-fg sm:mt-1">{zone.name}</span>
              </span>
              <span className={cn("size-2.5 shrink-0 rounded-full sm:hidden", isSelected ? style.dot : "bg-line-strong")} aria-hidden />
            </button>
          );
        })}
      </div>

      <div id="detalle-zona" role="tabpanel" className="card mt-3 p-5 sm:p-6">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
          <h3 className="font-display text-xl font-semibold tracking-tight text-fg">{active.name}</h3>
          <p className="font-mono text-[0.62rem] uppercase tracking-[0.12em] text-fg-faint">{active.province} · {active.towns.length} localidades</p>
        </div>
        <ul className="mt-5 flex flex-wrap gap-2">
          {active.towns.map((town) => (
            <li key={town} className="inline-flex items-center gap-2 rounded-full border border-line bg-fg/[0.03] px-3 py-2 text-xs text-fg-muted sm:text-sm">
              <span className={cn("size-1.5 rounded-full", activeStyle.dot)} aria-hidden />{town}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
