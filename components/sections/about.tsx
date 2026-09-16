import { coverageLocalities } from "@/lib/network";
import { offices, site } from "@/lib/site";

/**
 * Quiénes somos + Killa en números.
 *
 * Reemplaza la banda plana de estadísticas y consolida la narrativa de la PYME
 * con las cifras de la empresa, usando tarjetas expandibles: el número resume y,
 * al abrir, muestra el detalle verificable (provincias, oficinas, corredores).
 *
 * Las cifras salen de los datos reales del sitio (oficinas y localidades de
 * lib/network.ts + lib/site.ts), no de valores sueltos: si cambia el mapa,
 * cambian solas. Los años se leen de `site.yearsInBusiness`.
 * TODO(cliente): confirmar la antigüedad exacta (13 como ISP / 18 total).
 */
const provinces = ["Salta", "Jujuy", "Tucumán", "Catamarca"];
const officeCities = offices.map((office) => office.city);

const stats = [
  {
    value: `+${site.yearsInBusiness}`,
    label: "años de trayectoria",
    detail: "Arrancamos en la TV por cable.",
    items: [
      "Más de una década como proveedor de internet en el valle",
      "Producción audiovisual propia con Killa TV",
    ],
  },
  {
    value: "4",
    label: "provincias con cobertura",
    detail: "En el norte, sobre la RN 40.",
    items: provinces,
  },
  {
    value: String(offices.length),
    label: "oficinas y puntos de atención",
    detail: "Atención presencial, zona por zona.",
    items: officeCities,
  },
  {
    value: String(coverageLocalities.length),
    label: "localidades con cobertura",
    detail: "Del interior a la ruta.",
    items: [
      "Ramal Norte: Yuto, Caimancito y Libertador Gral. San Martín",
      "Valles Calchaquíes: de La Poma a San José, sobre la RN 40",
    ],
  },
];

export function About() {
  return (
    <section id="empresa" className="section-pad relative border-t border-line">
      <div className="shell grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
        <div className="reveal">
          <p className="eyebrow">
            <span className="node-dot" aria-hidden />
            Quiénes somos
          </p>
          <h2 className="display mt-4 text-[clamp(2rem,7vw,3.1rem)]">
            Una PYME del valle,
            <br />
            hace {site.yearsInBusiness} años.
          </h2>
          <p className="mt-6 text-fg-muted">
            Empezamos como prestadora de televisión por cable y nunca nos fuimos del
            rubro. Esa permanencia ininterrumpida nos dejó lo que hoy es nuestro mayor
            capital: un equipo de personas con oficio en comunicaciones, que conoce
            cada cerro por donde pasa un enlace.
          </p>
          <p className="mt-4 text-fg-muted">
            No es una promesa de folleto: es presencia real en el territorio, sostenida
            en el tiempo y medible en números.
          </p>
        </div>

        <div className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2">
          {stats.map((item, index) => (
            <details
              key={item.label}
              className="group reveal bg-midnight p-5 open:bg-surface/80 sm:p-6"
              style={{ ["--reveal-delay" as string]: `${index * 70}ms` }}
            >
              <summary className="flex cursor-pointer list-none items-start justify-between gap-3 [&::-webkit-details-marker]:hidden">
                <span className="min-w-0">
                  <span className="display block text-[clamp(2.1rem,7vw,3rem)] leading-none text-cyan">
                    {item.value}
                  </span>
                  <span className="mt-3 block font-display text-sm font-semibold tracking-tight text-fg">
                    {item.label}
                  </span>
                  <span className="mt-1 block text-xs leading-relaxed text-fg-faint">{item.detail}</span>
                </span>
                <span className="grid size-7 shrink-0 place-items-center rounded-full border border-line text-lg text-fg-faint transition-transform group-open:rotate-45" aria-hidden>
                  +
                </span>
              </summary>
              <ul className="mt-5 space-y-2 border-t border-line pt-4 text-xs leading-relaxed text-fg-muted">
                {item.items.map((entry) => (
                  <li key={entry} className="flex gap-2.5">
                    <span className="mt-[0.45rem] size-1.5 shrink-0 rounded-full bg-cyan" aria-hidden />
                    {entry}
                  </li>
                ))}
              </ul>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
