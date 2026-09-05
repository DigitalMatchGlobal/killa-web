# Backend editorial de Killa TV — Etapa 1

**Fecha:** 2026-09-04 · **Rama:** `feat/backend-editorial-etapa1` ·
**Estado:** implementado, verificado en local y **aplicado al proyecto real**
(`ztuhmauobojsiwgxrhqa`, us-east-2, Postgres 17.6) el 2026-09-04. La app ya lee
de ese proyecto. Falta crear las cuentas del equipo de prensa y desplegar.

Informe de qué se hizo, qué se decidió y por qué, y qué queda pendiente.
El detalle de configuración vive en [`../supabase/README.md`](../supabase/README.md).

---

## 1. Qué se implementó

Sólo el backend editorial de la Etapa 1: autenticación, noticias, categorías,
imágenes y las operaciones del panel. **No** hay publicidad, comentarios,
analíticas, Club Killa, Mikrowisp, CRM ni cobro de WiFi de eventos.

| Operación pedida | Dónde está |
|---|---|
| Iniciar y cerrar sesión | `signInAction` / `signOutAction` (`lib/editorial/actions.ts`) |
| Obtener sesión actual | `getCurrentProfile()` / `requireEditorialStaff()` (`lib/editorial/auth.ts`) |
| Crear borrador | `createDraftAction` |
| Editar borrador o noticia | `saveArticleAction` |
| Subir imagen destacada | `uploadFeaturedImageAction` |
| Previsualizar | `/tv/panel/notas/[id]/vista-previa` (usa el mismo componente que la página pública) |
| Publicar | `publishArticleAction` |
| Archivar | `archiveArticleAction` (+ `unpublishArticleAction` para volver a borrador) |
| Listar publicaciones del panel | `listPanelArticles()` (`lib/editorial/panel.ts`) |
| Obtener noticia pública por slug | `getArticleBySlug()` (`lib/editorial/queries.ts`) |
| Obtener noticia destacada | `getFeaturedArticle()` |
| Obtener últimas noticias | `getLatestArticles()` |
| Filtrar por categoría | `getArticlesByCategory()` + `/tv/categoria/[slug]` |
| Borrado de imagen controlado | `deleteUnusedImageAction` + `public.article_image_in_use()` |

El contrato `Article` es exactamente el que pedía el brief
(`lib/editorial/types.ts`). El panel usa `PanelArticle`, que lo extiende con lo
que la UI de administración necesita (la key cruda de la imagen, el autor).

---

## 2. Decisiones que conviene conocer

**El proveedor es Supabase, como ya estaba definido** en `docs/03-ARQUITECTURA.md`
y `docs/08-MVP-WEB-TV-500.md`. No había base preexistente: el repo era una
landing estática con las noticias hardcodeadas. Todo el esquema es nuevo.

**El bucket de imágenes es de lectura pública y escritura restringida**, en vez
de privado con URL firmada. El criterio 7 pide que las notas queden listas para
vistas previas sociales, y los crawlers de WhatsApp, Facebook y X piden la
imagen de Open Graph **sin sesión y meses después** de publicada la nota: una
URL firmada expira y la tarjeta se rompe. La protección está donde importa —
subir, reemplazar y borrar sólo el staff editorial, por RLS. Una foto de prensa
ya publicada no es información sensible.

**El cuerpo de la nota se guarda como Markdown, nunca como HTML generado.** Se
renderiza con `react-markdown`, sin habilitar HTML crudo, y las etiquetas que
alguien pegue se limpian antes de guardar. El equipo dispone de toolbar y vista
previa; la nota pública y el panel comparten el mismo render seguro.

**Nada de la app usa `service_role`.** Todas las escrituras van con la sesión
del editor, así que las RLS son la última palabra incluso si esta capa tuviera
un bug. La clave secreta no está ni en `.env.example` (sólo se nombra para
explicar por qué no va).

**El rol se lee de `public.profiles`, no de los claims del token.** Revocarle el
acceso a alguien tiene efecto inmediato, sin esperar que expire su JWT.

**La baja editorial es archivar y no hay forma de borrar una nota**: `articles`
no tiene policy de `DELETE`, así que ni un admin puede eliminar una fila por
API. Archivar y volver a publicar **conserva la fecha de publicación original**
(la nota no rejuvenece en la portada por un archivado accidental).

