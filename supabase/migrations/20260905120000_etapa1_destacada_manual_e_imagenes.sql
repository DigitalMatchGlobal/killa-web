-- Killa TV Etapa 1: destacada manual y límite editorial de imágenes.
-- `priority` se conserva para etapas futuras, pero ya no decide la tapa.

alter table public.articles
  add column if not exists is_featured boolean not null default false;

comment on column public.articles.is_featured is
  'Selección manual de la noticia principal de Killa TV. Priority queda reservado para una etapa posterior.';

-- Conserva la tapa que ya existía antes de esta migración: sólo durante la
-- transición se toma la antigua prioridad para marcar una primera destacada.
-- Si ya hay una elegida, no pisa la decisión editorial.
update public.articles
set is_featured = true
where id = (
  select id
  from public.articles
  where status = 'published'
  order by priority desc, published_at desc nulls last
  limit 1
)
and not exists (
  select 1 from public.articles where is_featured = true
);

-- Al marcar una nota, cualquier destacada anterior se desmarca en la misma
-- transacción. El trigger también protege escrituras directas por PostgREST.
create or replace function public.articles_keep_single_featured()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.is_featured then
    update public.articles
      set is_featured = false
      where id <> new.id and is_featured = true;
  end if;
  return new;
end;
$$;

drop trigger if exists articles_single_featured_trg on public.articles;
create trigger articles_single_featured_trg
  before insert or update of is_featured on public.articles
  for each row execute function public.articles_keep_single_featured();

create index if not exists articles_featured_published_at_idx
  on public.articles (is_featured desc, published_at desc)
  where status = 'published';

do $$
begin
  if to_regclass('storage.buckets') is not null then
    update storage.buckets
      set file_size_limit = 3145728
      where id = 'killa-news';
  end if;
end
$$;
