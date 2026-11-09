import Link from "next/link";
import { ArrowLeft, LockKeyhole, LogOut } from "lucide-react";

import { signOutAction } from "@/lib/editorial/actions";
import type { EditorialProfile } from "@/lib/editorial/types";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { ChangePasswordModal } from "./change-password-modal";

/**
 * Cabecera del panel. Recibe el perfil que la página ya resolvió (no lo vuelve
 * a consultar), ofrece navegación interna y cierre de sesión.
 */
export function PanelHeader({ profile }: { profile: EditorialProfile }) {
  const isAdmin = profile.role === "admin";

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-midnight/92 backdrop-blur-xl w-full">
      <div className="shell flex h-[62px] sm:h-[68px] items-center justify-between gap-2 sm:gap-3">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3 flex-1">
          <span className="grid size-8 sm:size-9 shrink-0 place-items-center rounded-full bg-sand/10 text-sand">
            <LockKeyhole size={16} aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <Link href="/tv/panel" className="block truncate font-display text-xs sm:text-sm font-semibold hover:text-sand transition-colors">
              Panel Killa TV
            </Link>
            <p className="block truncate font-mono text-[0.55rem] sm:text-[0.58rem] uppercase tracking-[0.06em] text-fg-faint">
              {profile.displayName} · {isAdmin ? "Admin" : "Editor"}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          {/* Selector de tema claro / oscuro */}
          <ThemeToggle className="size-8 sm:size-9" />

          {/* Modal de cambio de contraseña */}
          <ChangePasswordModal />

          <Link
            href="/tv"
            className="inline-flex size-8 sm:size-auto sm:min-h-9 items-center justify-center gap-1.5 rounded-full border border-line p-0 sm:px-3 text-xs text-fg-muted hover:border-sand/60 hover:text-fg"
            title="Portal público"
            aria-label="Portal público"
          >
            <ArrowLeft size={14} aria-hidden />
            <span className="hidden sm:inline">Portal</span>
          </Link>
          <form action={signOutAction} className="inline-flex">
            <button
              type="submit"
              className="inline-flex size-8 sm:size-auto sm:min-h-9 items-center justify-center gap-1.5 rounded-full border border-line p-0 sm:px-3 text-xs text-fg-muted hover:border-red-400/60 hover:text-fg"
              title="Cerrar sesión"
              aria-label="Cerrar sesión"
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
