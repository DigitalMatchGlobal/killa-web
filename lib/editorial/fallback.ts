import { tvNews } from "@/lib/tv-news";

import type { Article } from "./types";

/**
 * Fallback de desarrollo.
 *
 * Mientras no haya variables de entorno de Supabase (`.env.local` sin
 * completar, un clone recién hecho, un preview sin secretos), el portal sigue
 * mostrando las tres notas que vivían hardcodeadas en `lib/tv-news.ts` en
 * lugar de romper. Es el "conservarse temporalmente como fallback" del brief.
 *
 * NO es un fallback de producción: si falta la configuración en el deployment
 * real, lo que corresponde es que se note. Por eso `queries.ts` avisa por
 * consola cada vez que cae acá.
 *
 * Cuando la integración dinámica esté validada contra el proyecto real, este
 * archivo y `lib/tv-news.ts` se borran juntos.
 */

const FALLBACK_DATES = [
  "2026-08-30T15:00:00.000Z",
  "2026-08-30T14:00:00.000Z",
  "2026-08-30T13:00:00.000Z",
];

export const fallbackArticles: Article[] = tvNews.map((item, index) => ({
  id: `fallback-${item.slug}`,
  title: item.title,
  slug: item.slug,
  excerpt: item.excerpt,
  body: item.body.join("\n\n"),
  category: { name: "Noticias", slug: "noticias" },
  featuredImageUrl: item.image,
  imageAlt: item.imageAlt,
  status: "published",
  priority: 1,
  isFeatured: index === 0,
  publishedAt: FALLBACK_DATES[index] ?? FALLBACK_DATES[0],
  createdAt: FALLBACK_DATES[index] ?? FALLBACK_DATES[0],
  updatedAt: FALLBACK_DATES[index] ?? FALLBACK_DATES[0],
}));
