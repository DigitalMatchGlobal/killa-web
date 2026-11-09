import { Clock, ShieldCheck, Star } from "lucide-react";

import type { StaffMemberWithStats } from "@/lib/editorial/admin-users";
import { ToggleStaffStatusButton } from "./toggle-staff-status-button";

function formatRelativeOrDate(isoDate: string | null): string {
  if (!isoDate) return "Pendiente de acceso";

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
    <div className="overflow-hidden rounded-2xl border border-line bg-midnight/40">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-line bg-fg/[0.02] text-xs font-medium text-fg-muted">
              <th className="py-3 px-4 sm:px-6">Integrante</th>
              <th className="py-3 px-4">Rol</th>
              <th className="py-3 px-4">Especialidad</th>
              <th className="py-3 px-4 text-center">En Portada</th>
              <th className="py-3 px-4 text-center">Notas</th>
              <th className="py-3 px-4">Última conexión</th>
              <th className="py-3 px-4 sm:px-6 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line text-xs">
            {members.map((member) => (
              <tr
                key={member.id}
                className="hover:bg-fg/[0.02] transition-colors"
              >
                {/* Nombre y correo */}
                <td className="py-3.5 px-4 sm:px-6">
                  <div className="flex items-center gap-3">
                    <div className="grid size-9 shrink-0 place-items-center rounded-full bg-fg/10 font-mono text-xs font-semibold text-fg">
                      {getInitials(member.displayName || member.email)}
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium text-fg truncate">
                        {member.displayName}
                        {member.id === currentUserId && (
                          <span className="ml-1.5 text-[0.68rem] text-fg-faint font-mono">
                            (tú)
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-fg-muted truncate">
                        {member.email}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Rol */}
                <td className="py-3.5 px-4 whitespace-nowrap">
                  {member.role === "admin" ? (
                    <span className="inline-flex items-center gap-1 rounded-full border border-line bg-fg/5 px-2.5 py-0.5 text-[0.7rem] font-medium text-fg">
                      <ShieldCheck size={11} className="text-sand" />
                      Admin
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full border border-line bg-transparent px-2.5 py-0.5 text-[0.7rem] text-fg-muted">
                      Editor
                    </span>
                  )}
                </td>

                {/* Especialidad temática */}
                <td className="py-3.5 px-4 whitespace-nowrap">
                  {member.stats.topCategory ? (
                    <span className="inline-flex items-center gap-1 text-xs text-fg">
                      <span className="font-medium">{member.stats.topCategory.name}</span>
                      <span className="text-fg-faint font-mono text-[0.68rem]">
                        ({member.stats.topCategory.percentage}%)
                      </span>
                    </span>
                  ) : (
                    <span className="text-fg-faint text-xs">Sin notas aún</span>
                  )}
                </td>

                {/* En Portada / Destacadas */}
                <td className="py-3.5 px-4 whitespace-nowrap text-center">
                  {member.stats.featuredCount > 0 ? (
                    <span className="inline-flex items-center gap-1 font-semibold text-sand">
                      <Star size={11} fill="currentColor" />
                      {member.stats.featuredCount}
                    </span>
                  ) : (
                    <span className="text-fg-faint">-</span>
                  )}
                </td>

                {/* Noticias (Métricas) */}
                <td className="py-3.5 px-4 whitespace-nowrap text-center">
                  <span className="text-xs text-fg-muted">
                    <strong className="font-semibold text-fg">{member.stats.published}</strong> pub
                    <span className="text-fg-faint mx-1.5">·</span>
                    <span className="text-fg-faint">{member.stats.draft} borrador</span>
                  </span>
                </td>

                {/* Última conexión */}
                <td className="py-3.5 px-4 whitespace-nowrap text-fg-muted">
                  <span className="inline-flex items-center gap-1.5">
                    <Clock size={12} className="text-fg-faint" />
                    <span className={member.lastSignInAt ? "text-fg-muted" : "text-fg-faint italic"}>
                      {formatRelativeOrDate(member.lastSignInAt)}
                    </span>
                  </span>
                </td>

                {/* Acciones */}
                <td className="py-3.5 px-4 sm:px-6 whitespace-nowrap text-right">
                  {member.id === currentUserId ? (
                    <span className="text-xs text-fg-faint italic">
                      Tu usuario
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
