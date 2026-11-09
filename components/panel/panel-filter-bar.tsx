"use client";

import { useId, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";

import type { Category } from "@/lib/editorial/types";

export function PanelFilterBar({
  categories,
  staffProfiles,
  currentUserId,
  currentUserDisplayName,
  isAdmin,
  search,
  categoryId,
  authorParam,
  status,
}: {
  categories: Category[];
  staffProfiles: { id: string; displayName: string; role: string }[];
  currentUserId: string;
  currentUserDisplayName: string;
  isAdmin: boolean;
  search: string | null;
  categoryId: string | null;
  authorParam: string | null;
  status: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const searchId = useId();

  const updateFilters = (updates: { q?: string; categoria?: string; autor?: string }) => {
    const params = new URLSearchParams();
    if (status !== "all") params.set("estado", status);

    const finalQ = "q" in updates ? updates.q : (search ?? "");
    const finalCat = "categoria" in updates ? updates.categoria : (categoryId ?? "");
    const finalAuthor = "autor" in updates ? updates.autor : (authorParam ?? "");

    if (finalQ) params.set("q", finalQ);
    if (finalCat) params.set("categoria", finalCat);
    if (finalAuthor) params.set("autor", finalAuthor);

    const qs = params.toString();
    startTransition(() => {
      router.push(qs ? `/tv/panel?${qs}` : "/tv/panel");
    });
  };

  const handleClear = () => {
    const params = new URLSearchParams();
    if (status !== "all") params.set("estado", status);
    const qs = params.toString();
    startTransition(() => {
      router.push(qs ? `/tv/panel?${qs}` : "/tv/panel");
    });
  };

  const hasActiveFilters = Boolean(categoryId || authorParam || search);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const q = (form.elements.namedItem("q") as HTMLInputElement)?.value.trim();
        updateFilters({ q });
      }}
      className="mt-4 grid gap-2 rounded-2xl border border-line bg-surface/35 p-3 sm:grid-cols-[minmax(0,1.2fr)_12rem_14rem_auto]"
    >
      {/* Búsqueda por texto (Enter o botón Buscar) */}
      <div className="relative">
        <label htmlFor={searchId} className="sr-only">
          Buscar por título
        </label>
        <Search
          size={16}
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-fg-faint"
          aria-hidden
        />
        <input
          id={searchId}
          type="search"
          name="q"
          defaultValue={search ?? ""}
          placeholder="Buscar por título..."
          className="min-h-11 w-full rounded-xl border border-line bg-midnight pl-10 pr-4 text-sm text-fg outline-none placeholder:text-fg-faint focus:border-cyan"
        />
      </div>

      {/* Categoría: filtra de inmediato al elegir */}
      <label>
        <span className="sr-only">Filtrar por categoría</span>
        <select
          name="categoria"
          value={categoryId ?? ""}
          onChange={(e) => updateFilters({ categoria: e.target.value })}
          className="min-h-11 w-full rounded-xl border border-line bg-midnight px-3 text-sm text-fg outline-none focus:border-cyan cursor-pointer"
        >
          <option value="">Todas las categorías</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </label>

      {/* Autor: filtra de inmediato al elegir */}
      <label>
        <span className="sr-only">Filtrar por autor</span>
        <select
          name="autor"
          value={authorParam ?? ""}
          onChange={(e) => updateFilters({ autor: e.target.value })}
          className="min-h-11 w-full rounded-xl border border-line bg-midnight px-3 text-sm text-fg outline-none focus:border-cyan cursor-pointer"
        >
          <option value="">Todos los autores</option>
          <option value="yo">Mis noticias ({currentUserDisplayName})</option>
          {isAdmin &&
            staffProfiles
              .filter((p) => p.id !== currentUserId)
              .map((p) => (
                <option key={p.id} value={p.id}>
                  {p.displayName} ({p.role === "admin" ? "Admin" : "Editor"})
                </option>
              ))}
        </select>
      </label>

      {/* Botones de acción */}
      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={isPending}
          className="btn bg-cyan px-4 text-midnight hover:bg-cyan-bright text-xs font-semibold whitespace-nowrap"
        >
          {isPending ? "Buscando..." : "Buscar"}
        </button>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleClear}
            className="inline-flex min-h-10 items-center gap-1.5 rounded-full border border-line px-3 text-xs text-fg-muted hover:border-sand hover:text-fg transition-colors whitespace-nowrap"
            title="Limpiar todos los filtros"
          >
            <X size={13} />
            Limpiar
          </button>
        )}
      </div>
    </form>
  );
}
