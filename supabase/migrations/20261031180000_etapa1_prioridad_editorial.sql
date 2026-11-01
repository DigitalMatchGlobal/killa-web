-- =====================================================================
-- KILLA TV — Etapa 1: la prioridad editorial pasa a ordenar los listados.
--
-- QUÉ CAMBIA
-- `priority` (1–5) deja de ser un dato "reservado" y define el orden de los
-- listados (más noticias, secciones, subsecciones): prioridad descendente y, a
-- igual prioridad, `published_at` descendente. La tapa NO cambia: la decide la
-- destacada manual (`is_featured`).
--
-- EL DEFAULT PASA DE 1 A 3
-- Con la escala 1 = baja · 3 = normal · 5 = alta, "normal" es 3. Hasta ahora el
-- formulario rotulaba el 1 como "normal" y era el valor por defecto, así que
-- las notas existentes con 1 son, en la práctica, "normales" y se llevan a 3.
-- Sin esto, toda nota vieja quedaría por debajo de cualquier nota nueva.
--
-- ES UN CAMBIO DE DATOS (una sola vez): antes de aplicarlo en producción se
-- guarda el valor previo de `priority` de cada nota (ver el respaldo en
-- BACKUPS/killa-prioridad-previa-*.json). Para revertir: restaurar esos valores
-- y `alter column priority set default 1`.
--
-- NO TOCA la restricción 1..5, ni los índices (ya existe
-- `articles_priority_published_at_idx` y su versión parcial para publicadas).
-- =====================================================================

alter table public.articles
  alter column priority set default 3;

update public.articles
set priority = 3
where priority = 1;

comment on column public.articles.priority is
  'Prioridad editorial 1–5 (1 baja · 3 normal · 5 alta). Ordena los listados: prioridad desc y luego published_at desc. La tapa se decide con is_featured.';
