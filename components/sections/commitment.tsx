import { site, socialCommitment } from "@/lib/site";

/**
 * Quiénes somos + compromiso social.
 *
 * Las cuatro cifras son las que la propia empresa declara en killa.com.ar
 * (destacamentos, escuelas, iglesias y las 250 familias de Brealito y
 * Luracatao). Es el activo reputacional más fuerte que tienen y en el sitio
 * actual está enterrado al pie de "Quiénes somos".
 */
export function Commitment() {
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
            Estar acá también implica sostener lo que la conectividad no siempre
            alcanza sola.
          </p>
        </div>

        <div className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2">
          {socialCommitment.map((item, index) => (
            <details
              key={item.label}
              className="group reveal bg-midnight p-5 open:bg-surface/80 sm:p-7"
              style={{ ["--reveal-delay" as string]: `${index * 70}ms` }}
            >
              <summary className="flex cursor-pointer list-none items-center gap-4 [&::-webkit-details-marker]:hidden">
                <span className="display min-w-[3.4rem] text-[clamp(2.35rem,8vw,3.5rem)] leading-none text-cyan">
                  {item.value}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-sm font-semibold tracking-tight text-fg">
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
