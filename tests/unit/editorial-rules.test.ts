import { describe, expect, it } from "vitest";

import { compareEditorialRank, pickFeatured, pickLatest } from "@/lib/editorial/ranking";
import { sanitizeBody, sanitizeSingleLine, toParagraphs } from "@/lib/editorial/sanitize";
import {
  articleDraftSchema,
  publishableSchema,
  sniffImageMime,
} from "@/lib/editorial/validation";
import {
  bylineLabel,
  mapArticle,
  normalizeByline,
  resolveFeaturedImageUrl,
  type Article,
} from "@/lib/editorial/types";
import { fallbackArticles } from "@/lib/editorial/fallback";

/**
 * Reglas que no necesitan base: ranking de portada, saneamiento, validación de
 * publicación y firma de imagen. Las mismas reglas se verifican contra Postgres
 * real en `tests/rules/` — acá se prueba la lógica, allá que la base la
 * respalde.
 */

function article(overrides: Partial<Article> & { id: string }): Article {
  return {
    // `id` no se repite acá: el `...overrides` del final lo trae siempre (el
    // tipo lo exige) y declararlo dos veces es un TS2783.
    title: overrides.title ?? "Nota",
    slug: overrides.slug ?? overrides.id,
    excerpt: "",
    body: "",
    category: { name: "Noticias", slug: "noticias" },
    featuredImageUrl: "",
    imageAlt: "",
    status: overrides.status ?? "published",
    priority: overrides.priority ?? 1,
    isFeatured: overrides.isFeatured ?? false,
    byline: overrides.byline ?? null,
    publishedAt: overrides.publishedAt ?? "2026-08-30T12:00:00Z",
    createdAt: "2026-08-30T12:00:00Z",
    updatedAt: "2026-08-30T12:00:00Z",
    ...overrides,
  };
}

describe("portada: destacada manual y fecha", () => {
  it("la selección manual gana sobre una noticia más reciente", () => {
    const featured = pickFeatured([
      article({ id: "reciente", priority: 1, publishedAt: "2026-09-01T10:00:00Z" }),
      article({ id: "elegida", isFeatured: true, publishedAt: "2026-08-01T10:00:00Z" }),
    ]);

    expect(featured?.id).toBe("elegida");
  });

  it("si hubiera dos marcadas, gana la publicación más reciente", () => {
    const featured = pickFeatured([
      article({ id: "vieja", isFeatured: true, publishedAt: "2026-08-01T10:00:00Z" }),
      article({ id: "nueva", isFeatured: true, publishedAt: "2026-09-01T10:00:00Z" }),
    ]);

    expect(featured?.id).toBe("nueva");
  });

  it("sin prioridades especiales aparece la más reciente", () => {
    const featured = pickFeatured([
      article({ id: "a", publishedAt: "2026-07-01T10:00:00Z" }),
      article({ id: "b", publishedAt: "2026-09-02T10:00:00Z" }),
      article({ id: "c", publishedAt: "2026-08-15T10:00:00Z" }),
    ]);

    expect(featured?.id).toBe("b");
  });

  it("ignora borradores y archivadas", () => {
    const featured = pickFeatured([
      article({ id: "borrador", status: "draft", isFeatured: true }),
      article({ id: "archivada", status: "archived", isFeatured: true }),
      article({ id: "publicada", status: "published", priority: 1 }),
    ]);

    expect(featured?.id).toBe("publicada");
  });

  it("sin nada publicado no hay destacada", () => {
    expect(pickFeatured([article({ id: "x", status: "draft" })])).toBeNull();
  });

  it("el orden es estable con fechas y prioridades idénticas", () => {
    const a = article({ id: "aaa" });
    const b = article({ id: "bbb" });
    expect(compareEditorialRank(a, b)).toBeLessThan(0);
    expect(compareEditorialRank(b, a)).toBeGreaterThan(0);
  });
});

