-- =====================================================================
-- KILLA TV — Etapa 1: firma editorial pública y opcional.
--
-- QUÉ AGREGA
-- `articles.byline`: el nombre con el que se firma la nota en el portal.
-- Es texto libre y opcional, y se decide nota por nota.
--
-- POR QUÉ NO SE DERIVA DE `author_id`
-- `author_id` y `updated_by` son **auditoría interna**: registran quién creó y
-- quién modificó por última vez, apuntan a `public.profiles` (cerrada a `anon`)
-- y no tienen por qué coincidir con la firma. Casos reales que lo separan:
--
--   * una nota escrita por el equipo pero firmada "Redacción Killa TV";
--   * una nota cargada al sistema por una persona y escrita por otra;
--   * una nota sin firma, que es el caso por defecto.
--
-- Derivar la firma del perfil obligaría además a exponer `display_name` al
-- público, y `profiles` se queda cerrada. La firma se lee de esta columna y de
-- ningún otro lado.
--
-- NO SE COMPLETA NADA RETROACTIVAMENTE. La columna nace `null` y las tres
-- noticias existentes quedan sin firma: inventarles un autor sería poner en
-- boca de alguien algo que no escribió.
--
-- Idempotente: `add column if not exists` + `create or replace` + guardas.
-- =====================================================================

alter table public.articles
  add column if not exists byline text;

comment on column public.articles.byline is
  'Firma editorial pública y opcional ("Por ..."). NULL = la nota se publica sin firma. No tiene relación con author_id/updated_by, que son auditoría interna.';

-- Normalización en la base, no sólo en el servidor.
--
-- Un `byline` de espacios en blanco renderizaría "Por" seguido de nada, así que
-- se convierte a NULL. Recortar y vaciar acá garantiza que la regla valga
-- también para una escritura directa por PostgREST, no sólo para el panel.
create or replace function public.articles_normalize_byline()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.byline := nullif(btrim(coalesce(new.byline, '')), '');
  return new;
end;
$$;

drop trigger if exists articles_normalize_byline_trg on public.articles;
create trigger articles_normalize_byline_trg
  before insert or update of byline on public.articles
  for each row execute function public.articles_normalize_byline();

-- El tope se valida sobre el texto YA recortado: el CHECK corre después de los
-- triggers BEFORE, así que 100 espacios + 5 letras no pasa por "105".
-- Se agrega con guarda porque `add constraint` no admite `if not exists`.
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.articles'::regclass
      and conname = 'articles_byline_largo'
  ) then
    alter table public.articles
      add constraint articles_byline_largo
      check (byline is null or length(byline) between 1 and 100);
  end if;
end
$$;

-- =====================================================================
-- Permisos: NADA que agregar, a propósito.
--
-- Los grants de la migración 20260904150000 son a nivel tabla, así que la
-- columna nueva queda cubierta: `anon` la lee sólo dentro de las filas que la
-- policy `articles_select_published` ya le permite ver, y no puede escribirla
-- porque no tiene INSERT ni UPDATE sobre `articles`. `public.profiles` sigue
-- cerrada a `anon`.
--
-- Tampoco se toca ninguna policy ni el comportamiento de author_id/updated_by.
-- =====================================================================