**El slug lo genera y desambigua la base**, no el cliente: un trigger lo
normaliza (sin acentos, URL-safe) y le agrega `-2`, `-3` si ya existe. El slug
de una nota **publicada** no cambia aunque se edite el título: los links que ya
circularon por WhatsApp tienen que seguir funcionando.

**Se agregó `updated_by` al modelo** que traía el brief, para cumplir
"registrar autor y fechas de cada modificación". El autor original no se
reescribe nunca; `updated_by` guarda quién tocó por última vez. Los FK de
`author_id` y `updated_by` apuntan a `profiles` (no a `auth.users`) para poder
traer el nombre del autor en una sola consulta, y sus constraints están
**nombrados a mano** porque son dos FK al mismo destino: sin nombre explícito,
el embed de PostgREST queda ambiguo y responde `PGRST201`.

**Las tres noticias migradas quedaron en la categoría Noticias.** Traían
etiquetas propias ("Institucional", "Killa", "Servicios") que no están entre las
tres categorías del brief; migrarlas a Noticias es preferible a inventar
secciones que el equipo no pidió. Se reasignan desde el panel en un click.

**`lib/tv-news.ts` sigue en su lugar**, ahora como fallback de desarrollo: si
faltan las variables de entorno, el portal muestra esas tres notas en vez de
romper, y avisa por consola. Se borra junto con `lib/editorial/fallback.ts`
cuando la integración esté validada contra el proyecto real.

---

## 3. Hallazgos del camino

**Los `grant` explícitos son obligatorios.** En esta versión de Supabase las
tablas nuevas ya **no** heredan privilegios de lectura/escritura para
`anon`, `authenticated` ni `service_role` (`pg_default_acl` les deja sólo
`Dxtm`). Sin los grants de la migración, PostgREST responde
`permission denied for table articles` **antes** de evaluar una sola policy y el
portal público se cae entero. Si se agrega una tabla, hay que darle sus grants.

**`auth.email.enable_signup` no significa lo que parece.** En `config.toml` esa
clave enciende el *proveedor* de email en GoTrue
(`GOTRUE_EXTERNAL_EMAIL_ENABLED`), no el auto-registro. Ponerla en `false` deja
el login roto con "Email logins are disabled". El registro público se apaga con
`auth.enable_signup = false`, que es lo que está.

**Los privilegios por defecto NO son iguales en local y en producción.** En el
stack local de la CLI, `anon` no hereda nada sobre una tabla nueva (hicieron
falta los `grant`); en el proyecto real de Killa, `anon` heredó
`SELECT, INSERT, UPDATE, DELETE` **y `TRUNCATE`**. Con RLS activo no se
filtraba nada, pero la protección quedaba apoyada sólo en la ausencia de policy
de DELETE — y `TRUNCATE` saltea RLS por completo. Se agregó la migración
`20260904150000` que revoca y re-otorga el mínimo, más cinco tests que exigen
que un DELETE anónimo devuelva `permission denied` en vez de un silencioso
"0 filas".

**El registro público venía abierto en el proyecto real** (`disable_signup:
false`). Como el trigger le asigna rol `editor` a todo usuario nuevo de Auth,
cualquiera podía registrarse y quedar con permisos de escritura. Se cerró por
Management API, junto con subir el mínimo de contraseña de 6 a 8 para que
coincida con lo que valida el panel.

**El rol `admin` era auto-asignable por metadata.** El trigger original leía
`raw_user_meta_data ->> 'role'`, así que un alta con `role: "admin"` en ese JSON
creaba un perfil admin. En el flujo previsto lo llenaba un admin desde la
consola, pero combinado con el registro abierto de fábrica ponía el privilegio
más alto del sistema a un JSON de distancia de cualquiera. La migración
`20260904160000` hace que el campo se ignore: todo usuario nace `editor` y la
promoción es un `update` explícito. **No toca los perfiles existentes** — un
update retroactivo podría dejar el proyecto sin ningún admin y pisaría una
decisión tomada a mano.

**Filtrar por categoría necesita `!inner`.** Sin el inner join en el `select`,
un filtro sobre la tabla embebida no descarta filas: PostgREST devuelve la nota
con `category: null`. Está documentado en `lib/editorial/queries.ts` y cubierto
por un test.

---

## 4. Verificación

