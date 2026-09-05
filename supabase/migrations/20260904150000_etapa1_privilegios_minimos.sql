-- =====================================================================
-- KILLA TV — Etapa 1: privilegios mínimos para anon y authenticated.
--
-- POR QUÉ EXISTE ESTA MIGRACIÓN
-- Los privilegios por defecto de un proyecto Supabase NO son iguales en todas
-- partes, y eso se descubrió aplicando esto a producción:
--
--   * en el stack local de la CLI, `pg_default_acl` deja a
--     anon/authenticated/service_role SÓLO con Dxtm, así que los `grant`
--     explícitos de la migración 20260904120000 eran obligatorios para que el
--     portal funcionara;
--   * en el proyecto real (creado 2026-09-04), el default es **permisivo**:
--     `anon` quedó con DELETE, INSERT, UPDATE y TRUNCATE sobre `articles`
--     además del SELECT que le dimos.
--
-- Con RLS activo eso no permitía leer ni escribir nada indebido (las policies
-- filtran, y `articles` no tiene policy de DELETE, así que un DELETE anónimo
-- afecta 0 filas). Pero:
--
--   1. dejaba la protección apoyada en una sola pata — la ausencia de policy —
--      cuando el diseño era que hicieran falta las dos (sin grant Y sin policy);
--   2. **TRUNCATE saltea RLS por completo.** Un rol con TRUNCATE sobre
--      `articles` puede vaciar la tabla sin que ninguna policy lo mire. No es
--      alcanzable por PostgREST, pero no hay ninguna razón para que `anon` lo
--      tenga.
--
-- Así que se revoca todo y se vuelve a otorgar exactamente lo necesario. Es
-- idempotente y deja el mismo resultado en cualquier proyecto, sin importar con
-- qué defaults se creó.
--
-- REGLA PARA EL FUTURO: cada tabla nueva declara sus grants Y revoca lo que no
-- necesita. No confiar en los defaults del proyecto: cambian.
-- =====================================================================

-- Punto de partida limpio y explícito.
revoke all on public.articles   from anon, authenticated;
revoke all on public.categories from anon, authenticated;
revoke all on public.profiles   from anon, authenticated;

-- El público sólo lee noticias y secciones. Qué noticias, lo decide la policy
-- `articles_select_published`.
grant select on public.articles   to anon, authenticated;
grant select on public.categories to anon, authenticated;

-- El staff editorial (ya autenticado) escribe notas y administra secciones.
-- `delete` sobre articles NO se otorga: la baja editorial es archivar, y la
-- tabla tampoco tiene policy de DELETE.
grant insert, update         on public.articles   to authenticated;
grant insert, update, delete on public.categories to authenticated;
grant select, update         on public.profiles   to authenticated;

-- `service_role` salta RLS por diseño y sólo se usa desde un servidor con la
-- clave secreta (la app de la Etapa 1 no la usa en ningún camino).
grant all on public.articles, public.categories, public.profiles to service_role;

-- Las funciones del backend editorial tampoco son para el público.
--
-- OJO: hay que revocar de `public` (el pseudo-rol), no sólo de `anon`. Postgres
-- otorga EXECUTE a PUBLIC en toda función nueva, así que revocar sólo a `anon`
-- no cambia nada: sigue alcanzándolas por herencia de PUBLIC.
--
-- Ninguna policy que evalúe `anon` llama a estas funciones (las de staff son
-- `to authenticated`), así que restringirlas no rompe la lectura pública.
revoke all on function public.is_editorial_staff()       from public, anon;
revoke all on function public.is_editorial_admin()       from public, anon;
revoke all on function public.editorial_role()           from public, anon;
revoke all on function public.article_image_in_use(text) from public, anon;

grant execute on function public.is_editorial_staff()       to authenticated, service_role;
grant execute on function public.is_editorial_admin()       to authenticated, service_role;
grant execute on function public.editorial_role()           to authenticated, service_role;
grant execute on function public.article_image_in_use(text) to authenticated, service_role;

-- `slugify` es inmutable y no revela nada: la usan los CHECK de las tablas, así
-- que tiene que seguir siendo ejecutable por cualquiera que escriba una fila.
grant execute on function public.slugify(text) to anon, authenticated, service_role;
