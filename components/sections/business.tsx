import {
  Cable,
  Gauge,
  KeyRound,
  Network,
  RadioTower,
  Route,
  type LucideIcon,
} from "lucide-react";

import { businessServices, whatsappLink } from "@/lib/site";

const icons: Record<string, LucideIcon> = {
  gauge: Gauge,
  network: Network,
  cable: Cable,
  radio: RadioTower,
  route: Route,
  key: KeyRound,
};

export function Business() {
  return (
    <section id="empresas" className="section-pad relative border-t border-line">
      {/* Cambio de superficie: la banda de empresas es un escalón más clara. */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(180deg, transparent, rgb(var(--night)) 22%, rgb(var(--night)) 78%, transparent)",
        }}
        aria-hidden
      />

      <div className="shell">
        <div className="reveal flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="eyebrow">
              <span className="node-dot" aria-hidden />
              Infraestructura y telecomunicaciones
            </p>
            <h2 className="display mt-4 text-[clamp(2rem,7vw,3.25rem)]">
              Soluciones a medida,
              <br className="hidden sm:block" /> de punta a punta.
            </h2>
          </div>
          <p className="max-w-md text-fg-muted">
            Relevamos, tendemos y mantenemos. Desde un enlace dedicado para una bodega
            hasta la red troncal de un municipio, con el mismo equipo que sostiene el
            valle todos los días.
          </p>
        </div>

        <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
          {businessServices.map((service, index) => {
            const Icon = icons[service.icon] ?? Network;
            return (
              <article
                key={service.title}
                className="reveal group relative bg-midnight p-7 transition-colors duration-500 hover:bg-surface/60"
                style={{ ["--reveal-delay" as string]: `${(index % 3) * 80}ms` }}
              >
                <Icon
                  size={26}
                  strokeWidth={1.4}
                  className="text-cyan transition-transform duration-500 group-hover:-translate-y-1"
                  aria-hidden
                />
                <h3 className="mt-5 font-display text-lg font-semibold tracking-tight text-fg">
                  {service.title}
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed text-fg-muted">{service.body}</p>
              </article>
            );
          })}
        </div>

        <div className="reveal mt-8">
          <a
            href={whatsappLink(
              "Hola Killa, quiero hablar por un servicio para mi empresa.",
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-ghost w-full sm:w-auto"
          >
            Hablar con el área de empresas
          </a>
        </div>
      </div>
    </section>
  );
}