| Comando | Qué prueba | Resultado |
|---|---|---|
| `npm run test` | Reglas puras: ranking de portada, saneamiento, validación de publicación, firma de imagen, mapeo del contrato | **25 ✅** |
| `npm run test:rules` | RLS, privilegios de tabla, rol admin y reglas de la base contra un Postgres real | **35 ✅** |
| `npm run test:e2e` | Los criterios de aceptación por HTTP, con el sitio levantado | **21 ✅** |
| `npm run build` | Compila y prerenderiza las tres notas desde la base | ✅ |
| `npm run lint` | Sin errores nuevos (queda 1 warning preexistente en `coverage-explorer.tsx`) | ✅ |

Los dos últimos suites **abortan si la URL de Supabase no es local**: crean
usuarios y escriben notas.

### Criterios de aceptación

1. **Sin sesión no se entra al panel ni se modifica contenido** — verificado por
   HTTP (redirección de `/tv/panel` y de la vista previa) y por RLS (`anon` no
   puede insertar ni publicar; la nota no cambia de estado).
2. **El público sólo obtiene noticias publicadas** — un borrador y una archivada
   no salen por la clave anónima, y la nota da 404 en el portal.
3. **El editor crea, previsualiza, publica, edita y archiva** — ciclo completo
   probado, incluido que nazca borrador, que la base ponga `published_at` y que
   republicar conserve la fecha.
4. **Sube una imagen válida y se rechazan las inválidas** — tres rejas: Zod,
   firma real del archivo (magic bytes) y el propio bucket. Un HTML renombrado a
   `.jpg` con `Content-Type: image/jpeg` se rechaza.
5. **La destacada se elige manualmente** — `is_featured` garantiza una sola;
   si todavía no eligieron ninguna, la portada usa la publicación más reciente.
   `priority` queda guardada para una etapa posterior y no altera la tapa.
6. **Las últimas noticias van en orden cronológico** y sin la destacada.
7. **Datos listos para SEO y previews sociales** — `generateMetadata` con
   canonical, Open Graph (imagen, `publishedTime`, `section`) y Twitter card;
   las tres notas se prerenderizan desde la base.
8. **Nada fuera de la Etapa 1.**

---

## 5. Pendientes

**Hecho el 2026-09-04 sobre el proyecto real:**

- Las primeras 5 migraciones aplicadas y registradas en
  `supabase_migrations.schema_migrations`. Se aplicaron por **Management API**
  con el PAT, porque la contraseña de la base no estaba disponible; el proyecto
  estaba completamente vacío (0 tablas, 0 buckets, 0 usuarios) antes de tocarlo.
- Registro público cerrado y mínimo de contraseña alineado en 8.
- `.env.local` apuntando al proyecto real con la clave **publishable**
  (`sb_publishable_...`), no la anon legacy.
- Verificado contra producción, sólo lecturas: `anon` ve las 3 notas publicadas
  con su categoría; DELETE, INSERT, PATCH y el acceso a `profiles` dan 401; el
  signup anónimo da 422; la subida anónima al bucket se rechaza; el bucket tiene
  sus 4 policies, 5 MB y los 3 tipos; `npm run build` prerenderiza las 3 notas
  desde la nube; `/tv`, la nota, la sección y el 404 de sección inexistente
  responden bien, y `/tv/panel` sin sesión redirige al login.

**Falta para poner el sitio en producción:**

1. **Aplicar `20260905120000`** antes de desplegar el frontend actualizado:
   agrega la destacada manual y reduce el techo del bucket a 3 MB.
2. **Crear las cuentas del equipo de prensa** (Authentication → Add user, con
   "Auto Confirm User") y decidir quién es `admin`:
   `update public.profiles set role = 'admin' where id = '<uuid>';`
   No lo hice: son datos de personas reales y no me los pasaste.