describe("últimas publicaciones", () => {
  it("van en orden cronológico descendente y sin la destacada", () => {
    const all = [
      article({ id: "vieja", publishedAt: "2026-07-01T10:00:00Z" }),
      article({ id: "destacada", isFeatured: true, publishedAt: "2026-06-01T10:00:00Z" }),
      article({ id: "nueva", publishedAt: "2026-09-01T10:00:00Z" }),
      article({ id: "media", publishedAt: "2026-08-01T10:00:00Z" }),
    ];

    const featured = pickFeatured(all);
    expect(featured?.id).toBe("destacada");

    const latest = pickLatest(all, { excludeId: featured?.id });
    expect(latest.map((item) => item.id)).toEqual(["nueva", "media", "vieja"]);
  });

  it("respeta el límite", () => {
    const all = [
      article({ id: "1", publishedAt: "2026-09-03T10:00:00Z" }),
      article({ id: "2", publishedAt: "2026-09-02T10:00:00Z" }),
      article({ id: "3", publishedAt: "2026-09-01T10:00:00Z" }),
    ];

    expect(pickLatest(all, { limit: 2 }).map((item) => item.id)).toEqual(["1", "2"]);
  });
});

describe("saneamiento del contenido", () => {
  it("saca etiquetas y scripts del cuerpo", () => {
    const dirty = 'Hola <script>alert("xss")</script>mundo<img src=x onerror=alert(1)>';
    const clean = sanitizeBody(dirty);

    expect(clean).not.toContain("<");
    expect(clean).not.toContain("script");
    expect(clean).toContain("Hola");
    expect(clean).toContain("mundo");
  });

  it("el título queda en una sola línea", () => {
    expect(sanitizeSingleLine("Un\ntítulo   partido\t\ten líneas")).toBe(
      "Un título partido en líneas",
    );
  });

  it("conserva los párrafos del cuerpo y colapsa las líneas de más", () => {
    const body = sanitizeBody("Primero\n\n\n\nSegundo\nsigue el segundo");
    expect(toParagraphs(body)).toEqual(["Primero", "Segundo sigue el segundo"]);
  });
});

describe("requisitos para publicar", () => {
  const base = {
    title: "Killa suma una nueva localidad a la red",
    excerpt: "El despliegue llega a una localidad más del Valle Calchaquí.",
    body: "Cuerpo de la nota. ".repeat(12),
    categoryId: null,
    imageAlt: "Antena de Killa en el cerro",
    featuredImagePath: "2026/09/foto.jpg",
    priority: 3,
    isFeatured: false,
    slug: null,
  };

  it("un borrador puede estar incompleto", () => {
    const result = articleDraftSchema.safeParse({
      ...base,
      excerpt: "",
      body: "",
      imageAlt: "",
      featuredImagePath: "",
    });
    expect(result.success).toBe(true);
  });

  it("publicar sin imagen se rechaza", () => {
    const result = publishableSchema.safeParse({ ...base, featuredImagePath: "" });
    expect(result.success).toBe(false);
  });

  it("publicar sin texto alternativo se rechaza", () => {
    const result = publishableSchema.safeParse({ ...base, imageAlt: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toMatch(/alternativo/i);
    }
  });

  it("con imagen, alt y contenido, publica", () => {
    expect(publishableSchema.safeParse(base).success).toBe(true);
  });

  it("la prioridad fuera de 1..5 se rechaza", () => {
    expect(articleDraftSchema.safeParse({ ...base, priority: 9 }).success).toBe(false);
    expect(articleDraftSchema.safeParse({ ...base, priority: 0 }).success).toBe(false);
  });

  it("el título sanea el HTML antes de medir el largo", () => {
    const result = articleDraftSchema.safeParse({ ...base, title: "<b>xx</b>" });
    // "xx" tiene 2 caracteres: no alcanza el mínimo aunque el string crudo sí.
    expect(result.success).toBe(false);
  });
});

describe("firma real de la imagen", () => {
  it("reconoce JPEG, PNG y WebP", () => {
    expect(sniffImageMime(new Uint8Array([0xff, 0xd8, 0xff, 0, 0, 0, 0, 0, 0, 0, 0, 0]))).toBe(
      "image/jpeg",
    );
    expect(
      sniffImageMime(
        new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0]),
      ),
    ).toBe("image/png");
    expect(
      sniffImageMime(
        new Uint8Array([
          ...new TextEncoder().encode("RIFF"),
          0,
          0,
          0,
          0,
          ...new TextEncoder().encode("WEBP"),
        ]),
      ),
    ).toBe("image/webp");
  });

  it("rechaza un HTML disfrazado de imagen", () => {
    const html = new TextEncoder().encode("<html><script>alert(1)</script>");
    expect(sniffImageMime(html)).toBeNull();
  });

  it("rechaza un archivo demasiado corto", () => {
    expect(sniffImageMime(new Uint8Array([0xff, 0xd8]))).toBeNull();
  });
});

