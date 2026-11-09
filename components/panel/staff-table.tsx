import { Clock, FileText, Shield, ShieldCheck, UserCheck, UserX } from "lucide-react";

import type { StaffMemberWithStats } from "@/lib/editorial/admin-users";
import { ToggleStaffStatusButton } from "./toggle-staff-status-button";

function formatRelativeOrDate(isoDate: string | null): string {
  if (!isoDate) return "Nunca ingresó";

  try {
    const d = new Date(isoDate);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 5) return "Activo ahora";
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours} h`;
    if (diffDays < 7) return `Hace ${diffDays} d`;

    return d.toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return isoDate;
  }
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function StaffTable({
  members,
  currentUserId,
}: {
  members: StaffMemberWithStats[];
  currentUserId: string;
}) {
  if (members.length === 0) {
    return (
      <div className="rounded-2xl border border-line bg-midnight/40 p-8 text-center text-fg-muted">
        No se encontraron integrantes en el equipo.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-midnight/40 backdrop-blur-md">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-line bg-fg/5 text-[0.65rem] font-mono uppercase tracking-wider text-fg-muted">
              <th className="py-3.5 px-4 sm:px-6">Integrante</th>
              <th className="py-3.5 px-4">Rol</th>
              <th className="py-3.5 px-4">Estado</th>
              <th className="py-3.5 px-4">Última conexión</th>
              <th className="py-3.5 px-4 text-center">Noticias</th>
              <th className="py-3.5 px-4 sm:px-6 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line text-xs">
            {members.map((member) => (
              <tr
                key={member.id}
                className="transition-colors hover:bg-fg/[0.02]"
              >
                {/* Integrante */}
                <td className="py-4 px-4 sm:px-6">
                  <div className="flex items-center gap-3">
                    <div
                      className={`grid size-9 shrink-0 place-items-center rounded-full font-mono text-xs font-semibold ${
                        member.role === "admin"
                          ? "bg-sand/15 text-sand border border-sand/30"
                          : "bg-cyan/15 text-cyan border border-cyan/30"
                      }`}
                    >
                      {getInitials(member.displayName || member.email)}
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium text-fg truncate">
                        {member.displayName}
                      </div>
                      <div className="font-mono text-[0.7rem] text-fg-muted truncate">
                        {member.email}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Rol */}
                <td className="py-4 px-4 whitespace-nowrap">
                  {member.role === "admin" ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-sand/40 bg-sand/10 px-2.5 py-0.5 font-mono text-[0.65rem] uppercase tracking-wider text-sand">
                      <ShieldCheck size={12} />
                      Admin
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan/40 bg-cyan/10 px-2.5 py-0.5 font-mono text-[0.65rem] uppercase tracking-wider text-cyan">
                      <Shield size={12} />
                      Editor
                    </span>
                  )}
                </td>

                {/* Estado de acceso */}
                <td className="py-4 px-4 whitespace-nowrap">
                  {member.isSuspended ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-red-500/30 bg-red-500/10 px-2.5 py-0.5 font-mono text-[0.65rem] uppercase tracking-wider text-red-300">
                      <UserX size={11} />
                      Desactivado
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 font-mono text-[0.65rem] uppercase tracking-wider text-emerald-300">
                      <UserCheck size={11} />
                      Activo
                    </span>
                  )}
                </td>

                {/* Última conexión */}
                <td className="py-4 px-4 whitespace-nowrap text-fg-muted">
                  <span className="inline-flex items-center gap-1.5">
                    <Clock size={13} className="text-fg-faint" />
                    <span
                      className={
                        member.lastSignInAt
                          ? "text-fg"
                          : "text-fg-faint italic"
                      }
                    >
                      {formatRelativeOrDate(member.lastSignInAt)}
                    </span>
                  </span>
                </td>

                {/* Noticias (Métricas) */}
                <td className="py-4 px-4 whitespace-nowrap text-center">
                  <div className="inline-flex items-center gap-2">
                    <span
                      title="Publicadas"
                      className="inline-flex items-center gap-1 rounded bg-emerald-500/10 px-2 py-0.5 font-mono text-[0.7rem] text-emerald-300 border border-emerald-500/20"
                    >
                      <FileText size={11} />
                      {member.stats.published} pub
                    </span>
                    <span
                      title="Borradores"
                      className="inline-flex items-center gap-1 rounded bg-amber-500/10 px-2 py-0.5 font-mono text-[0.7rem] text-amber-300 border border-amber-500/20"
                    >
                      {member.stats.draft} borrador
                    </span>
                    <span className="font-mono text-[0.65rem] text-fg-faint">
                      ({member.stats.total} tot)
                    </span>
                  </div>
                </td>

                {/* Acciones */}
                <td className="py-4 px-4 sm:px-6 whitespace-nowrap text-right">
                  {member.id === currentUserId ? (
                    <span className="font-mono text-[0.7rem] text-fg-faint italic">
                      (Tu usuario)
                    </span>
                  ) : (
                    <ToggleStaffStatusButton
                      userId={member.id}
                      userName={member.displayName || member.email}
                      isSuspended={member.isSuspended}
                    />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
