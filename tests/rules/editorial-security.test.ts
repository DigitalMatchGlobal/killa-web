import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

/**
 * Reglas críticas contra un Supabase REAL (el stack local).
 *
 * POR QUÉ EXISTEN ADEMÁS DE LOS UNITARIOS
 * Los unitarios prueban que nuestra lógica esté bien. No pueden probar que las
 * **RLS** hagan lo que asumimos: eso sólo se verifica hablándole a un Postgres
 * con las policies aplicadas. Es la diferencia entre "el código filtra los
 * borradores" y "un borrador no puede salir de la base ni con la consulta
 * equivocada".
 *
 * GUARDARRAÍL: si la URL no es local, el suite aborta. Estos tests escriben.
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

const isLocal = /^https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?$/.test(SUPABASE_URL);
if (!isLocal) {
  throw new Error(
    `Estos tests escriben datos y sólo corren contra el stack local. URL recibida: "${SUPABASE_URL}". Usá \`npm run test:rules\`.`,
  );
}

const PASSWORD = "killa-tests-2026";
const emails = {
  editor: `editor.${Date.now()}@killa.test`,
  admin: `admin.${Date.now()}@killa.test`,
  outsider: `random.${Date.now()}@killa.test`,
};

/** Cliente con clave de servicio: sólo para preparar y limpiar el escenario. */
const service = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const anon = createClient(SUPABASE_URL, ANON_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

let editor: SupabaseClient;
let admin: SupabaseClient;
let outsider: SupabaseClient;
let editorUserId = "";
let adminUserId = "";
let outsiderUserId = "";
const createdArticleIds: string[] = [];
const createdCategoryIds: string[] = [];

async function signedInClient(email: string) {
  const client = createClient(SUPABASE_URL, ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { error } = await client.auth.signInWithPassword({ email, password: PASSWORD });
  if (error) throw new Error(`No se pudo iniciar sesión con ${email}: ${error.message}`);
  return client;
}

async function createUser(email: string, meta?: Record<string, unknown>) {
  const { data, error } = await service.auth.admin.createUser({
    email,
    password: PASSWORD,
    email_confirm: true,
    user_metadata: meta,
  });
  if (error) throw new Error(`No se pudo crear ${email}: ${error.message}`);
  return data.user.id;
}

/** Nota de prueba, creada con service_role para no depender de las policies. */
async function seedArticle(overrides: Record<string, unknown> = {}) {
  const stamp = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const { data, error } = await service
    .from("articles")
    .insert({
      title: `Nota de prueba ${stamp}`,
      slug: `nota-de-prueba-${stamp}`,
      excerpt: "Bajada de prueba con largo suficiente para publicar.",
      body: "Cuerpo de prueba. ".repeat(15),
      featured_image_path: "2026/09/prueba.jpg",
      image_alt: "Imagen de prueba del test",
      status: "draft",
      priority: 1,
      ...overrides,
    })
    .select("id, slug, status, published_at, priority, is_featured")
    .single();

  if (error) throw new Error(`No se pudo sembrar la nota: ${error.message}`);
  createdArticleIds.push(data.id as string);
  return data as {
    id: string;
    slug: string;
    status: string;
    published_at: string | null;
    priority: number;
    is_featured: boolean;
  };
}

/** Categoría desechable, para los tests que necesitan borrar una. */
async function seedCategory() {
  const stamp = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const { data, error } = await service
    .from("categories")
    .insert({ name: `Prueba ${stamp}`, slug: `prueba-${stamp}` })
    .select("id, slug")
    .single();

  if (error) throw new Error(`No se pudo sembrar la categoría: ${error.message}`);
  createdCategoryIds.push(data.id as string);
  return data as { id: string; slug: string };
}

beforeAll(async () => {
  editorUserId = await createUser(emails.editor, { display_name: "Editora de prueba" });
  adminUserId = await createUser(emails.admin, { display_name: "Admin de prueba" });
  outsiderUserId = await createUser(emails.outsider, { display_name: "Sin acceso" });

  // El admin se promueve con un UPDATE explícito, que es exactamente el
  // procedimiento previsto desde la migración 20260904160000. Pasarle
  // `role: "admin"` en la metadata del alta ya NO hace nada.
  const promote = await service
    .from("profiles")
    .update({ role: "admin" })
    .eq("id", adminUserId)
    .select("role")
    .single();
  if (promote.error) throw new Error(`No se pudo promover al admin: ${promote.error.message}`);
  if (promote.data?.role !== "admin") throw new Error("el fixture de admin no quedó admin");

  // Un usuario de Auth sin perfil editorial: es el caso "se registró por otro
  // lado / le revocaron el acceso". Debe poder leer lo publicado y nada más.
  await service.from("profiles").delete().eq("id", outsiderUserId);

  editor = await signedInClient(emails.editor);
  admin = await signedInClient(emails.admin);
  outsider = await signedInClient(emails.outsider);
});

afterAll(async () => {
  if (createdArticleIds.length > 0) {
    await service.from("articles").delete().in("id", createdArticleIds);
  }
  if (createdCategoryIds.length > 0) {
    await service.from("categories").delete().in("id", createdCategoryIds);
  }
  for (const email of Object.values(emails)) {
    const { data } = await service.auth.admin.listUsers();
    const user = data?.users.find((candidate) => candidate.email === email);
    if (user) await service.auth.admin.deleteUser(user.id);
  }
});

// ---------------------------------------------------------------------------

describe("criterio 1: sin sesión no se modifica contenido", () => {
  it("anon no puede insertar una nota", async () => {
    const { error } = await anon.from("articles").insert({
      title: "Nota intrusa desde el anonimato",
      slug: "nota-intrusa",
    });
    expect(error).not.toBeNull();
  });

  it("anon no puede publicar una nota existente", async () => {
    const draft = await seedArticle();
    const { error, data } = await anon
      .from("articles")
      .update({ status: "published" })
      .eq("id", draft.id)
      .select("id");

    // RLS puede responder con error o con cero filas afectadas: lo que importa
    // es que la nota no cambie de estado.
    expect(error !== null || (data ?? []).length === 0).toBe(true);

    const { data: after } = await service
      .from("articles")
      .select("status")
      .eq("id", draft.id)
      .single();
    expect(after?.status).toBe("draft");
  });

  it("nadie puede borrar una nota: la baja es archivar", async () => {
    const draft = await seedArticle();

    for (const [label, client] of [
      ["anon", anon],
      ["editor", editor],
    ] as const) {
      await client.from("articles").delete().eq("id", draft.id);
      const { data } = await service.from("articles").select("id").eq("id", draft.id);
      expect(data?.length, `${label} logró borrar la nota`).toBe(1);
    }
  });

  it("no hay registro público: nadie se puede dar de alta solo", async () => {
    // Es la otra mitad de la defensa del panel. El trigger le pone rol
    // `editor` a todo usuario nuevo, así que si el registro estuviera abierto
    // cualquiera se convertiría en editor. Lo apaga
    // `auth.enable_signup = false` en supabase/config.toml.
    const { error } = await anon.auth.signUp({
      email: `intruso.${Date.now()}@killa.test`,
      password: PASSWORD,
    });

    expect(error).not.toBeNull();
  });

  it("un usuario autenticado sin perfil editorial no puede escribir", async () => {
    const { error } = await outsider.from("articles").insert({
      title: "Nota de alguien sin permisos",
      slug: "nota-sin-permisos",
    });
    expect(error).not.toBeNull();
  });
});

describe("criterio 2: el público sólo ve lo publicado", () => {
  it("un borrador no sale por la clave anónima", async () => {
    const draft = await seedArticle();
    const { data } = await anon.from("articles").select("id").eq("id", draft.id);
    expect(data).toEqual([]);
  });

  it("una nota archivada tampoco", async () => {
    const archived = await seedArticle({
      status: "published",
      published_at: new Date().toISOString(),
    });
    await service.from("articles").update({ status: "archived" }).eq("id", archived.id);

    const { data } = await anon.from("articles").select("id").eq("id", archived.id);
    expect(data).toEqual([]);
  });

  it("una publicada sí, y la fila sigue existiendo tras archivarla", async () => {
    const published = await seedArticle({
      status: "published",
      published_at: new Date().toISOString(),
    });

    const visible = await anon.from("articles").select("id").eq("id", published.id);
    expect(visible.data?.length).toBe(1);

    await service.from("articles").update({ status: "archived" }).eq("id", published.id);
    const { data: still } = await service.from("articles").select("id").eq("id", published.id);
    expect(still?.length).toBe(1);
  });

  it("un usuario sin perfil editorial ve lo mismo que el público", async () => {
    const draft = await seedArticle();
    const { data } = await outsider.from("articles").select("id").eq("id", draft.id);
    expect(data).toEqual([]);
  });
});

describe("criterio 3: el editor recorre el ciclo completo", () => {
  it("crea borrador, edita, publica y archiva", async () => {
    const stamp = Date.now();

    const created = await editor
      .from("articles")
      .insert({
        title: `Nota del editor ${stamp}`,
        slug: `nota-del-editor-${stamp}`,
        excerpt: "Una bajada con largo suficiente para pasar la validación.",
        body: "Texto de la nota. ".repeat(15),
        featured_image_path: "2026/09/editor.jpg",
        image_alt: "Foto cargada por la editora",
      })
      .select("id, status, published_at, author_id")
      .single();

    expect(created.error).toBeNull();
    const id = created.data!.id as string;
    createdArticleIds.push(id);

    // Nace borrador y sin fecha de publicación.
    expect(created.data!.status).toBe("draft");
    expect(created.data!.published_at).toBeNull();
    // El autor se registra solo, desde la sesión.
    expect(created.data!.author_id).toBe(editorUserId);

    // Edita.
    const edited = await editor
      .from("articles")
      .update({ title: `Nota del editor ${stamp} (corregida)` })
      .eq("id", id)
      .select("title, updated_by")
      .single();
    expect(edited.error).toBeNull();
    expect(edited.data!.title).toContain("corregida");
    expect(edited.data!.updated_by).toBe(editorUserId);

    // Publica: la base pone published_at.
    const published = await editor
      .from("articles")
      .update({ status: "published" })
      .eq("id", id)
      .select("status, published_at")
      .single();
    expect(published.error).toBeNull();
    expect(published.data!.status).toBe("published");
    expect(published.data!.published_at).not.toBeNull();

    const firstPublishedAt = published.data!.published_at as string;

    // Archiva y vuelve a publicar: conserva la fecha original.
    await editor.from("articles").update({ status: "archived" }).eq("id", id);
    const republished = await editor
      .from("articles")
      .update({ status: "published" })
      .eq("id", id)
      .select("published_at")
      .single();
    expect(republished.data!.published_at).toBe(firstPublishedAt);
  });

  it("no se puede publicar sin imagen ni texto alternativo", async () => {
    const incomplete = await seedArticle({ featured_image_path: null, image_alt: null });

    const { error } = await editor
      .from("articles")
      .update({ status: "published" })
      .eq("id", incomplete.id);

    expect(error).not.toBeNull();
    expect(error?.message.toLowerCase()).toContain("articles_published_needs_image");
  });

  it("los slugs se normalizan y no se repiten", async () => {
    const first = await editor
      .from("articles")
      .insert({ title: "Ñandú en Cafayate: crónica de un día ÚNICO" })
      .select("id, slug")
      .single();
    const second = await editor
      .from("articles")
      .insert({ title: "Ñandú en Cafayate: crónica de un día ÚNICO" })
      .select("id, slug")
      .single();

    createdArticleIds.push(first.data!.id as string, second.data!.id as string);

    expect(first.data!.slug).toBe("nandu-en-cafayate-cronica-de-un-dia-unico");
    expect(second.data!.slug).toBe("nandu-en-cafayate-cronica-de-un-dia-unico-2");
  });

  it("la prioridad fuera de 1..5 la rechaza la base", async () => {
    const { error } = await editor
      .from("articles")
      .insert({ title: "Nota con prioridad inválida", priority: 9 });
    expect(error).not.toBeNull();
  });
});

describe("criterios 5 y 6: portada y orden cronológico, resueltos en SQL", () => {
  it("la destacada es manual y las últimas siguen orden cronológico", async () => {
    // Escenario aislado: se archiva todo lo demás para que la selección sea
    // observable sin depender del seed.
    const { data: preexisting } = await service
      .from("articles")
      .select("id")
      .eq("status", "published");
    const parked = (preexisting ?? []).map((row) => row.id as string);
    if (parked.length > 0) {
      await service.from("articles").update({ status: "archived" }).in("id", parked);
    }

    const vieja = await seedArticle({
      status: "published",
      priority: 1,
      published_at: "2026-08-01T10:00:00Z",
    });
    const reciente = await seedArticle({
      status: "published",
      priority: 1,
      published_at: "2026-09-01T10:00:00Z",
    });
    const elegida = await seedArticle({
      status: "published",
      priority: 4,
      published_at: "2026-07-01T10:00:00Z",
      is_featured: true,
    });
    const importante = await seedArticle({
      status: "published",
      priority: 5,
      published_at: "2026-07-15T10:00:00Z",
    });

    // Exactamente la consulta de getFeaturedArticle().
    const featured = await anon
      .from("articles")
      .select("id")
      .eq("status", "published")
      .eq("is_featured", true)
      .order("published_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    expect(featured.data?.id).toBe(elegida.id);

    // Y la de getLatestArticles(), excluyendo la destacada.
    const latest = await anon
      .from("articles")
      .select("id")
      .eq("status", "published")
      .neq("id", elegida.id)
      .order("published_at", { ascending: false });

    expect(latest.data?.map((row) => row.id)).toEqual([
      reciente.id,
      vieja.id,
      importante.id,
    ]);

    // Devolver el escenario a como estaba.
    if (parked.length > 0) {
      await service.from("articles").update({ status: "published" }).in("id", parked);
    }
  });

  it("marcar una nueva destacada desmarca la anterior", async () => {
    const primera = await seedArticle({ is_featured: true });
    const segunda = await seedArticle({ is_featured: true });

    const { data, error } = await service
      .from("articles")
      .select("id, is_featured")
      .in("id", [primera.id, segunda.id]);

    expect(error).toBeNull();
    expect(data?.find((row) => row.id === primera.id)?.is_featured).toBe(false);
    expect(data?.find((row) => row.id === segunda.id)?.is_featured).toBe(true);
  });

  it("nunca deja dos destacadas ante escrituras concurrentes", async () => {
    const primera = await seedArticle();
    const segunda = await seedArticle();

    const [resultadoA, resultadoB] = await Promise.all([
      service.from("articles").update({ is_featured: true }).eq("id", primera.id),
      service.from("articles").update({ is_featured: true }).eq("id", segunda.id),
    ]);

    const { data, error } = await service
      .from("articles")
      .select("id")
      .eq("is_featured", true);

    expect(error).toBeNull();
    expect(data).toHaveLength(1);
    // Bajo carrera, el índice puede hacer fallar una transacción o el trigger
    // puede serializar el resultado. En ambos casos el invariante es uno solo.
    const failedWrites = [resultadoA.error, resultadoB.error].filter(Boolean);
    expect(failedWrites.length).toBeLessThanOrEqual(1);
  });
});

describe("filtro por categoría y paginación", () => {
  it("el inner join filtra de verdad y el conteo sirve para paginar", async () => {
    const { data: categories } = await service.from("categories").select("id, slug");
    const noticias = categories?.find((row) => row.slug === "noticias");
    const deportes = categories?.find((row) => row.slug === "deportes");
    expect(noticias, "falta la categoría Noticias del seed").toBeDefined();
    expect(deportes, "falta la categoría Deportes del seed").toBeDefined();

    const enDeportes = await seedArticle({
      category_id: deportes!.id,
      status: "published",
      published_at: "2026-09-02T10:00:00Z",
    });
    await seedArticle({
      category_id: noticias!.id,
      status: "published",
      published_at: "2026-09-03T10:00:00Z",
    });
    // Sin sección: no debe aparecer en ninguna categoría.
    await seedArticle({
      category_id: null,
      status: "published",
      published_at: "2026-09-04T10:00:00Z",
    });

    // Exactamente la consulta de getArticlesByCategory(): sin `!inner` este
    // filtro NO descartaría filas, sólo dejaría `category` en null.
    const { data, count, error } = await anon
      .from("articles")
      .select("id, category:categories!inner ( slug )", { count: "exact" })
      .eq("status", "published")
      .eq("category.slug", "deportes")
      .order("published_at", { ascending: false })
      .range(0, 8);

    expect(error).toBeNull();
    expect(data?.map((row) => row.id)).toEqual([enDeportes.id]);
    expect(count).toBe(1);
  });

  it("el rango devuelve una página y el conteo total sigue siendo el completo", async () => {
    const { data, count } = await anon
      .from("articles")
      .select("id", { count: "exact" })
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .range(0, 1);

    expect(data?.length).toBeLessThanOrEqual(2);
    expect(count ?? 0).toBeGreaterThanOrEqual(3);
  });
});

describe("criterio 4: imágenes", () => {
  const BUCKET = "killa-news";
  // JPEG mínimo válido (firma + fin de imagen).
  const jpeg = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0xff, 0xd9]);

  it("el bucket sólo admite JPEG, PNG y WebP, hasta 3 MB", async () => {
    // Se consulta por la API de storage y no por PostgREST: `storage.buckets`
    // no está expuesta, y esta es además la vía que usa la app.
    const listed = await service.storage.listBuckets();
    const bucket = listed.data?.find((candidate) => candidate.id === BUCKET);

    expect(bucket, "el bucket killa-news no existe").toBeDefined();

    // La API de storage responde en snake_case; los tipos de supabase-js
    // prometen camelCase. Se aceptan las dos formas para no atarse a eso.
    const raw = bucket as unknown as {
      public: boolean;
      file_size_limit?: number;
      fileSizeLimit?: number;
      allowed_mime_types?: string[];
      allowedMimeTypes?: string[];
    };

    expect(raw.allowed_mime_types ?? raw.allowedMimeTypes).toEqual([
      "image/jpeg",
      "image/png",
      "image/webp",
    ]);
    expect(raw.file_size_limit ?? raw.fileSizeLimit).toBe(3145728);
    // Lectura pública a propósito: las vistas previas sociales piden la imagen
    // sin sesión (ver la cabecera de la migración de storage).
    expect(raw.public).toBe(true);
  });

  it("un editor puede subir una imagen válida", async () => {
    const path = `tests/${Date.now()}-ok.jpg`;
    const { error } = await editor.storage
      .from(BUCKET)
      .upload(path, jpeg, { contentType: "image/jpeg" });

    expect(error).toBeNull();
    await service.storage.from(BUCKET).remove([path]);
  });

  it("el bucket rechaza un tipo no admitido", async () => {
    const path = `tests/${Date.now()}-malo.svg`;
    const { error } = await editor.storage
      .from(BUCKET)
      .upload(path, new Uint8Array([0x3c, 0x73, 0x76, 0x67]), {
        contentType: "image/svg+xml",
      });

    expect(error).not.toBeNull();
  });

  it("anon no puede subir nada", async () => {
    const { error } = await anon.storage
      .from(BUCKET)
      .upload(`tests/${Date.now()}-anon.jpg`, jpeg, { contentType: "image/jpeg" });

    expect(error).not.toBeNull();
  });

  it("article_image_in_use protege una imagen referenciada", async () => {
    const path = `tests/${Date.now()}-en-uso.jpg`;
    const article = await seedArticle({ featured_image_path: path });

    const inUse = await editor.rpc("article_image_in_use", { image_path: path });
    expect(inUse.error).toBeNull();
    expect(inUse.data).toBe(true);

    // Al archivar sigue en uso: una archivada puede volver a publicarse.
    await service.from("articles").update({ status: "archived" }).eq("id", article.id);
    const stillInUse = await editor.rpc("article_image_in_use", { image_path: path });
    expect(stillInUse.data).toBe(true);

    // Y una key que nadie referencia queda libre.
    const free = await editor.rpc("article_image_in_use", {
      image_path: "tests/imagen-que-nadie-usa.jpg",
    });
    expect(free.data).toBe(false);
  });
});

describe("perfiles: el rol no se auto-asigna", () => {
  it("una editora no puede convertirse en admin", async () => {
    await editor.from("profiles").update({ role: "admin" }).eq("id", editorUserId);

    const { data } = await service
      .from("profiles")
      .select("role")
      .eq("id", editorUserId)
      .single();
    expect(data?.role).toBe("editor");
  });

  it("el alta de un usuario crea su perfil con rol editor", async () => {
    const email = `nuevo.${Date.now()}@killa.test`;
    const id = await createUser(email, { display_name: "Nuevo" });

    const { data } = await service.from("profiles").select("role, display_name").eq("id", id).single();
    expect(data?.role).toBe("editor");
    expect(data?.display_name).toBe("Nuevo");

    await service.auth.admin.deleteUser(id);
  });
});

describe("el rol admin NO se auto-asigna por metadata (migración 20260904160000)", () => {
  /**
   * `raw_user_meta_data` es metadata del usuario, no una fuente de autoridad.
   * Antes el trigger la leía: un alta con `role: "admin"` en el JSON creaba un
   * perfil admin. Si alguna vez se reabre el registro público —y el proyecto
   * real venía con `disable_signup: false` de fábrica— eso pone el privilegio
   * más alto del sistema a un JSON de distancia de cualquiera.
   *
   * Ahora el trigger ignora ese campo. La promoción es un UPDATE explícito.
   */

  let colado: SupabaseClient;
  let coladoId = "";
  const coladoEmail = `colado.${Date.now()}@killa.test`;

  beforeAll(async () => {
    // Alta pidiendo ser admin por la puerta de atrás.
    coladoId = await createUser(coladoEmail, {
      display_name: "Se anotó como admin",
      role: "admin",
    });
    colado = await signedInClient(coladoEmail);
  });

  afterAll(async () => {
    await service.auth.admin.deleteUser(coladoId);
  });

  it("el perfil queda como editor, no como admin", async () => {
    const { data, error } = await service
      .from("profiles")
      .select("role, display_name")
      .eq("id", coladoId)
      .single();

    expect(error).toBeNull();
    expect(data?.role).toBe("editor");
    // El nombre para mostrar sí se toma de la metadata: es un nombre, no un permiso.
    expect(data?.display_name).toBe("Se anotó como admin");
  });

  it("la función del trigger tampoco quedó admin para el propio usuario", async () => {
    // `editorial_role()` es lo que leen las policies. Si devolviera 'admin',
    // el perfil diría una cosa y la autorización otra.
    const { data, error } = await colado.rpc("editorial_role");
    expect(error).toBeNull();
    expect(data).toBe("editor");

    const esAdmin = await colado.rpc("is_editorial_admin");
    expect(esAdmin.data).toBe(false);
  });

  it("no puede borrar una categoría (operación exclusiva de admin)", async () => {
    const categoria = await seedCategory();

    await colado.from("categories").delete().eq("id", categoria.id);

    const { data } = await service.from("categories").select("id").eq("id", categoria.id);
    expect(data?.length, "el colado logró borrar una categoría").toBe(1);
  });

  it("no puede cambiarle el rol a otra persona", async () => {
    await colado.from("profiles").update({ role: "admin" }).eq("id", editorUserId);

    const { data } = await service
      .from("profiles")
      .select("role")
      .eq("id", editorUserId)
      .single();
    expect(data?.role).toBe("editor");
  });

  it("tampoco puede promoverse a sí mismo", async () => {
    await colado.from("profiles").update({ role: "admin" }).eq("id", coladoId);

    const { data } = await service.from("profiles").select("role").eq("id", coladoId).single();
    expect(data?.role).toBe("editor");
  });

  it("pero sí puede hacer el trabajo de editor: crear un borrador", async () => {
    // La contracara: el usuario no está roto ni bloqueado, sólo no es admin.
    const { data, error } = await colado
      .from("articles")
      .insert({ title: "Nota escrita por quien pidió ser admin" })
      .select("id, status")
      .single();

    expect(error).toBeNull();
    expect(data?.status).toBe("draft");
    if (data?.id) createdArticleIds.push(data.id as string);
  });

  it("control: un admin promovido de verdad SÍ puede borrar una categoría", async () => {
    // Si esto fallara, los tests de arriba no probarían nada: podrían estar
    // pasando porque la operación es imposible para todos.
    const categoria = await seedCategory();

    const { error } = await admin.from("categories").delete().eq("id", categoria.id);
    expect(error).toBeNull();

    const { data } = await service.from("categories").select("id").eq("id", categoria.id);
    expect(data).toEqual([]);
  });
});

describe("privilegios de tabla: la RLS no es la única pata", () => {
  /**
   * POR QUÉ ESTE BLOQUE EXISTE
   * Los privilegios por defecto de un proyecto Supabase NO son iguales en todas
   * partes. El stack local de la CLI deja a `anon` sin nada; el proyecto real de
   * Killa se creó con `anon` teniendo DELETE, INSERT, UPDATE y **TRUNCATE**
   * sobre `articles`. Con RLS activo no se filtraba nada (las policies
   * filtraban, y sin policy de DELETE un borrado anónimo afectaba 0 filas),
   * pero la protección quedaba apoyada en una sola pata — y TRUNCATE saltea RLS
   * por completo.
   *
   * La migración 20260904150000 revoca y re-otorga el mínimo. Estos tests miran
   * el comportamiento observable: con los privilegios bien puestos, la base
   * responde "permission denied" en vez de aceptar la operación y no hacer
   * nada. Es la diferencia entre "no pasó nada esta vez" y "no puede pasar".
   */

  it("un DELETE anónimo es rechazado por privilegios, no sólo ignorado por RLS", async () => {
    const draft = await seedArticle();
    const { error } = await anon.from("articles").delete().eq("id", draft.id);

    expect(error, "anon no debería tener siquiera el privilegio de DELETE").not.toBeNull();
    expect(error?.message.toLowerCase()).toContain("permission denied");
  });

  it("un editor tampoco tiene el privilegio de DELETE", async () => {
    const draft = await seedArticle();
    const { error } = await editor.from("articles").delete().eq("id", draft.id);

    expect(error).not.toBeNull();
    expect(error?.message.toLowerCase()).toContain("permission denied");

    const { data } = await service.from("articles").select("id").eq("id", draft.id);
    expect(data?.length).toBe(1);
  });

  it("anon no alcanza la tabla de perfiles", async () => {
    const { error } = await anon.from("profiles").select("id");
    expect(error).not.toBeNull();
    expect(error?.message.toLowerCase()).toContain("permission denied");
  });

  it("anon no puede ejecutar las funciones del backend editorial", async () => {
    // Revocadas de PUBLIC, no sólo de anon: Postgres otorga EXECUTE a PUBLIC en
    // toda función nueva, así que revocar sólo a `anon` no habría cambiado nada.
    const { error } = await anon.rpc("article_image_in_use", { image_path: "x.jpg" });
    expect(error).not.toBeNull();
  });

  it("pero la lectura pública sigue funcionando", async () => {
    // La contracara: si el revoke se pasara de mano, el portal se cae entero.
    const { data, error } = await anon
      .from("articles")
      .select("slug, category:categories ( name )")
      .eq("status", "published");

    expect(error).toBeNull();
    expect((data ?? []).length).toBeGreaterThanOrEqual(3);
  });
});