describe("URL de la imagen destacada", () => {
  const origin = "https://proyecto.supabase.co";

  it("una key del bucket se resuelve a la URL pública", () => {
    expect(resolveFeaturedImageUrl("2026/09/foto.jpg", origin)).toBe(
      `${origin}/storage/v1/object/public/killa-news/2026/09/foto.jpg`,
    );
  });

  it("un asset del repo se deja tal cual", () => {
    expect(resolveFeaturedImageUrl("/news/alcance-regional.jpg", origin)).toBe(
      "/news/alcance-regional.jpg",
    );
  });

  it("sin imagen devuelve cadena vacía", () => {
    expect(resolveFeaturedImageUrl(null, origin)).toBe("");
  });
});

describe("mapeo al contrato público", () => {
  it("una nota sin categoría no inventa una sección", () => {
    const mapped = mapArticle(
      {
        id: "1",
        title: "T",
        slug: "t",
        excerpt: null,
        body: null,
        category_id: null,
        featured_image_path: null,
        image_alt: null,
        status: "published",
        priority: 2,
        is_featured: false,
        author_id: null,
        updated_by: null,
        published_at: "2026-09-01T10:00:00Z",
        created_at: "2026-09-01T10:00:00Z",
        updated_at: "2026-09-01T10:00:00Z",
        category: null,
      },
      "https://proyecto.supabase.co",
    );

    expect(mapped.category).toEqual({ name: "Sin sección", slug: "sin-seccion" });
    expect(mapped.excerpt).toBe("");
    expect(mapped.priority).toBe(2);
  });

  it("acepta el embed como array (lo que infiere supabase-js sin tipos generados)", () => {
    const mapped = mapArticle(
      {
        id: "1",
        title: "T",
        slug: "t",
        excerpt: "e",
        body: "b",
        category_id: "c1",
        featured_image_path: null,
        image_alt: null,
        status: "published",
        priority: 1,
        is_featured: false,
        author_id: null,
        updated_by: null,
        published_at: null,
        created_at: "2026-09-01T10:00:00Z",
        updated_at: "2026-09-01T10:00:00Z",
        category: [{ name: "Deportes", slug: "deportes" }],
      },
      "https://proyecto.supabase.co",
    );

    expect(mapped.category.slug).toBe("deportes");
  });
});

