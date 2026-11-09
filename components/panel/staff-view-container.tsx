"use client";

import { useState } from "react";
import { LayoutGrid, List, Search } from "lucide-react";

import type { StaffMemberWithStats } from "@/lib/editorial/admin-users";
import { StaffBentoCards } from "./staff-bento-cards";
import { StaffTable } from "./staff-table";
import { CreateStaffForm } from "./create-staff-form";

export function StaffViewContainer({
  members,
  currentUserId,
}: {
  members: StaffMemberWithStats[];
  currentUserId: string;
}) {
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [filterQuery, setFilterQuery] = useState("");

  const filteredMembers = members.filter((m) => {
    if (!filterQuery) return true;
    const q = filterQuery.toLowerCase();
    return (
      m.displayName.toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q) ||
      m.role.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Formulario de Alta */}
      <CreateStaffForm />

      {/* Barra de control: Buscador de integrantes + Selector de Vista */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-64">
            <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-fg-faint" />
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Buscar redactor o correo..."
              className="h-9 w-full rounded-full border border-line bg-midnight/50 pl-8 pr-3 text-xs text-fg placeholder:text-fg-faint focus:border-line-strong focus:outline-none transition-colors"
            />
          </div>
          <span className="text-xs text-fg-faint">
            ({filteredMembers.length} de {members.length})
          </span>
        </div>

        {/* Toggle de Vistas */}
        <div className="flex items-center gap-1 rounded-full border border-line bg-midnight/50 p-1 self-start sm:self-auto text-xs">
          <button
            type="button"
            onClick={() => setViewMode("table")}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 transition-colors ${
              viewMode === "table"
                ? "bg-fg/10 text-fg font-medium"
                : "text-fg-muted hover:text-fg"
            }`}
          >
            <List size={13} />
            <span>Tabla</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("cards")}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 transition-colors ${
              viewMode === "cards"
                ? "bg-fg/10 text-fg font-medium"
                : "text-fg-muted hover:text-fg"
            }`}
          >
            <LayoutGrid size={13} />
            <span>Fichas</span>
          </button>
        </div>
      </div>

      {/* Renderizado de la vista elegida */}
      {viewMode === "table" ? (
        <StaffTable members={filteredMembers} currentUserId={currentUserId} />
      ) : (
        <StaffBentoCards members={filteredMembers} currentUserId={currentUserId} />
      )}
    </div>
  );
}
