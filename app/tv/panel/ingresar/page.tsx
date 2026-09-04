import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, LockKeyhole } from "lucide-react";

import { LoginForm } from "@/components/panel/login-form";
import { getCurrentProfile } from "@/lib/editorial/auth";

export const metadata: Metadata = {
  title: "Ingresar al panel",
  // El panel no se indexa: no es contenido, y no queremos el formulario de
  // login en resultados de búsqueda.
  robots: { index: false, follow: false },
};

export default async function PanelLoginPage() {
  const profile = await getCurrentProfile();
  if (profile) redirect("/tv/panel");

  return (
    <main className="grid min-h-screen place-items-center bg-night px-5 py-12 text-fg">
      <div className="w-full max-w-md">
        <Link
          href="/tv"
          className="inline-flex items-center gap-2 text-sm text-fg-muted hover:text-fg"
        >
          <ArrowLeft size={16} aria-hidden />
          Killa TV
        </Link>

        <div className="card mt-6 p-7 sm:p-9">
          <span className="grid size-11 place-items-center rounded-full bg-sand/10 text-sand">
            <LockKeyhole size={19} aria-hidden />
          </span>
          <h1 className="display mt-5 text-3xl">Panel editorial</h1>
          <p className="mt-2 text-sm text-fg-muted">
            Acceso para el equipo de prensa de Killa TV.
          </p>

          <div className="mt-7">
            <LoginForm />
          </div>

          <p className="mt-6 font-mono text-[0.55rem] uppercase leading-relaxed tracking-[0.1em] text-fg-faint">
            No hay registro abierto. Las cuentas las crea un administrador.
          </p>
        </div>
      </div>
    </main>
  );
}