describe("firma editorial (byline)", () => {
  /**
   * La firma es contenido, no auditoría: `author_id`/`updated_by` no la
   * alimentan ni le sirven de fallback. Estas pruebas fijan la regla de que la
   * presencia del texto es lo único que decide si se muestra — no hay flag.
   */

  const base = {
    title: "Killa suma una nueva localidad a la red",
    excerpt: "El despliegue llega a una localidad más del Valle Calchaquí.",
    body: "Cuerpo de la nota. ".repeat(12),
    categoryId: null,
    imageAlt: "Antena de Killa en el cerro",
    featuredImagePath: "2026/09/foto.jpg",
    priority: 3,
    isFeatured: false,
    slug: null,
  };

  it("normaliza: recorta los espacios de los extremos", () => {
    expect(normalizeByline("   Nicolás Cardozo   ")).toBe("Nicolás Cardozo");
  });

  it("normaliza: vacío, espacios y null son todos null", () => {
    expect(normalizeByline("")).toBeNull();
    expect(normalizeByline("     ")).toBeNull();
    expect(normalizeByline("\t\n  ")).toBeNull();
    expect(normalizeByline(null)).toBeNull();
    expect(normalizeByline(undefined)).toBeNull();
  });

  it("la etiqueta pública es «Por <nombre>», o null sin firma", () => {
    expect(bylineLabel("Nicolás Cardozo")).toBe("Por Nicolás Cardozo");
    expect(bylineLabel("Redacción Killa TV")).toBe("Por Redacción Killa TV");
    expect(bylineLabel("   ")).toBeNull();
    expect(bylineLabel(null)).toBeNull();
    // Sin firma NO devuelve "Por " ni una cadena vacía: devuelve null, así el
    // componente puede no renderizar nada en vez de dejar un hueco.
    expect(bylineLabel("")).not.toBe("Por ");
  });

  it("validación: acepta una firma normal", () => {
    const r = articleDraftSchema.safeParse({ ...base, byline: "Nicolás Cardozo" });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.byline).toBe("Nicolás Cardozo");
  });

  it("validación: sin firma queda null (no cadena vacía)", () => {
    for (const entrada of ["", "   ", null, undefined]) {
      const r = articleDraftSchema.safeParse({ ...base, byline: entrada });
      expect(r.success).toBe(true);
      if (r.success) expect(r.data.byline).toBeNull();
    }
  });

  it("validación: recorta antes de guardar", () => {
    const r = articleDraftSchema.safeParse({ ...base, byline: "  Redacción Killa TV  " });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.byline).toBe("Redacción Killa TV");
  });

  it("validación: rechaza más de 100 caracteres", () => {
    const r = articleDraftSchema.safeParse({ ...base, byline: "x".repeat(101) });
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.issues[0]?.message).toMatch(/100/);
  });

  it("validación: 100 exactos entran, y el recorte no cuenta los espacios", () => {
    expect(articleDraftSchema.safeParse({ ...base, byline: "y".repeat(100) }).success).toBe(true);
    expect(
      articleDraftSchema.safeParse({ ...base, byline: `   ${"z".repeat(100)}   ` }).success,
    ).toBe(true);
  });

  it("validación: se sanea el HTML pegado, como el resto de los campos de una línea", () => {
    const r = articleDraftSchema.safeParse({ ...base, byline: "<b>Redacción</b>" });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.byline).toBe("Redacción");
  });

  it("mapArticle expone byline y lo normaliza; no lo deriva del autor", () => {
    const fila = {
      id: "1",
      title: "T",
      slug: "t",
      excerpt: "e",
      body: "b",
      category_id: null,
      featured_image_path: null,
      image_alt: null,
      status: "published",
      priority: 1,
      is_featured: false,
      published_at: "2026-09-01T10:00:00Z",
      created_at: "2026-09-01T10:00:00Z",
      updated_at: "2026-09-01T10:00:00Z",
      category: null,
    };

    expect(mapArticle({ ...fila, byline: "  Redacción Killa TV " }, "").byline).toBe(
      "Redacción Killa TV",
    );
    expect(mapArticle({ ...fila, byline: "   " }, "").byline).toBeNull();
    expect(mapArticle({ ...fila, byline: null }, "").byline).toBeNull();

    // Aunque la fila traiga auditoría y hasta el nombre del perfil, la firma
    // sigue siendo null: no hay fallback desde el autor.
    const conAutor = mapArticle(
      { ...fila, byline: null, author_id: "uuid-de-alguien", author: { display_name: "ncardozo" } },
      "",
    );
    expect(conAutor.byline).toBeNull();
  });

  it("el contenido migrado del fallback no tiene firma inventada", () => {
    for (const article of fallbackArticles) {
      expect(article.byline).toBeNull();
    }
  });
});
