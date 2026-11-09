import { FileText, Newspaper, TrendingUp, Users } from "lucide-react";

import type { NewsroomPulse } from "@/lib/editorial/admin-users";

export function NewsroomPulseGrid({ pulse }: { pulse: NewsroomPulse }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {/* 1. Equipo */}
      <div className="rounded-2xl border border-line bg-midnight/50 p-4 sm:p-5">
        <div className="flex items-center justify-between text-fg-muted">
          <span className="text-xs font-medium text-fg-muted">Integrantes</span>
          <Users size={16} className="text-fg-faint" />
        </div>
        <div className="mt-2 text-2xl sm:text-3xl font-display font-semibold tracking-tight text-fg">
          {pulse.totalStaff}
        </div>
        <div className="mt-1 text-xs text-fg-faint">
          {pulse.activeToday > 0
            ? `${pulse.activeToday} activos hoy`
            : "Redacción configurada"}
        </div>
      </div>

      {/* 2. Publicadas */}
      <div className="rounded-2xl border border-line bg-midnight/50 p-4 sm:p-5">
        <div className="flex items-center justify-between text-fg-muted">
          <span className="text-xs font-medium text-fg-muted">Publicadas</span>
          <Newspaper size={16} className="text-fg-faint" />
        </div>
        <div className="mt-2 text-2xl sm:text-3xl font-display font-semibold tracking-tight text-fg">
          {pulse.totalPublished}
        </div>
        <div className="mt-1 text-xs text-fg-faint">
          Visibles en Killa TV
        </div>
      </div>

      {/* 3. Borradores */}
      <div className="rounded-2xl border border-line bg-midnight/50 p-4 sm:p-5">
        <div className="flex items-center justify-between text-fg-muted">
          <span className="text-xs font-medium text-fg-muted">Borradores</span>
          <FileText size={16} className="text-fg-faint" />
        </div>
        <div className="mt-2 text-2xl sm:text-3xl font-display font-semibold tracking-tight text-fg">
          {pulse.totalDrafts}
        </div>
        <div className="mt-1 text-xs text-fg-faint">
          En redacción o revisión
        </div>
      </div>

      {/* 4. Ritmo semanal */}
      <div className="rounded-2xl border border-line bg-midnight/50 p-4 sm:p-5">
        <div className="flex items-center justify-between text-fg-muted">
          <span className="text-xs font-medium text-fg-muted">Ritmo semanal</span>
          <TrendingUp size={16} className="text-fg-faint" />
        </div>
        <div className="mt-2 text-2xl sm:text-3xl font-display font-semibold tracking-tight text-fg">
          {pulse.articlesThisWeek}
        </div>
        <div className="mt-1 text-xs text-fg-faint">
          Publicadas los últimos 7 días
        </div>
      </div>
    </div>
  );
}
