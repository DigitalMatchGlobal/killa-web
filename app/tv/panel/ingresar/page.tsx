import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, LockKeyhole, Radio, ShieldCheck } from "lucide-react";

import { PoweredBy } from "@/components/brand/powered-by";
import { LoginForm } from "@/components/panel/login-form";
import { TvLogo } from "@/components/tv/tv-logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
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
    <main className="relative min-h-[100svh] overflow-hidden bg-midnight text-fg">
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
      <div
        className="pointer-events-none absolute -bottom-56 -right-44 size-[34rem] rounded-full bg-cyan/[0.08] blur-3xl"
        aria-hidden
      />

      <div className="shell relative z-10 flex min-h-[100svh] flex-col py-5 sm:py-8">
        <header className="flex items-center justify-between gap-4">
          <Link
            href="/tv"
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line bg-midnight/55 px-4 text-sm text-fg-muted backdrop-blur-md transition-colors hover:border-sand/45 hover:text-fg"
          >
            <ArrowLeft size={16} aria-hidden />
            Volver a Killa TV
          </Link>
          <ThemeToggle />
        </header>

        <div className="my-auto grid items-center gap-10 py-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(24rem,0.65fr)] lg:gap-20">
          <section className="hidden lg:block">
            <TvLogo className="h-auto w-[13rem]" />
            <p className="mt-10 inline-flex items-center gap-2 font-mono text-[0.65rem] uppercase tracking-[0.18em] text-sand">
              <Radio size={14} aria-hidden />
              Sala de redacción
            </p>
            <h1 className="display mt-5 max-w-xl text-[clamp(3rem,5vw,5.3rem)]">
              Las historias del norte, listas para salir al aire.
            </h1>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-fg-muted">
              Un espacio privado para crear, previsualizar y publicar noticias de Killa TV.
            </p>
          </section>

          <section className="mx-auto w-full max-w-md">
            <div className="relative overflow-hidden rounded-[1.8rem] border border-line bg-night/85 p-6 shadow-[0_28px_90px_rgb(0_0_0/.32)] backdrop-blur-xl sm:p-9">
              <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-sand/75 to-transparent" aria-hidden />

              <div className="lg:hidden">
                <TvLogo className="h-auto w-[8.5rem]" />
              </div>

              <div className="mt-8 flex items-center gap-4 lg:mt-0">
                <span className="grid size-12 shrink-0 place-items-center rounded-2xl border border-sand/25 bg-sand/10 text-sand">
                  <LockKeyhole size={20} aria-hidden />
                </span>
                <div>
                  <p className="font-mono text-[0.58rem] uppercase tracking-[0.16em] text-sand">
                    Acceso protegido
                  </p>
                  <h2 className="display mt-1 text-2xl sm:text-3xl">Panel editorial</h2>
                </div>
              </div>

              <p className="mt-5 text-sm leading-relaxed text-fg-muted">
                Ingresá con la cuenta asignada al equipo de prensa.
              </p>

              <div className="mt-7">
                <LoginForm />
              </div>

              <div className="mt-6 flex items-start gap-2 border-t border-line pt-5 text-fg-faint">
                <ShieldCheck size={15} className="mt-0.5 shrink-0 text-sand" aria-hidden />
                <p className="font-mono text-[0.56rem] uppercase leading-relaxed tracking-[0.1em]">
                  Sin registro público · Acceso exclusivo para personal autorizado
                </p>
              </div>
            </div>

            <div className="mt-7 flex justify-center">
              <PoweredBy accent="sand" />
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
