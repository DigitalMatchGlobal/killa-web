"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import { requireEditorialAdmin, requireEditorialStaff } from "./auth";

export type ActionResult<T = undefined> =
  | ({ ok: true } & (T extends undefined ? { data?: undefined } : { data: T }))
  | { ok: false; error: string };

const createStaffSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(2, "El nombre debe tener al menos 2 caracteres.")
    .max(80, "El nombre no puede exceder 80 caracteres."),
  email: z
    .string()
    .trim()
    .email("Ingresá un correo electrónico válido.")
    .toLowerCase(),
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres.")
    .max(100, "La contraseña es demasiado larga."),
  role: z.enum(["editor", "admin"]).default("editor"),
});

const changePasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "La nueva contraseña debe tener al menos 8 caracteres.")
      .max(100, "La contraseña es demasiado larga."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden.",
    path: ["confirmPassword"],
  });

/**
 * Alta de un nuevo integrante del equipo editorial.
 * Exclusivo de administradores.
 * Se marca `must_change_password: true` para exigir el cambio de clave en el 1er login.
 */
export async function createStaffUserAction(
  _previous: ActionResult<{ email: string; displayName: string }> | null,
  formData: FormData,
): Promise<ActionResult<{ email: string; displayName: string }>> {
  await requireEditorialAdmin();

  const parsed = createStaffSchema.safeParse({
    displayName: formData.get("displayName"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role") || "editor",
  });

  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? "Datos inválidos.";
    return { ok: false, error: firstError };
  }

  const { displayName, email, password, role } = parsed.data;
  const adminClient = createSupabaseAdminClient();

  const { data: userData, error: createError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      display_name: displayName,
      must_change_password: true,
    },
  });

  if (createError || !userData?.user) {
    console.error("Error al crear usuario en Supabase Auth:", createError);
    if (createError?.message?.includes("already been registered") || createError?.message?.includes("unique")) {
      return { ok: false, error: "Ya existe un usuario con este correo electrónico." };
    }
    return { ok: false, error: createError?.message ?? "No se pudo crear el usuario." };
  }

  // Si se seleccionó rol admin, promover explícitamente en profiles
  if (role === "admin") {
    const { error: roleError } = await adminClient
      .from("profiles")
      .update({ role: "admin" })
      .eq("id", userData.user.id);

    if (roleError) {
      console.error("Error al asignar rol admin:", roleError);
    }
  }

  revalidatePath("/tv/panel/equipo");
  return {
    ok: true,
    data: {
      email,
      displayName,
    },
  };
}

/**
 * Permite al usuario con sesión activa cambiar su propia contraseña voluntariamente.
 */
export async function changePasswordAction(
  _previous: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  await requireEditorialStaff({ allowMustChangePassword: true });

  const parsed = changePasswordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? "Datos inválidos.";
    return { ok: false, error: firstError };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
    data: {
      must_change_password: false,
    },
  });

  if (error) {
    console.error("Error al cambiar contraseña:", error);
    return { ok: false, error: error.message ?? "No se pudo actualizar la contraseña." };
  }

  return { ok: true };
}

/**
 * Cambio obligatorio de contraseña en el primer inicio de sesión.
 * Una vez completado, redirige a la portada del panel.
 */
export async function completeInitialPasswordChangeAction(
  _previous: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  await requireEditorialStaff({ allowMustChangePassword: true });

  const parsed = changePasswordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? "Datos inválidos.";
    return { ok: false, error: firstError };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
    data: {
      must_change_password: false,
    },
  });

  if (error) {
    console.error("Error al completar cambio inicial de contraseña:", error);
    return { ok: false, error: error.message ?? "No se pudo actualizar la contraseña." };
  }

  redirect("/tv/panel");
}

/**
 * Suspender o reactivar el acceso de un integrante del equipo.
 * Los administradores no pueden suspenderse a sí mismos.
 */
export async function toggleStaffUserStatusAction(
  userId: string,
  targetStatus: "suspend" | "activate",
): Promise<ActionResult> {
  const currentAdmin = await requireEditorialAdmin();

  if (userId === currentAdmin.id) {
    return { ok: false, error: "No podés suspender tu propia cuenta de administrador." };
  }

  const adminClient = createSupabaseAdminClient();
  const banDuration = targetStatus === "suspend" ? "876000h" : "none";

  const { error } = await adminClient.auth.admin.updateUserById(userId, {
    ban_duration: banDuration,
  });

  if (error) {
    console.error("Error al cambiar estado de acceso del usuario:", error);
    return { ok: false, error: "No se pudo actualizar el estado de acceso del usuario." };
  }

  revalidatePath("/tv/panel/equipo");
  return { ok: true };
}

/**
 * Elimina definitivamente un usuario de Auth y su perfil editorial.
 * Las notas escritas por este redactor conservan su contenido y firma pública
 * (la FK author_id pasa a null automáticamente por on delete set null).
 */
export async function deleteStaffUserAction(userId: string): Promise<ActionResult> {
  const currentAdmin = await requireEditorialAdmin();

  if (userId === currentAdmin.id) {
    return { ok: false, error: "No podés eliminar tu propia cuenta de administrador." };
  }

  const adminClient = createSupabaseAdminClient();
  const { error } = await adminClient.auth.admin.deleteUser(userId);

  if (error) {
    console.error("Error al eliminar usuario:", error);
    return { ok: false, error: "No se pudo eliminar el usuario." };
  }

  revalidatePath("/tv/panel/equipo");
  return { ok: true };
}
