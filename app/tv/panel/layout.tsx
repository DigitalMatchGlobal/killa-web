import type { Metadata } from "next";

export const metadata: Metadata = {
  // Ninguna pantalla del panel se indexa.
  robots: { index: false, follow: false },
};

/**
 * Envoltorio visual del panel.
 *
 * DELIBERADAMENTE NO verifica la sesión: el login vive dentro de `/tv/panel`,
 * así que un guard acá haría un bucle de redirecciones. El control de acceso
 * está en cada página (`requireEditorialStaff`), en cada Server Action y en las
 * RLS. El middleware, además, saca de acá a cualquiera sin sesión.
 */
export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-night text-fg">{children}</div>;
}
