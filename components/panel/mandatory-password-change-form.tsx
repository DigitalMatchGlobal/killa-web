"use client";

import { useActionState, useState } from "react";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";

import { completeInitialPasswordChangeAction } from "@/lib/editorial/admin-actions";

export function MandatoryPasswordChangeForm() {
  const [state, action, isPending] = useActionState(completeInitialPasswordChangeAction, null);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={action} className="mt-6 space-y-4">
      {!state?.ok && state?.error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-xs text-red-300">
          {state.error}
        </div>
      )}

      <div>
        <label
          htmlFor="initial-new-password"
          className="block text-xs font-mono uppercase tracking-wider text-fg-muted mb-1.5"
        >
          Tu nueva contraseña personal *
        </label>
        <div className="relative">
          <input
            id="initial-new-password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            minLength={8}
            autoComplete="new-password"
            placeholder="Mínimo 8 caracteres"
            className="w-full rounded-xl border border-line bg-fg/5 px-4 py-3 text-sm text-fg placeholder:text-fg-faint focus:border-sand focus:outline-none pr-11"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-fg-muted hover:text-fg"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      <div>
        <label
          htmlFor="initial-confirm-password"
          className="block text-xs font-mono uppercase tracking-wider text-fg-muted mb-1.5"
        >
          Confirmá tu contraseña *
        </label>
        <input
          id="initial-confirm-password"
          name="confirmPassword"
          type={showPassword ? "text" : "password"}
          required
          minLength={8}
          autoComplete="new-password"
          placeholder="Repetí exactamente la contraseña"
          className="w-full rounded-xl border border-line bg-fg/5 px-4 py-3 text-sm text-fg placeholder:text-fg-faint focus:border-sand focus:outline-none"
        />
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-sand py-3 text-sm font-semibold text-midnight transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          <ShieldCheck size={18} />
          {isPending ? "Guardando..." : "Guardar contraseña y entrar al panel"}
        </button>
      </div>
    </form>
  );
}
