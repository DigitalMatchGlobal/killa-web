import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { KeyRound, Shield } from "lucide-react";

import { TvLogo } from "@/components/tv/tv-logo";
import { MandatoryPasswordChangeForm } from "@/components/panel/mandatory-password-change-form";
import { requireEditorialStaff } from "@/lib/editorial/auth";

export const metadata: Metadata = {
  title: "Elegir contraseña definitiva — Killa TV",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function CambiarClaveObligatoriaPage() {
  const profile = await requireEditorialStaff({ allowMustChangePassword: true });

  // Si no tiene pendiente el cambio, redirigir al panel principal
  if (!profile.mustChangePassword) {
    redirect("/tv/panel");
  }

  return (
    <main className="relative min-h-[100svh] overflow-hidden bg-midnight text-fg flex items-center justify-center p-4 sm:p-6">
      <div
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{
          backgroundImage:
            "linear-gradient(rgb(var(--line) / .34) 1px, transparent 1px), linear-gradient(90deg, rgb(var(--line) / .34) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          maskImage: "linear-gradient(to bottom, black, transparent 82%)",
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute left-1/2 top-[-16rem] size-[42rem] -translate-x-1/2 rounded-full bg-sand/[0.09] blur-3xl"
        aria-hidden
      />

      <div className="relative z-10 w-full max-w-lg rounded-2xl border border-line bg-midnight/90 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
        <div className="flex items-center gap-3 border-b border-line pb-6">
          <TvLogo className="h-auto w-[9rem]" />
          <div className="h-5 w-px bg-line" />
          <span className="font-mono text-xs uppercase tracking-wider text-sand inline-flex items-center gap-1.5">
            <Shield size={14} />
            Primer acceso
          </span>
        </div>

        <div className="mt-6">
          <div className="inline-grid size-10 place-items-center rounded-full bg-sand/10 text-sand mb-3">
            <KeyRound size={20} />
          </div>
          <h1 className="font-display text-xl font-bold text-fg sm:text-2xl">
            ¡Hola, {profile.displayName}!
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-fg-muted leading-relaxed">
            Te damos la bienvenida al equipo editorial de Killa TV. Por seguridad, por favor elegí tu contraseña definitiva para comenzar a redactar y publicar notas.
          </p>
        </div>

        <MandatoryPasswordChangeForm />
      </div>
    </main>
  );
}
