import Link from "next/link";
import { ArrowLeft, CheckCircle2, FileEdit, Users, ShieldCheck } from "lucide-react";

import { PanelHeader } from "@/components/panel/panel-header";
import { CreateStaffForm } from "@/components/panel/create-staff-form";
import { StaffTable } from "@/components/panel/staff-table";
import { requireEditorialAdmin } from "@/lib/editorial/auth";
import { getStaffMembersWithStats } from "@/lib/editorial/admin-users";

export const dynamic = "force-dynamic";

export default async function PanelEquipoPage() {
  const profile = await requireEditorialAdmin();
  const members = await getStaffMembersWithStats();

  const totalMembers = members.length;
  const totalPublished = members.reduce((acc, m) => acc + m.stats.published, 0);
  const totalDrafts = members.reduce((acc, m) => acc + m.stats.draft, 0);
  const totalAdmins = members.filter((m) => m.role === "admin").length;

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
              Gestión del equipo
            </h1>
            <p className="mt-1 text-sm text-fg-muted max-w-xl">
              Administración de cuentas editoriales, altas de redactores y seguimiento de publicaciones y actividad.
            </p>
          </div>
        </div>

        {/* Tarjetas de métricas rápidas */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          <div className="rounded-2xl border border-line bg-midnight/60 p-4 sm:p-5 backdrop-blur-md">
            <div className="flex items-center justify-between text-fg-muted">
              <span className="text-xs font-mono uppercase tracking-wider">Integrantes</span>
              <Users size={16} className="text-sand" />
            </div>
            <div className="mt-2 text-2xl sm:text-3xl font-bold font-display text-fg">
              {totalMembers}
            </div>
            <div className="mt-1 text-[0.7rem] text-fg-faint">
              {totalAdmins} admin · {totalMembers - totalAdmins} editores
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-midnight/60 p-4 sm:p-5 backdrop-blur-md">
            <div className="flex items-center justify-between text-fg-muted">
              <span className="text-xs font-mono uppercase tracking-wider">Publicadas</span>
              <CheckCircle2 size={16} className="text-emerald-400" />
            </div>
            <div className="mt-2 text-2xl sm:text-3xl font-bold font-display text-emerald-400">
              {totalPublished}
            </div>
            <div className="mt-1 text-[0.7rem] text-fg-faint">
              En el portal Killa TV
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-midnight/60 p-4 sm:p-5 backdrop-blur-md">
            <div className="flex items-center justify-between text-fg-muted">
              <span className="text-xs font-mono uppercase tracking-wider">Borradores</span>
              <FileEdit size={16} className="text-amber-400" />
            </div>
            <div className="mt-2 text-2xl sm:text-3xl font-bold font-display text-amber-400">
              {totalDrafts}
            </div>
            <div className="mt-1 text-[0.7rem] text-fg-faint">
              En edición o revisión
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-midnight/60 p-4 sm:p-5 backdrop-blur-md">
            <div className="flex items-center justify-between text-fg-muted">
              <span className="text-xs font-mono uppercase tracking-wider">Total notas</span>
              <ShieldCheck size={16} className="text-cyan" />
            </div>
            <div className="mt-2 text-2xl sm:text-3xl font-bold font-display text-fg">
              {totalPublished + totalDrafts}
            </div>
            <div className="mt-1 text-[0.7rem] text-fg-faint">
              Generadas por el staff
            </div>
          </div>
        </div>

        {/* Formulario para dar de alta nuevo integrante */}
        <CreateStaffForm />

        {/* Tabla con lista de integrantes y métricas individuales */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-semibold text-fg">
              Integrantes y actividad ({members.length})
            </h2>
            <span className="font-mono text-[0.7rem] text-fg-faint">
              Métricas actualizadas en tiempo real
            </span>
          </div>

          <StaffTable members={members} currentUserId={profile.id} />
        </div>
      </main>
    </div>
  );
}
