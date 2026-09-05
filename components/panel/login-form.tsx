"use client";

import { useActionState, useState } from "react";
import { AlertCircle, Eye, EyeOff, LoaderCircle, LockKeyhole, LogIn, Mail } from "lucide-react";

import { signInAction, type ActionResult } from "@/lib/editorial/actions";

/**
 * Login del panel. La validación real y el mensaje de error los produce la
 * Server Action; acá sólo se muestran. El navegador nunca ve si el email
 * existe: el mensaje es siempre el mismo.
 */
export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    signInAction,
    null,
  );

  return (
    <form action={formAction} className="grid gap-4">
      <label className="grid gap-2">
        <span className="font-mono text-[0.58rem] uppercase tracking-[0.12em] text-fg-faint">
          Email
        </span>
        <span className="relative block">
          <Mail size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-fg-faint" aria-hidden />
          <input
            type="email"
            name="email"
            inputMode="email"
            autoCapitalize="none"
            autoCorrect="off"
            autoComplete="username"
            placeholder="nombre@killa.com.ar"
            required
            disabled={pending}
            className="min-h-13 w-full rounded-xl border border-line bg-midnight/75 py-3 pl-11 pr-4 text-base text-fg outline-none transition-[border-color,box-shadow] placeholder:text-fg-faint/65 focus:border-sand focus:shadow-[0_0_0_3px_rgb(var(--sand)/.1)] disabled:opacity-60 sm:text-sm"
          />
        </span>
      </label>

      <label className="grid gap-2">
        <span className="font-mono text-[0.58rem] uppercase tracking-[0.12em] text-fg-faint">
          Contraseña
        </span>
        <span className="relative block">
          <LockKeyhole size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-fg-faint" aria-hidden />
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            autoComplete="current-password"
            placeholder="••••••••"
            required
            minLength={8}
            disabled={pending}
            className="min-h-13 w-full rounded-xl border border-line bg-midnight/75 py-3 pl-11 pr-12 text-base text-fg outline-none transition-[border-color,box-shadow] placeholder:tracking-[0.2em] placeholder:text-fg-faint/65 focus:border-sand focus:shadow-[0_0_0_3px_rgb(var(--sand)/.1)] disabled:opacity-60 sm:text-sm"
          />
          <button
            type="button"
            onClick={() => setShowPassword((current) => !current)}
            disabled={pending}
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            className="absolute right-2 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-lg text-fg-faint transition-colors hover:bg-fg/[0.05] hover:text-fg disabled:opacity-50"
          >
            {showPassword ? <EyeOff size={17} aria-hidden /> : <Eye size={17} aria-hidden />}
          </button>
        </span>
      </label>

      {state && !state.ok ? (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-xl border border-red-400/30 bg-red-400/[0.07] px-4 py-3 text-sm text-red-400"
        >
          <AlertCircle size={16} className="mt-0.5 shrink-0" aria-hidden />
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="btn relative mt-1 min-h-13 overflow-hidden bg-sand text-midnight shadow-[0_12px_35px_rgb(var(--sand)/.12)] hover:bg-sand/90 disabled:opacity-60"
      >
        {pending ? (
          <>
            Verificando…
            <LoaderCircle size={16} className="animate-spin" aria-hidden />
          </>
        ) : (
          <>
            Ingresar
            <LogIn size={16} aria-hidden />
          </>
        )}
      </button>
    </form>
  );
}
