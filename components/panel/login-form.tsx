"use client";

import { useActionState } from "react";
import { AlertCircle, LogIn } from "lucide-react";

import { signInAction, type ActionResult } from "@/lib/editorial/actions";

/**
 * Login del panel. La validación real y el mensaje de error los produce la
 * Server Action; acá sólo se muestran. El navegador nunca ve si el email
 * existe: el mensaje es siempre el mismo.
 */
export function LoginForm() {
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
        <input
          type="email"
          name="email"
          autoComplete="username"
          required
          className="min-h-12 w-full rounded-xl border border-line bg-midnight px-4 text-sm text-fg outline-none focus:border-sand"
        />
      </label>

      <label className="grid gap-2">
        <span className="font-mono text-[0.58rem] uppercase tracking-[0.12em] text-fg-faint">
          Contraseña
        </span>
        <input
          type="password"
          name="password"
          autoComplete="current-password"
          required
          minLength={8}
          className="min-h-12 w-full rounded-xl border border-line bg-midnight px-4 text-sm text-fg outline-none focus:border-sand"
        />
      </label>

      {state && !state.ok ? (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-xl border border-red-400/30 bg-red-400/[0.07] px-4 py-3 text-sm text-red-200"
        >
          <AlertCircle size={16} className="mt-0.5 shrink-0" aria-hidden />
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="btn bg-sand text-midnight hover:bg-sand/90 disabled:opacity-60"
      >
        {pending ? "Ingresando…" : "Ingresar"}
        <LogIn size={16} aria-hidden />
      </button>
    </form>
  );
}
