#!/usr/bin/env node
/**
 * Verificación de extremo a extremo de los criterios de aceptación, contra el
 * servidor de Next REAL y el Supabase local.
 *
 * Prueba lo que los tests de reglas no pueden: que la protección de rutas, el
 * render público, el 404 de un borrador y la sesión de un editor funcionen a
 * nivel HTTP, con el proxy, las cookies y los Server Components en el medio.
 *
 * Uso:
 *   npm run build && PORT=4399 npm start &     # o `npm run dev`
 *   npm run test:e2e                           # BASE_URL para otro puerto
 *
 * GUARDARRAÍL: aborta si Supabase o el sitio no son locales. Crea usuarios y
 * escribe notas.
 */
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { execFileSync } from "node:child_process";

const LOCAL = /^https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?$/;

const env = {};
try {
  for (const line of execFileSync("supabase", ["status", "-o", "env"], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).split("\n")) {
    const m = line.match(/^([A-Z_]+)="?(.*?)"?$/);
    if (m) env[m[1]] = m[2];
  }
} catch {
  console.error("\nNo se pudo leer `supabase status`. ¿Está levantado el stack local?\n  npm run supabase:start\n");
  process.exit(1);
}

const URL_ = env.API_URL ?? "";
const ANON = env.ANON_KEY ?? "";
const SERVICE = env.SERVICE_ROLE_KEY ?? "";
const BASE = (process.env.BASE_URL ?? "http://127.0.0.1:4399").replace(/\/$/, "");

if (!LOCAL.test(URL_) || !LOCAL.test(BASE)) {
  console.error(`\nABORTADO: esto escribe datos y sólo corre en local.\n  Supabase: ${URL_}\n  Sitio:    ${BASE}\n`);
  process.exit(1);
}

try {
  await fetch(BASE + "/tv");
} catch {
  console.error(`\nNo hay nadie escuchando en ${BASE}.\n  npm run build && PORT=4399 npm start\n`);
  process.exit(1);
}

console.log(`Criterios de aceptación contra ${BASE} + ${URL_}\n`);
const PASSWORD = "killa-e2e-2026";
const email = `e2e.${Date.now()}@killa.test`;

const service = createClient(URL_, SERVICE, { auth: { persistSession: false } });

let failures = 0;
function check(label, ok, extra = "") {
  console.log(`${ok ? "  ok  " : " FALLA"} ${label}${extra ? ` — ${extra}` : ""}`);
  if (!ok) failures++;
}

// --- 1. Panel protegido sin sesión ---------------------------------------
for (const path of ["/tv/panel", "/tv/panel/notas/nueva"]) {
  const res = await fetch(BASE + path, { redirect: "manual" });
  const location = res.headers.get("location") ?? "";
  check(`sin sesión, ${path} redirige al login`, res.status === 307 || res.status === 302, `${res.status} → ${location}`);
  check(`  destino correcto`, location.includes("/tv/panel/ingresar"), location);
}

// --- 2. Contenido público ------------------------------------------------
const tv = await fetch(BASE + "/tv").then((r) => r.text());
check("/tv muestra la destacada del seed", tv.includes("Killa conecta comunidades"));
check("/tv lista las otras dos notas", tv.includes("Dos unidades") && tv.includes("Infraestructura propia"));
check("/tv arma el link de la categoría", tv.includes("/tv/categoria/deportes"));

const nota = await fetch(BASE + "/tv/noticias/killa-conecta-cuatro-provincias");
const notaHtml = await nota.text();
check("la nota pública responde 200", nota.status === 200, String(nota.status));
check("trae la meta de Open Graph con imagen", notaHtml.includes('property="og:image"'));
check("trae el canonical", notaHtml.includes('rel="canonical"'));

const cat = await fetch(BASE + "/tv/categoria/noticias");
check("/tv/categoria/noticias responde 200", cat.status === 200, String(cat.status));

// --- 3. Un borrador no es público ----------------------------------------
const stamp = Date.now();
const draft = await service.from("articles").insert({
  title: `Borrador que no debe verse ${stamp}`,
  slug: `borrador-que-no-debe-verse-${stamp}`,
  excerpt: "No debería salir nunca al portal público.",
  body: "Cuerpo del borrador. ".repeat(12),
  featured_image_path: "/news/infraestructura.jpg",
  image_alt: "Imagen de prueba",
  status: "draft",
}).select("id, slug").single();

const draftRes = await fetch(`${BASE}/tv/noticias/${draft.data.slug}`);
check("un borrador da 404 en el portal público", draftRes.status === 404, String(draftRes.status));

// --- 4. Sesión real de editor -------------------------------------------
const created = await service.auth.admin.createUser({
  email, password: PASSWORD, email_confirm: true,
  user_metadata: { display_name: "Editora E2E" },
});
if (created.error) throw created.error;

// Se usa el mismo cliente que la app para que las cookies queden con el
// formato exacto que espera el servidor.
const jar = new Map();
const ssr = createServerClient(URL_, ANON, {
  cookies: {
    getAll: () => [...jar.entries()].map(([name, value]) => ({ name, value })),
    setAll: (list) => list.forEach(({ name, value }) => jar.set(name, value)),
  },
});
const signIn = await ssr.auth.signInWithPassword({ email, password: PASSWORD });
check("el editor inicia sesión", !signIn.error, signIn.error?.message ?? "");

const cookieHeader = [...jar.entries()].map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join("; ");
check("se generaron cookies de sesión", jar.size > 0, `${jar.size} cookie(s)`);

const panel = await fetch(BASE + "/tv/panel", { headers: { cookie: cookieHeader } });
const panelHtml = await panel.text();
check("con sesión, /tv/panel responde 200", panel.status === 200, String(panel.status));
check("el panel saluda a la editora", panelHtml.includes("Editora E2E"));
check("el panel lista el borrador", panelHtml.includes(`Borrador que no debe verse ${stamp}`));
check("el panel muestra el contador de publicadas", panelHtml.includes("Publicadas"));

const preview = await fetch(`${BASE}/tv/panel/notas/${draft.data.id}/vista-previa`, {
  headers: { cookie: cookieHeader },
});
const previewHtml = await preview.text();
check("la vista previa del borrador responde 200", preview.status === 200, String(preview.status));
check("la vista previa muestra el cuerpo del borrador", previewHtml.includes("Cuerpo del borrador"));

const previewAnon = await fetch(`${BASE}/tv/panel/notas/${draft.data.id}/vista-previa`, { redirect: "manual" });
check("sin sesión, la vista previa redirige", previewAnon.status === 307 || previewAnon.status === 302, String(previewAnon.status));

// --- limpieza ------------------------------------------------------------
await service.from("articles").delete().eq("id", draft.data.id);
await service.auth.admin.deleteUser(created.data.user.id);

console.log(failures === 0 ? "\nTODO OK\n" : `\n${failures} verificación(es) fallaron\n`);
process.exit(failures === 0 ? 0 : 1);