3. **Cargar las dos variables en Vercel** (`NEXT_PUBLIC_SUPABASE_URL` y
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`) y desplegar. Sin autorización explícita no
   toqué Vercel ni pushee la rama.
3. ⚠️ **Confirmar el plan de la organización** `swwsxexyzvbnzoqwzjgd`. El PAT no
   tiene alcance para leerlo (`Forbidden`). La política de la casa
   (`../../INFRAESTRUCTURA-DMG.md`) es un solo Supabase Pro compartido; si esta
   cuenta dedicada de DigitalMatch quedó en plan free, el proyecto no hereda
   backups ni límites del Pro — y eso es lo que sostiene la mensualidad del
   doc 08.
4. ⚠️ **El PAT circuló por chat.** Conviene revocarlo en
   <https://supabase.com/dashboard/account/tokens> cuando termine el setup: da
   acceso completo a la cuenta por API.
5. **Contenido real**: las tres notas migradas son material institucional de
   demostración.

Además, quedan afuera a propósito y conviene tenerlos anotados:

- **Recuperar contraseña.** Hoy la resetea un admin desde la consola. El flujo
  por email necesita SMTP configurado (Resend, como en el resto de la casa) y no
  estaba en el alcance.
- **Administrar categorías desde el panel.** El backend ya lo permite (hay
  policies de insert/update); falta la pantalla. Las tres iniciales vienen del
  seed.
- **Buscador del panel.** `listPanelArticles()` ya acepta `search`; falta el
  input. Con tres notas no hace falta.
- **Borrado de imágenes huérfanas.** La acción existe y valida que nadie la
  referencie, pero no hay pantalla que las liste. Sin eso, una imagen que se
  reemplaza queda ocupando lugar en el bucket.
- **Sitemap y RSS.** `getPublishedSlugs()` está listo para alimentarlos.
- **Reasignar las tres notas migradas** a su sección definitiva cuando el equipo
  defina el árbol real de categorías.

---

## 6. Archivos

### Nuevos

```
supabase/config.toml
supabase/README.md
supabase/migrations/20260904120000_etapa1_editorial_schema.sql
supabase/migrations/20260904120100_etapa1_editorial_storage.sql
supabase/migrations/20260904120200_etapa1_editorial_seed.sql
supabase/migrations/20260904150000_etapa1_privilegios_minimos.sql
supabase/migrations/20260904160000_etapa1_rol_admin_explicito.sql
supabase/migrations/20260905120000_etapa1_destacada_manual_e_imagenes.sql

lib/supabase/env.ts                     lib/editorial/types.ts
lib/supabase/server.ts                  lib/editorial/queries.ts
                                        lib/editorial/panel.ts
proxy.ts                                lib/editorial/actions.ts
                                        lib/editorial/auth.ts
components/tv/article-view.tsx          lib/editorial/validation.ts
components/tv/article-card.tsx          lib/editorial/sanitize.ts
components/tv/markdown-content.tsx
components/tv/share-actions.tsx
components/panel/panel-header.tsx       lib/editorial/ranking.ts
components/panel/login-form.tsx         lib/editorial/format.ts
components/panel/article-form.tsx       lib/editorial/fallback.ts
components/panel/status-actions.tsx

app/tv/categoria/[slug]/page.tsx
app/tv/panel/layout.tsx
app/tv/panel/ingresar/page.tsx
app/tv/panel/notas/nueva/page.tsx
app/tv/panel/notas/[id]/page.tsx
app/tv/panel/notas/[id]/vista-previa/page.tsx

tests/unit/editorial-rules.test.ts      vitest.config.mts
tests/rules/editorial-security.test.ts  vitest.rules.config.mts
tools/run-rules-tests.mjs               .env.example
tools/verificacion-e2e.mjs              docs/BACKEND-ETAPA-1.md
```

### Modificados

| Archivo | Cambio |
|---|---|
| `app/tv/page.tsx` | Portada desde la base (destacada + últimas + secciones reales). Se cambió el cartel "Mockup editorial" y el botón "Ver mockup del panel", que ya no eran ciertos |
| `app/tv/noticias/[slug]/page.tsx` | Lee de la base, 404 si no está publicada, metadata de OG completa, compartir y otras noticias |
| `app/tv/panel/page.tsx` | Panel real con sesión, contadores, búsqueda, filtro por categoría/estado y paginación |
| `next.config.ts` | `images.remotePatterns` para el bucket, derivado de `NEXT_PUBLIC_SUPABASE_URL` |
| `package.json` | `@supabase/ssr`, `@supabase/supabase-js`, `zod`, `vitest`; scripts de test y de Supabase; `@types/node` a `^22` (lo que pedía vitest y lo que corre la máquina) |

### Sin tocar

`lib/tv-news.ts` (ahora fallback de desarrollo) y todo el resto del sitio
institucional: `app/page.tsx`, `components/sections/*`, `components/visual/*`,
`lib/site.ts`, `app/globals.css`. El diseño no se movió.
