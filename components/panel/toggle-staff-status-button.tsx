"use client";

import { useState, useSyncExternalStore, useTransition } from "react";
import { createPortal } from "react-dom";
import { Trash2, UserCheck, UserX, X } from "lucide-react";

import { deleteStaffUserAction, toggleStaffUserStatusAction } from "@/lib/editorial/admin-actions";

const emptySubscribe = () => () => {};

export function ToggleStaffStatusButton({
  userId,
  userName,
  isSuspended,
}: {
  userId: string;
  userName: string;
  isSuspended: boolean;
}) {
  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
  const [modalType, setModalType] = useState<"toggle" | "delete" | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleClose = () => {
    if (isPending) return;
    setModalType(null);
    setErrorMessage(null);
  };

  const handleConfirmToggle = () => {
    setErrorMessage(null);
    startTransition(async () => {
      const res = await toggleStaffUserStatusAction(userId, isSuspended ? "activate" : "suspend");
      if (!res.ok) {
        setErrorMessage(res.error);
      } else {
        setModalType(null);
      }
    });
  };

  const handleConfirmDelete = () => {
    setErrorMessage(null);
    startTransition(async () => {
      const res = await deleteStaffUserAction(userId);
      if (!res.ok) {
        setErrorMessage(res.error);
      } else {
        setModalType(null);
      }
    });
  };

  const modalContent = modalType ? (
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
        <button
          type="button"
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-full p-1 text-fg-muted hover:bg-fg/5 hover:text-fg transition-colors"
        >
          <X size={18} />
        </button>

        {modalType === "toggle" && (
          <div>
            <div className="flex items-center gap-3">
              <div
                className={`grid size-11 place-items-center rounded-full ${
                  isSuspended
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                }`}
              >
                {isSuspended ? <UserCheck size={20} /> : <UserX size={20} />}
              </div>
              <div>
                <h3 className="font-display text-base font-semibold text-fg">
                  {isSuspended ? "¿Reactivar acceso?" : "¿Desactivar acceso?"}
                </h3>
                <p className="font-mono text-xs text-sand">{userName}</p>
              </div>
            </div>

            <p className="mt-4 text-xs text-fg-muted leading-relaxed">
              {isSuspended
                ? `El usuario recuperará inmediatamente el acceso al panel editorial con su contraseña actual.`
                : `Se cerrará la sesión actual de ${userName} y no podrá ingresar al panel editorial hasta que vuelvas a reactivar su cuenta.`}
            </p>

            {errorMessage && (
              <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
                {errorMessage}
              </div>
            )}

            <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-line">
              <button
                type="button"
                onClick={handleClose}
                disabled={isPending}
                className="rounded-full px-4 py-2 text-xs text-fg-muted hover:text-fg transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmToggle}
                disabled={isPending}
                className={`inline-flex items-center justify-center rounded-full px-5 py-2 text-xs font-semibold transition-opacity disabled:opacity-50 ${
                  isSuspended
                    ? "bg-emerald-500 text-midnight hover:opacity-90"
                    : "bg-red-500 text-white hover:opacity-90"
                }`}
              >
                {isPending
                  ? "Procesando..."
                  : isSuspended
                    ? "Reactivar acceso"
                    : "Desactivar acceso"}
              </button>
            </div>
          </div>
        )}

        {modalType === "delete" && (
          <div>
            <div className="flex items-center gap-3">
              <div className="grid size-11 place-items-center rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                <Trash2 size={20} />
              </div>
              <div>
                <h3 className="font-display text-base font-semibold text-fg">
                  ¿Eliminar usuario definitivamente?
                </h3>
                <p className="font-mono text-xs text-red-400">{userName}</p>
              </div>
            </div>

            <p className="mt-4 text-xs text-fg-muted leading-relaxed">
              Esta acción borrará la cuenta de forma permanente. Las noticias periodísticas que haya redactado se conservarán intactas en el portal.
            </p>

            {errorMessage && (
              <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
                {errorMessage}
              </div>
            )}

            <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-line">
              <button
                type="button"
                onClick={handleClose}
                disabled={isPending}
                className="rounded-full px-4 py-2 text-xs text-fg-muted hover:text-fg transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isPending}
                className="inline-flex items-center justify-center rounded-full bg-red-600 px-5 py-2 text-xs font-semibold text-white hover:bg-red-500 transition-colors disabled:opacity-50"
              >
                {isPending ? "Eliminando..." : "Eliminar definitivamente"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  ) : null;

  return (
    <>
      <div className="inline-flex items-center gap-1.5 justify-end">
        {isSuspended ? (
          <button
            type="button"
            onClick={() => setModalType("toggle")}
            disabled={isPending}
            className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1 text-[0.7rem] font-medium text-emerald-300 hover:bg-emerald-500/20 transition-colors disabled:opacity-50"
            title="Reactivar cuenta de usuario"
          >
            <UserCheck size={12} />
            Reactivar
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setModalType("toggle")}
            disabled={isPending}
            className="inline-flex items-center gap-1.5 rounded-full border border-red-500/30 bg-red-500/10 px-2.5 py-1 text-[0.7rem] font-medium text-red-300 hover:bg-red-500/20 transition-colors disabled:opacity-50"
            title="Suspender acceso al panel"
          >
            <UserX size={12} />
            Desactivar
          </button>
        )}

        <button
          type="button"
          onClick={() => setModalType("delete")}
          disabled={isPending}
          className="inline-flex size-7 items-center justify-center rounded-full border border-line text-fg-muted hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-400 transition-colors disabled:opacity-50"
          title="Eliminar usuario definitivamente"
        >
          <Trash2 size={13} />
        </button>
      </div>

      {isMounted && modalContent ? createPortal(modalContent, document.body) : null}
    </>
  );
}
