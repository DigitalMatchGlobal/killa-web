import Link from "next/link";
import { ArrowUpRight, Clock, ShieldCheck, Star } from "lucide-react";

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

export function StaffBentoCards({
  members,
  currentUserId,
}: {
  members: StaffMemberWithStats[];
  currentUserId: string;
}) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
      {members.map((member) => {
        const isMe = member.id === currentUserId;
        const initials = getInitials(member.displayName || member.email);
        const hasArticles = member.stats.total > 0;

        return (
          <article
            key={member.id}
            className={`flex flex-col justify-between rounded-2xl border bg-midnight/50 p-5 transition-colors overflow-hidden ${
              member.isSuspended
                ? "border-red-500/30 opacity-70"
                : "border-line hover:border-line-strong"
            }`}
          >
            <div>
              {/* Header: Avatar, Datos y Rol */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="grid size-10 shrink-0 place-items-center rounded-full bg-fg/10 font-mono text-xs font-semibold text-fg">
                    {initials}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-medium text-sm text-fg truncate">
                        {member.displayName}
                      </h3>
                      {isMe && (
                        <span className="text-[0.65rem] text-fg-faint font-mono">
                          (tú)
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-fg-muted truncate">
                      {member.email}
                    </p>
                  </div>
                </div>

                {/* Rol badge sobrio */}
                <div className="shrink-0">
                  {member.role === "admin" ? (
                    <span className="inline-flex items-center gap-1 rounded-full border border-line bg-fg/5 px-2.5 py-0.5 text-[0.68rem] font-medium text-fg">
                      <ShieldCheck size={11} className="text-sand" />
                      Admin
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full border border-line bg-transparent px-2.5 py-0.5 text-[0.68rem] text-fg-muted">
                      Editor
                    </span>
                  )}
                </div>
              </div>

              {/* Bloque central de 3 slots para altura y estructura uniforme */}
              <div className="mt-4 space-y-2.5 border-t border-line/60 pt-3 text-xs">
                {/* Slot 1: Volumen de notas */}
                <div className="flex items-center gap-2 text-fg-muted min-h-[1.25rem]">
                  {hasArticles ? (
                    <>
                      <span>
                        <strong className="font-semibold text-fg">{member.stats.published}</strong> publicadas
                      </span>
                      <span>·</span>
                      <span>
                        <strong className="font-semibold text-fg">{member.stats.draft}</strong> borradores
                      </span>
                      {member.stats.featuredCount > 0 && (
                        <>
                          <span>·</span>
                          <span className="inline-flex items-center gap-0.5 text-sand font-medium">
                            <Star size={10} fill="currentColor" />
                            {member.stats.featuredCount} en portada
                          </span>
                        </>
                      )}
                    </>
                  ) : (
                    <span className="text-fg-faint">0 publicadas · 0 borradores</span>
                  )}
                </div>

                {/* Slot 2: Especialidad temática */}
                <div className="text-xs min-h-[1.25rem] truncate">
                  {member.stats.topCategory ? (
                    <div className="truncate">
                      <span className="text-fg-faint text-[0.7rem]">Especialidad:</span>{" "}
                      <span className="font-medium text-fg">{member.stats.topCategory.name}</span>{" "}
                      <span className="text-[0.68rem] font-mono text-fg-faint">
                        ({member.stats.topCategory.percentage}%)
                      </span>
                    </div>
                  ) : (
                    <span className="text-fg-faint/80 italic text-[0.75rem]">
                      Sin sección asignada aún
                    </span>
                  )}
                </div>

                {/* Slot 3: Última nota redactada */}
                <div className="text-xs min-w-0 max-w-full min-h-[1.5rem]">
                  {member.stats.latestArticle ? (
                    <div className="min-w-0 max-w-full">
                      <div className="text-[0.68rem] text-fg-faint leading-tight">Última nota:</div>
                      <Link
                        href={`/tv/noticias/${member.stats.latestArticle.slug}`}
                        target="_blank"
                        className="group mt-0.5 flex items-center gap-1 text-xs text-fg-muted hover:text-fg transition-colors min-w-0 max-w-full"
                      >
                        <span className="truncate flex-1 min-w-0">
                          {member.stats.latestArticle.title}
                        </span>
                        <ArrowUpRight size={12} className="shrink-0 text-fg-faint group-hover:text-fg" />
                      </Link>
                    </div>
                  ) : (
                    <span className="text-[0.75rem] text-fg-faint/70">
                      Listo para asignar temas
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Footer: Última conexión y Acciones */}
            <div className="mt-5 flex items-center justify-between border-t border-line/60 pt-3 text-xs text-fg-faint">
              <span className="inline-flex items-center gap-1 text-[0.7rem] shrink-0">
                <Clock size={12} />
                {formatRelativeOrDate(member.lastSignInAt)}
              </span>

              {isMe ? (
                <span className="text-[0.7rem] text-fg-faint">
                  Tu cuenta
                </span>
              ) : (
                <ToggleStaffStatusButton
                  userId={member.id}
                  userName={member.displayName || member.email}
                  isSuspended={member.isSuspended}
                />
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}
