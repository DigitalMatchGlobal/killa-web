import { BadgePercent, BarChart3, BookOpen, Link2 } from "lucide-react";

const nextStages = [
  {
    icon: BookOpen,
    title: "Killa TV · crecimiento editorial",
    detail: "Buscador, archivo, perfiles, programación y métricas de lectura.",
  },
  {
    icon: BadgePercent,
    title: "Club Killa",
    detail: "Comercios, promociones y cupones con validación QR.",
  },
  {
    icon: Link2,
    title: "Integración con Mikrowisp",
    detail: "Validación del abonado y credencial digital de socio activo.",
  },
  {
    icon: BarChart3,
    title: "Ahorro y reportes",
    detail: "Ahorro acumulado, resúmenes mensuales y reportes de uso.",
  },
] as const;

export function FutureRoadmap() {
  return (
    <section className="section-pad relative border-t border-line">
      <div className="shell">
        <header className="reveal max-w-3xl">
          <p className="eyebrow">
            <span className="node-dot" aria-hidden />
            Continuidad del plan
          </p>
          <h2 className="display mt-4 text-[clamp(2rem,7vw,3.3rem)]">
            La Etapa 1 deja
            <br />
            la base preparada.
          </h2>
          <p className="mt-5 max-w-2xl text-fg-muted">
            Estas capacidades fueron relevadas y pueden construirse sobre el sitio,
            pero corresponden a iteraciones posteriores con alcance e inversión propios.
          </p>
        </header>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {nextStages.map(({ icon: Icon, title, detail }, index) => (
            <article
              key={title}
              className="card reveal flex items-start gap-4 p-5 sm:p-6"
              style={{ ["--reveal-delay" as string]: String(index * 70) + "ms" }}
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-full border border-cyan/20 bg-cyan/[0.06] text-cyan">
                <Icon size={18} strokeWidth={1.6} aria-hidden />
              </span>
              <div>
                <p className="font-mono text-[0.56rem] uppercase tracking-[0.13em] text-fg-faint">
                  Próxima iteración
                </p>
                <h3 className="mt-1.5 font-display text-lg font-semibold tracking-tight">
                  {title}
                </h3>
                <p className="mt-2 text-sm text-fg-muted">{detail}</p>
              </div>
            </article>
          ))}
        </div>

        <p className="mt-6 border-l border-cyan/40 pl-4 text-xs leading-relaxed text-fg-faint">
          En Mikrowisp la integración prevista se limita a validar abonados para Club
          Killa. Facturación y reclamos continúan en el portal actual de clientes.
        </p>
      </div>
    </section>
  );
}
