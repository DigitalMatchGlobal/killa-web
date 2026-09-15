export const TV_SECTIONS = [
  {
    name: "Noticias",
    slug: "noticias",
    subsections: ["Política", "Nacionales", "Internacionales", "Policiales", "Educación", "Salud", "Obras Públicas", "Institucionales", "Sociedad y Comunidad"],
  },
  {
    name: "Deportes",
    slug: "deportes",
    subsections: ["Fútbol", "Básquet", "Hockey", "Rugby", "Automovilismo", "Fórmula 1", "Mountain Bike", "Running", "Trail running"],
  },
  { name: "Turismo", slug: "turismo", subsections: [] },
  { name: "Economía", slug: "economia", subsections: [] },
  { name: "Cultura", slug: "cultura", subsections: [] },
  { name: "Tecnología", slug: "tecnologia", subsections: [] },
] as const;

export function subsectionsFor(sectionSlug: string): readonly string[] {
  return TV_SECTIONS.find((section) => section.slug === sectionSlug)?.subsections ?? [];
}

export function normalizeSubsection(value: string | null | undefined): string | null {
  const clean = value?.trim().replace(/\s+/g, " ") ?? "";
  return clean || null;
}
