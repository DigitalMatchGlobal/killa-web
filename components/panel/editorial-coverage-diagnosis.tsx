import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import type { NewsroomPulse } from "@/lib/editorial/admin-users";

export function EditorialCoverageDiagnosis({ pulse }: { pulse: NewsroomPulse }) {
  const categories = pulse.categoryDistribution;
  const emptyCategories = categories.filter((c) => c.count === 0);

  return (
    <div className="rounded-2xl border border-line bg-midnight/40 p-5">
      {/* Cabecera minimalista */}
      <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 border-b border-line/60 pb-3">
        <div>
          <h2 className="font-display text-sm font-semibold text-fg">
            Cobertura por sección
          </h2>
          <p className="text-xs text-fg-muted mt-0.5">
            Distribución de publicaciones en las secciones de Killa TV.
            {emptyCategories.length > 0 && (
              <span className="text-fg-faint ml-1">
                ({emptyCategories.map((c) => c.name).join(" y ")} sin notas aún).
              </span>
            )}
          </p>
        </div>

        <span className="text-[0.7rem] font-mono text-fg-faint">
          {categories.length - emptyCategories.length} de {categories.length} activas
        </span>
      </div>

      {/* Grid minimalista de secciones */}
      <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
        {categories.map((cat) => {
          const hasArticles = cat.count > 0;

          return (
            <Link
              key={cat.id}
              href={`/tv/panel?categoria=${cat.id}`}
              className="group flex flex-col justify-between rounded-xl border border-line/50 bg-midnight/50 p-3 hover:border-line-strong hover:bg-midnight/70 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-fg truncate group-hover:text-sand transition-colors">
                    {cat.name}
                  </span>
                  <ArrowUpRight size={11} className="shrink-0 text-fg-faint opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                <div className="mt-2 flex items-baseline gap-1.5">
                  <span className={`text-lg font-display font-semibold ${hasArticles ? "text-fg" : "text-fg-faint"}`}>
                    {cat.count}
                  </span>
                  <span className="text-[0.68rem] text-fg-faint">
                    {cat.count === 1 ? "nota" : "notas"}
                  </span>
                </div>
              </div>

              {/* Barra de progreso sutil y estado */}
              <div className="mt-3">
                <div className="h-1 w-full overflow-hidden rounded-full bg-fg/10">
                  <div
                    style={{ width: `${Math.max(cat.percentage, hasArticles ? 8 : 0)}%` }}
                    className={`h-full rounded-full transition-all ${
                      hasArticles ? "bg-sand" : "bg-transparent"
                    }`}
                  />
                </div>
                <div className="mt-1.5 flex justify-between text-[0.65rem] text-fg-faint font-mono">
                  <span>{hasArticles ? `${cat.percentage}%` : "Sin notas"}</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
