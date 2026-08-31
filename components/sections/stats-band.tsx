import { Activity, ArrowUpRight } from "lucide-react";

/**
 * Vista conceptual del estado de red.
 *
 * TODO(cliente): sustituir `corridors` por la respuesta del monitor/NOC. La UI
 * ya separa estado general y corredores, así que el futuro cambio queda
 * contenido en esta fuente de datos y no obliga a rediseñar la sección.
 */

const corridors = [
  { name: "Ramal norte", detail: "Yuto · Caimancito · Libertador" },
  { name: "Valles Calchaquíes", detail: "La Poma · Cachi · Cafayate" },
  { name: "Corredor sur", detail: "Colalao · Santa María · San José" },
];

export function StatsBand() {
  return (
    <section
      id="estado-red"
      aria-labelledby="network-status-title"
      className="network-status border-y border-line bg-night/75"
    >
      <div className="shell py-8 sm:py-10">
        <div className="network-status-panel overflow-hidden rounded-[1.35rem] border border-line bg-midnight/55">
          <div className="grid gap-5 border-b border-line p-5 sm:p-6 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <div className="flex items-center gap-2.5 font-mono text-[0.58rem] uppercase tracking-[0.14em] text-cyan">
                <span className="size-2 rounded-full bg-cyan shadow-[0_0_12px_rgb(var(--cyan)/0.65)]" aria-hidden />
                Vista conceptual
              </div>
              <div className="mt-3 flex items-start gap-3">
                <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-full border border-cyan/25 bg-cyan/10 text-cyan">
                  <Activity size={17} aria-hidden />
                </span>
                <div>
                  <h2 id="network-status-title" className="font-display text-xl font-semibold leading-tight tracking-tight text-fg sm:text-2xl">
                    Cómo se vería el monitoreo
                  </h2>
                  <p className="mt-1 text-xs text-fg-muted sm:text-sm">
                    Una vista preparada para integrar datos reales del NOC
                  </p>
                </div>
              </div>
            </div>

            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-sand/30 bg-sand/[0.07] px-3 py-1.5 font-mono text-[0.55rem] uppercase tracking-[0.12em] text-sand">
              Integración futura
              <ArrowUpRight size={12} aria-hidden />
            </span>
          </div>

          <div className="grid sm:grid-cols-3">
            {corridors.map((corridor, index) => (
              <article
                key={corridor.name}
                className={`px-5 py-4 sm:px-5 sm:py-5 ${index > 0 ? "border-t border-line sm:border-l sm:border-t-0" : ""}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-display text-sm font-semibold text-fg">
                    {corridor.name}
                  </h3>
                  <span className="inline-flex shrink-0 items-center gap-1.5 font-mono text-[0.5rem] uppercase tracking-[0.1em] text-fg-faint">
                    <span className="size-1.5 rounded-full border border-cyan bg-cyan/20" aria-hidden />
                    Ejemplo
                  </span>
                </div>
                <p className="mt-1 text-[0.68rem] leading-relaxed text-fg-faint">
                  {corridor.detail}
                </p>
              </article>
            ))}
          </div>
        </div>

        <p className="mt-3 max-w-2xl font-mono text-[0.5rem] uppercase leading-relaxed tracking-[0.09em] text-fg-faint sm:text-[0.54rem]">
          Demostración visual · no representa el estado actual de la red. La conexión con el monitor puede incorporarse en una iteración posterior.
        </p>
      </div>
    </section>
  );
}
