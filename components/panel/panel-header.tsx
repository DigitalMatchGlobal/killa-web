import Link from "next/link";
import { ArrowLeft, LockKeyhole, LogOut } from "lucide-react";

import { signOutAction } from "@/lib/editorial/actions";
import type { EditorialProfile } from "@/lib/editorial/types";

/**
 * Cabecera del panel. Recibe el perfil que la página ya resolvió (no lo vuelve
 * a consultar) y ofrece el cierre de sesión.
 */
export function PanelHeader({ profile }: { profile: EditorialProfile }) {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-midnight/92 backdrop-blur-xl">
      <div className="shell flex h-[68px] items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-sand/10 text-sand">
            <LockKeyhole size={17} aria-hidden />
          </span>
          <div className="min-w-0">
            <Link href="/tv/panel" className="truncate font-display text-sm font-semibold">
              Panel Killa TV
            </Link>
            <p className="truncate font-mono text-[0.52rem] uppercase tracking-[0.1em] text-fg-faint">
              {profile.displayName} · {profile.role === "admin" ? "Admin" : "Editor"}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
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
