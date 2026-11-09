"use client";

import { useActionState, useState } from "react";
import { UserPlus, Sparkles, Copy, Check, Eye, EyeOff, Shield, ShieldCheck } from "lucide-react";

import { createStaffUserAction } from "@/lib/editorial/admin-actions";

function generateSecurePassword(): string {
  const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789!@#$%&*";
  let pwd = "";
  for (let i = 0; i < 12; i++) {
    pwd += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pwd;
}

export function CreateStaffForm() {
  const [state, action, isPending] = useActionState(createStaffUserAction, null);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleGenerate = () => {
    const newPwd = generateSecurePassword();
    setPassword(newPwd);
    setShowPassword(true);
  };

  const copyCredentials = (email: string) => {
    const origin =
      typeof window !== "undefined" && window.location.hostname === "localhost"
        ? "https://killa-web-two.vercel.app"
        : window.location.origin;
    const text = `Acceso al Panel Editorial de Killa TV\nURL: ${origin}/tv/panel/ingresar\nUsuario: ${email}\nContraseña provisoria: ${password}\n\nNota: Al ingresar por primera vez, el sistema te solicitará definir tu contraseña personal definitiva.`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="rounded-2xl border border-line bg-midnight/60 p-5 sm:p-6 backdrop-blur-md">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2 font-display text-base font-semibold text-fg">
            <UserPlus size={18} className="text-sand" />
            Alta de integrante
          </h2>
          <p className="mt-1 text-xs text-fg-muted">
            Crear una cuenta para un nuevo redactor o administrador del portal Killa TV.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-line bg-fg/5 px-3 text-xs font-medium text-fg-muted hover:border-sand/60 hover:text-fg transition-colors"
        >
          {isOpen ? "Ocultar formulario" : "+ Agregar nuevo"}
        </button>
      </div>

      {isOpen && (
        <div className="mt-6 border-t border-line pt-6 animate-in fade-in duration-200">
          {state?.ok && state.data && (
            <div className="mb-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
              <div className="flex items-start gap-3">
                <div className="grid size-8 shrink-0 place-items-center rounded-full bg-emerald-500/20 text-emerald-400">
                  <Check size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                    ¡Cuenta creada exitosamente para {state.data.displayName}!
                  </p>
                  <p className="mt-1 text-xs text-fg-muted">
                    El usuario ya puede ingresar con el correo <span className="font-mono text-fg">{state.data.email}</span>.
                  </p>
                  {password && (
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => copyCredentials(state.data.email)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/40 bg-emerald-500/15 px-3 py-1.5 text-xs font-medium text-emerald-800 dark:text-emerald-200 hover:bg-emerald-500/25 transition-colors"
                      >
                        {copied ? <Check size={14} /> : <Copy size={14} />}
                        {copied ? "¡Copiado al portapapeles!" : "Copiar mensaje de bienvenida"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <form action={action} className="space-y-4">
            {!state?.ok && state?.error && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
                {state.error}
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="staff-display-name"
                  className="block text-xs font-mono uppercase tracking-wider text-fg-muted mb-1.5"
                >
                  Nombre para mostrar *
                </label>
                <input
                  id="staff-display-name"
                  name="displayName"
                  type="text"
                  required
                  placeholder="Ej: Sofía Valdez"
                  className="w-full rounded-lg border border-line bg-fg/5 px-3.5 py-2.5 text-sm text-fg placeholder:text-fg-faint focus:border-sand focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="staff-email"
                  className="block text-xs font-mono uppercase tracking-wider text-fg-muted mb-1.5"
                >
                  Correo electrónico *
                </label>
                <input
                  id="staff-email"
                  name="email"
                  type="email"
                  required
                  placeholder="ejemplo@killa.com.ar"
                  className="w-full rounded-lg border border-line bg-fg/5 px-3.5 py-2.5 text-sm text-fg placeholder:text-fg-faint focus:border-sand focus:outline-none"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="staff-role"
                  className="block text-xs font-mono uppercase tracking-wider text-fg-muted mb-1.5"
                >
                  Rol en el portal *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-line bg-fg/5 p-2.5 text-xs text-fg hover:border-sand/50 transition-colors">
                    <input
                      type="radio"
                      name="role"
                      value="editor"
                      defaultChecked
                      className="accent-sand"
                    />
                    <Shield size={14} className="text-cyan" />
                    <span>Editor</span>
                  </label>
                  <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-line bg-fg/5 p-2.5 text-xs text-fg hover:border-sand/50 transition-colors">
                    <input
                      type="radio"
                      name="role"
                      value="admin"
                      className="accent-sand"
                    />
                    <ShieldCheck size={14} className="text-sand" />
                    <span>Admin</span>
                  </label>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="staff-password"
                    className="block text-xs font-mono uppercase tracking-wider text-fg-muted"
                  >
                    Contraseña provisoria *
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerate}
                    className="inline-flex items-center gap-1 text-[0.7rem] font-mono text-sand hover:underline"
                  >
                    <Sparkles size={12} />
                    Generar aleatoria
                  </button>
                </div>
                <div className="relative">
                  <input
                    id="staff-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 8 caracteres"
                    className="w-full rounded-lg border border-line bg-fg/5 px-3.5 py-2.5 text-sm font-mono text-fg placeholder:text-fg-faint focus:border-sand focus:outline-none pr-10"
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
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isPending}
                className="inline-flex items-center justify-center rounded-full bg-sand px-6 py-2.5 text-xs font-semibold text-midnight transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {isPending ? "Creando usuario..." : "Crear usuario y habilitar acceso"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
