-- Killa TV: secciones principales y una subsección opcional por noticia.

alter table public.articles
  add column if not exists subsection text;

alter table public.articles
  drop constraint if exists articles_subsection_largo;
alter table public.articles
  add constraint articles_subsection_largo
  check (subsection is null or length(btrim(subsection)) between 1 and 80);

create or replace function public.articles_normalize_subsection()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.subsection := nullif(regexp_replace(btrim(coalesce(new.subsection, '')), '\s+', ' ', 'g'), '');
  return new;
end;
$$;

drop trigger if exists articles_normalize_subsection_trg on public.articles;
create trigger articles_normalize_subsection_trg
  before insert or update of subsection on public.articles
  for each row execute function public.articles_normalize_subsection();

insert into public.categories (name, slug)
values
  ('Economía', 'economia'),
  ('Cultura', 'cultura'),
  ('Tecnología', 'tecnologia')
on conflict (slug) do update set name = excluded.name;

comment on column public.articles.subsection is
  'Subsección editorial pública y opcional. Una nota pertenece a una sola subsección como máximo.';
