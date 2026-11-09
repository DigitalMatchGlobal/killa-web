import Link from "next/link";
import { ArrowLeft, LockKeyhole, LogOut, Newspaper, Users } from "lucide-react";

import { signOutAction } from "@/lib/editorial/actions";
import type { EditorialProfile } from "@/lib/editorial/types";
import { ChangePasswordModal } from "./change-password-modal";

/**
 * Cabecera del panel. Recibe el perfil que la página ya resolvió (no lo vuelve
 * a consultar), ofrece navegación interna y cierre de sesión.
 */
export function PanelHeader({ profile }: { profile: EditorialProfile }) {
  const isAdmin = profile.role === "admin";

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-midnight/92 backdrop-blur-xl">
      <div className="shell flex h-[68px] items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-4 sm:gap-6">
          <div className="flex items-center gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-sand/10 text-sand">
              <LockKeyhole size={17} aria-hidden />
            </span>
            <div className="min-w-0">
              <Link href="/tv/panel" className="truncate font-display text-sm font-semibold">
                Panel Killa TV
              </Link>
              <p className="truncate font-mono text-[0.52rem] uppercase tracking-[0.1em] text-fg-faint">
                {profile.displayName} · {isAdmin ? "Admin" : "Editor"}
              </p>
            </div>
          </div>

          {/* Navegación de secciones */}
          <nav className="hidden md:flex items-center gap-1 border-l border-line pl-4">
            <Link
              href="/tv/panel"
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs text-fg-muted hover:text-fg hover:bg-fg/5 transition-colors"
            >
              <Newspaper size={14} />
              <span>Noticias</span>
            </Link>
            {isAdmin && (
              <Link
                href="/tv/panel/equipo"
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs text-fg-muted hover:text-sand hover:bg-sand/10 transition-colors"
              >
                <Users size={14} />
                <span>Equipo</span>
              </Link>
            )}
          </nav>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {/* Navegación móvil de equipo */}
          {isAdmin && (
            <Link
              href="/tv/panel/equipo"
              className="md:hidden inline-flex min-h-10 items-center justify-center rounded-full border border-line px-2.5 text-xs text-fg-muted hover:border-sand/60 hover:text-sand"
              title="Equipo y redactores"
            >
              <Users size={14} />
            </Link>
          )}

          {/* Modal de cambio de contraseña */}
          <ChangePasswordModal />

          <Link
            href="/tv"
            className="inline-flex min-h-10 items-center gap-2 rounded-full border border-line px-3 text-xs text-fg-muted hover:border-sand/60 hover:text-fg"
          >
            <ArrowLeft size={14} aria-hidden />
            <span className="hidden sm:inline">Portal público</span>
            <span className="sm:hidden">Portal</span>
          </Link>
          <form action={signOutAction}>
            <button
              type="submit"
              className="inline-flex min-h-10 items-center gap-2 rounded-full border border-line px-3 text-xs text-fg-muted hover:border-red-400/60 hover:text-fg"
            >
              <LogOut size={14} aria-hidden />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
