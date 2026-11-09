"use client";

import { useTransition } from "react";
import { Trash2, UserCheck, UserX } from "lucide-react";

import { deleteStaffUserAction, toggleStaffUserStatusAction } from "@/lib/editorial/admin-actions";

export function ToggleStaffStatusButton({
  userId,
  userName,
  isSuspended,
}: {
  userId: string;
  userName: string;
  isSuspended: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    const confirmMessage = isSuspended
      ? `¿Reactivar el acceso de ${userName}? Podrá volver a ingresar al panel.`
      : `¿Desactivar el acceso de ${userName}? Se cerrará su sesión y no podrá ingresar al panel hasta que lo reactives.`;

    if (!window.confirm(confirmMessage)) return;

    startTransition(async () => {
      const res = await toggleStaffUserStatusAction(userId, isSuspended ? "activate" : "suspend");
      if (!res.ok) {
        alert(res.error);
      }
    });
  };

  const handleDelete = () => {
    const confirmMessage = `⚠️ ¿ELIMINAR DEFINITIVAMENTE la cuenta de ${userName}?\n\nEsta acción borrará al usuario del sistema. Las notas que haya redactado se conservarán intactas en el portal.`;
    if (!window.confirm(confirmMessage)) return;

    startTransition(async () => {
      const res = await deleteStaffUserAction(userId);
      if (!res.ok) {
        alert(res.error);
      }
    });
  };

  return (
    <div className="inline-flex items-center gap-1.5 justify-end">
      {isSuspended ? (
        <button
          type="button"
          onClick={handleToggle}
          disabled={isPending}
          className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1 text-[0.7rem] font-medium text-emerald-300 hover:bg-emerald-500/20 transition-colors disabled:opacity-50"
          title="Reactivar cuenta de usuario"
        >
          <UserCheck size={12} />
          {isPending ? "..." : "Reactivar"}
        </button>
      ) : (
        <button
          type="button"
          onClick={handleToggle}
          disabled={isPending}
          className="inline-flex items-center gap-1.5 rounded-full border border-red-500/30 bg-red-500/10 px-2.5 py-1 text-[0.7rem] font-medium text-red-300 hover:bg-red-500/20 transition-colors disabled:opacity-50"
          title="Suspender acceso al panel"
        >
          <UserX size={12} />
          {isPending ? "..." : "Desactivar"}
        </button>
      )}

      <button
        type="button"
        onClick={handleDelete}
        disabled={isPending}
        className="inline-flex size-7 items-center justify-center rounded-full border border-line text-fg-muted hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-400 transition-colors disabled:opacity-50"
        title="Eliminar usuario definitivamente"
      >
        <Trash2 size={13} />
      </button>
    </div>
  );
}
