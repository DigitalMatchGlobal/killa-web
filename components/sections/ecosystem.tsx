import {
  ArrowUpRight,
  Cable,
  Clapperboard,
  Megaphone,
  Network,
  RadioTower,
  ShieldCheck,
  Tv,
} from "lucide-react";

const units = [
  {
    code: "01 / CONECTIVIDAD",
    name: "killa internet",
    description:
      "Infraestructura propia y soluciones de telecomunicaciones pensadas para hogares, empresas y comunidades.",
    icon: RadioTower,
    accent: "cyan",
    services: [
      { icon: Cable, label: "Redes FTTH" },
      { icon: Network, label: "Redes de datos" },
      { icon: ShieldCheck, label: "Internet dedicado" },
    ],
    href: "#hogar",
    cta: "Ver planes y soluciones",
  },
  {
    code: "02 / CONTENIDOS",
    name: "killatv",
    description:
      "El medio regional que amplifica la identidad, la cultura y la actualidad de nuestras comunidades.",
    icon: Tv,
    accent: "sand",
    services: [
      { icon: Megaphone, label: "Cobertura y publicidad" },
      { icon: Clapperboard, label: "Producción de eventos" },
      { icon: ShieldCheck, label: "CCTV" },
    ],
    href: "/tv",
    cta: "Conocer Killa TV",
  },
] as const;

export function Ecosystem() {
  return (
    <section id="ecosistema" className="section-pad relative overflow-hidden border-b border-line">
      <div className="absolute inset-0 -z-20 grid-weave opacity-35" aria-hidden />
      <div className="ecosystem-orbit absolute left-1/2 top-1/2 -z-10 size-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan/10" aria-hidden>
        <span className="absolute left-1/2 top-[-4px] size-2 -translate-x-1/2 rounded-full bg-cyan shadow-[0_0_24px_rgba(0,188,232,0.9)]" />
      </div>

      <div className="shell">
        <header className="reveal mx-auto max-w-3xl text-center">
          <p className="eyebrow justify-center">
            <span className="node-dot" aria-hidden />
            Un proveedor · todas las soluciones
          </p>
          <h2 className="display mt-4 text-[clamp(2rem,7vw,3.5rem)]">
            Dos unidades. Una misma red.
            <br />
            <span className="text-cyan">Todo el norte conectado.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-fg-muted">
            Killa combina tecnología, infraestructura y comunicación regional para
            resolver de punta a punta lo que cada hogar, empresa y comunidad necesita.
          </p>
        </header>

        <div className="relative mt-12 grid gap-4 lg:grid-cols-2">
          <div className="signal-sweep absolute left-1/2 top-1/2 hidden h-px w-[12%] -translate-x-1/2 bg-gradient-to-r from-cyan via-white to-sand lg:block" aria-hidden />

          {units.map((unit, index) => {
            const Icon = unit.icon;
            const warm = unit.accent === "sand";
            return (
              <article
                key={unit.name}
                className={`ecosystem-card reveal group relative overflow-hidden rounded-[1.4rem] border p-6 sm:p-8 ${
                  warm
                    ? "ecosystem-card--sand border-sand/25"
                    : "ecosystem-card--cyan border-cyan/30"
                }`}
                style={{ ["--reveal-delay" as string]: `${index * 100}ms` }}
              >
                <div className="flex items-start justify-between gap-5">
                  <p className={`font-mono text-[0.66rem] uppercase tracking-[0.18em] ${warm ? "text-sand" : "text-cyan"}`}>
                    {unit.code}
                  </p>
                  <span className={`grid size-11 place-items-center rounded-full border ${warm ? "border-sand/25 bg-sand/[0.06] text-sand" : "border-cyan/30 bg-cyan/[0.08] text-cyan"}`}>
                    <Icon size={20} strokeWidth={1.5} aria-hidden />
                  </span>
                </div>

                <h3 className="display mt-8 text-[clamp(2.4rem,10vw,4.2rem)] lowercase text-fg">
                  {unit.name}
                </h3>
                <p className="mt-4 max-w-md text-sm leading-relaxed text-fg-muted sm:text-base">
                  {unit.description}
                </p>

                <ul className="mt-7 grid gap-2 border-t border-line/80 pt-6 sm:grid-cols-3">
                  {unit.services.map(({ icon: ServiceIcon, label }) => (
                    <li key={label} className="flex items-center gap-2.5 text-xs text-fg-muted">
                      <ServiceIcon size={15} className={warm ? "text-sand" : "text-cyan"} aria-hidden />
                      {label}
                    </li>
                  ))}
                </ul>

                <a
                  href={unit.href}
                  className={`group/link mt-8 inline-flex items-center gap-2 font-display text-sm font-semibold ${warm ? "text-sand" : "text-cyan"}`}
                >
                  {unit.cta}
                  <ArrowUpRight size={16} className="transition-transform duration-300 group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5" aria-hidden />
                </a>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
