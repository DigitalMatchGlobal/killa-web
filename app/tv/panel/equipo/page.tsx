import Link from "next/link";
import { ArrowLeft, Newspaper } from "lucide-react";

import { PanelHeader } from "@/components/panel/panel-header";
import { NewsroomPulseGrid } from "@/components/panel/newsroom-pulse-grid";
import { EditorialCoverageDiagnosis } from "@/components/panel/editorial-coverage-diagnosis";
import { StaffViewContainer } from "@/components/panel/staff-view-container";
import { requireEditorialAdmin } from "@/lib/editorial/auth";
import { getStaffMembersWithStats } from "@/lib/editorial/admin-users";

export const dynamic = "force-dynamic";

export default async function PanelEquipoPage() {
  const profile = await requireEditorialAdmin();
  const { members, pulse } = await getStaffMembersWithStats();

  return (
    <div className="min-h-screen bg-night pb-20">
      <PanelHeader profile={profile} />

      <main className="shell pt-8 sm:pt-10 space-y-8">
        {/* Cabecera de la sección */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-line pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-fg-muted mb-1.5">
              <Link href="/tv/panel" className="hover:text-sand transition-colors inline-flex items-center gap-1">
                <ArrowLeft size={12} />
                Panel
              </Link>
              <span>/</span>
              <span className="text-sand">Equipo y Analíticas</span>
            </div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-fg sm:text-3xl">
              Equipo y redacción
            </h1>
            <p className="mt-1 text-sm text-fg-muted max-w-xl">
              Administración de cuentas editoriales, altas de redactores y seguimiento de publicaciones del staff.
            </p>
          </div>

          <Link href="/tv/panel" className="btn btn-ghost self-start sm:self-auto">
            <Newspaper size={16} />
            Ver noticias
          </Link>
        </div>

        {/* Métricas clave */}
        <NewsroomPulseGrid pulse={pulse} />

        {/* Diagnóstico estratégico de cobertura (Dónde apuntalar) */}
        <EditorialCoverageDiagnosis pulse={pulse} />

        {/* Contenedor interactivo: Alta de integrantes + Switcher Fichas/Tabla + Buscador */}
        <StaffViewContainer members={members} currentUserId={profile.id} />
      </main>
    </div>
  );
}
