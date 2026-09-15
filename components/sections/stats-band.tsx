import { Building2, MapPinned, RadioTower } from "lucide-react";

/**
 * Vista conceptual del estado de red.
 *
 * TODO(cliente): sustituir `corridors` por la respuesta del monitor/NOC. La UI
 * ya separa estado general y corredores, así que el futuro cambio queda
 * contenido en esta fuente de datos y no obliga a rediseñar la sección.
 */

const companyStats = [
  { value: "+13", label: "años de trayectoria ininterrumpida", icon: RadioTower },
  { value: "4", label: "provincias conectadas en el norte", icon: MapPinned },
  { value: "8", label: "oficinas y puntos de atención local", icon: Building2 },
];

export function StatsBand() {
  return (
    <section
      id="trayectoria"
      aria-labelledby="company-stats-title"
      className="network-status border-y border-line bg-night/75"
    >
      <div className="shell py-8 sm:py-10">
        <div className="network-status-panel overflow-hidden rounded-[1.35rem] border border-line bg-midnight/55">
          <div className="border-b border-line p-5 sm:p-6">
            <p className="font-mono text-[0.58rem] uppercase tracking-[0.14em] text-cyan">Killa en números</p>
            <h2 id="company-stats-title" className="mt-2 font-display text-xl font-semibold tracking-tight text-fg sm:text-2xl">
              Una red construida desde el territorio
            </h2>
          </div>
          <div className="grid sm:grid-cols-3">
            {companyStats.map(({ value, label, icon: Icon }, index) => (
              <article
                key={label}
                className={`px-5 py-5 sm:px-6 sm:py-7 ${index > 0 ? "border-t border-line sm:border-l sm:border-t-0" : ""}`}
              >
                <Icon size={18} className="text-cyan" aria-hidden />
                <p className="display mt-4 text-4xl text-fg">{value}</p>
                <p className="mt-2 max-w-[20ch] text-sm leading-relaxed text-fg-muted">{label}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
