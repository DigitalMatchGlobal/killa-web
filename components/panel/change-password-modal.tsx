"use client";

import { useActionState, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { KeyRound, Lock, X, Check, Eye, EyeOff } from "lucide-react";

import { changePasswordAction } from "@/lib/editorial/admin-actions";

const emptySubscribe = () => () => {};

export function ChangePasswordModal() {
  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
  const [open, setOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [state, action, isPending] = useActionState(changePasswordAction, null);

  const handleClose = () => {
    setOpen(false);
  };

  const modalContent = open ? (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-midnight/80 backdrop-blur-sm animate-in fade-in duration-150"
    >
      <div
        className="relative w-full max-w-md rounded-2xl border border-line bg-midnight p-6 shadow-2xl"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between border-b border-line pb-4">
          <div className="flex items-center gap-2.5 text-sand font-display font-semibold">
            <Lock size={18} />
            <h3>Cambiar mi contraseña</h3>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-full p-1 text-fg-muted hover:bg-fg/5 hover:text-fg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {state?.ok ? (
          <div className="py-6 text-center space-y-4">
            <div className="mx-auto grid size-12 place-items-center rounded-full bg-emerald-500/10 text-emerald-400">
              <Check size={24} />
            </div>
            <div>
              <h4 className="font-semibold text-fg">¡Contraseña actualizada!</h4>
              <p className="mt-1 text-xs text-fg-muted">
                Tu nueva contraseña ya quedó registrada para futuros inicios de sesión.
              </p>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="btn btn-sand btn-sm mt-2 w-full"
            >
              Cerrar
            </button>
          </div>
        ) : (
          <form action={action} className="mt-5 space-y-4">
            {!state?.ok && state?.error && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
                {state.error}
              </div>
            )}

            <div>
              <label
                htmlFor="new-password"
                className="block text-xs font-mono uppercase tracking-wider text-fg-muted mb-1.5"
              >
                Nueva contraseña
              </label>
              <div className="relative">
                <input
                  id="new-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  placeholder="Mínimo 8 caracteres"
                  className="w-full rounded-lg border border-line bg-fg/5 px-3.5 py-2.5 text-sm text-fg placeholder:text-fg-faint focus:border-sand focus:outline-none pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-fg-muted hover:text-fg"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="confirm-password"
                className="block text-xs font-mono uppercase tracking-wider text-fg-muted mb-1.5"
              >
                Confirmar nueva contraseña
              </label>
              <input
                id="confirm-password"
                name="confirmPassword"
                type={showPassword ? "text" : "password"}
                required
                minLength={8}
                autoComplete="new-password"
                placeholder="Repetí la contraseña"
                className="w-full rounded-lg border border-line bg-fg/5 px-3.5 py-2.5 text-sm text-fg placeholder:text-fg-faint focus:border-sand focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-line">
              <button
                type="button"
                onClick={handleClose}
                className="rounded-full px-4 py-2 text-xs text-fg-muted hover:text-fg transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="inline-flex items-center justify-center rounded-full bg-sand px-5 py-2 text-xs font-medium text-midnight transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {isPending ? "Guardando..." : "Guardar contraseña"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  ) : null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex size-8 sm:size-auto sm:min-h-9 items-center justify-center gap-1.5 rounded-full border border-line p-0 sm:px-3 text-xs text-fg-muted transition-colors hover:border-sand/60 hover:text-fg"
        title="Cambiar clave"
        aria-label="Cambiar clave"
      >
        <KeyRound size={14} aria-hidden />
        <span className="hidden sm:inline">Clave</span>
      </button>

      {isMounted && modalContent ? createPortal(modalContent, document.body) : null}
    </>
  );
}
