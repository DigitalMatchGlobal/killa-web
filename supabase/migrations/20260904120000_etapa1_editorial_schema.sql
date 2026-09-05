-- =====================================================================
-- KILLA TV — Etapa 1: backend editorial (esquema, reglas y RLS).
--
-- Alcance deliberado: perfiles, categorías, noticias, imágenes y las
-- operaciones del panel. NADA de publicidad, comentarios, analíticas,
-- Club Killa, Mikrowisp, CRM ni WiFi de eventos (ver docs/08-MVP-WEB-TV-500.md).
--
-- Es idempotente: se puede re-correr entera (`create ... if not exists`,
-- `drop policy if exists`, `create or replace function`).
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Utilidades
-- ---------------------------------------------------------------------

-- Normaliza un texto a slug apto para URL.
--
-- POR QUÉ NO USA `unaccent`: esa extensión hay que habilitarla y no está
-- garantizada en cualquier Postgres donde se quiera validar el esquema.
-- `translate()` cubre el castellano, que es todo lo que necesita un portal de
-- noticias del norte argentino, y no agrega dependencias.
create or replace function public.slugify(value text)
returns text
language sql
immutable
set search_path = ''
as $$
  select trim(
           both '-' from
           regexp_replace(
             regexp_replace(
               lower(translate(
                 coalesce(value, ''),
                 'áàäâãéèëêíìïîóòöôõúùüûñçÁÀÄÂÃÉÈËÊÍÌÏÎÓÒÖÔÕÚÙÜÛÑÇ',
                 'aaaaaeeeeiiiiooooouuuuncAAAAAEEEEIIIIOOOOOUUUUNC'
               )),
               '[^a-z0-9]+', '-', 'g'
             ),
             '-{2,}', '-', 'g'
           )
         );
$$;

comment on function public.slugify(text) is
  'Normaliza texto a slug URL-safe (minúsculas, sin acentos, guiones simples).';

-- ---------------------------------------------------------------------
-- 2. profiles
-- ---------------------------------------------------------------------

create table if not exists public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  display_name text not null check (length(btrim(display_name)) > 0),
  role         text not null default 'editor' check (role in ('admin', 'editor')),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

comment on table public.profiles is
  'Personas con acceso al panel editorial. Sin fila acá, un usuario autenticado no puede escribir nada.';

-- Rol del usuario de la sesión actual.
--
-- POR QUÉ ES SECURITY DEFINER: las policies de `profiles` necesitan consultar
-- `profiles`. Hacerlo directo genera recursión infinita de RLS. La función
-- corre con los permisos del dueño y saltea RLS; sólo devuelve el rol del
-- propio `auth.uid()`, así que no filtra nada de otras personas.
create or replace function public.editorial_role()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select p.role from public.profiles p where p.id = auth.uid();
$$;

create or replace function public.is_editorial_staff()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('admin', 'editor')
  );
$$;

create or replace function public.is_editorial_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  );
$$;

-- Crea el perfil al dar de alta un usuario.
--
-- ⚠️ El rol por defecto es `editor`. Eso es seguro SÓLO porque el alta pública
-- está deshabilitada (`enable_signup = false` en supabase/config.toml). Si
-- alguien habilita el registro abierto, cualquier visitante se convertiría en
-- editor. Las cuentas de prensa las crea un admin.
create or replace function public.handle_new_editorial_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name, role)
  values (
    new.id,
    coalesce(
      nullif(btrim(new.raw_user_meta_data ->> 'display_name'), ''),
      split_part(new.email, '@', 1)
    ),
    case
      when new.raw_user_meta_data ->> 'role' = 'admin' then 'admin'
      else 'editor'
    end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_editorial on auth.users;
create trigger on_auth_user_created_editorial
  after insert on auth.users
  for each row execute function public.handle_new_editorial_user();

-- ---------------------------------------------------------------------
-- 3. categories
-- ---------------------------------------------------------------------

create table if not exists public.categories (
  id         uuid primary key default gen_random_uuid(),
  name       text not null check (length(btrim(name)) > 0),
  slug       text not null unique check (slug = public.slugify(slug) and length(slug) > 0),
  created_at timestamptz not null default now()
);

comment on table public.categories is
  'Secciones de Killa TV. Etapa 1 arranca con Noticias, Deportes y Turismo.';

-- ---------------------------------------------------------------------
-- 4. articles
-- ---------------------------------------------------------------------

create table if not exists public.articles (
  id                   uuid primary key default gen_random_uuid(),
  title                text not null check (length(btrim(title)) > 0),
  slug                 text not null unique check (slug = public.slugify(slug) and length(slug) > 0),
  excerpt              text not null default '',
  body                 text not null default '',
  category_id          uuid references public.categories (id) on delete set null,
  featured_image_path  text,
  image_alt            text,
  status               text not null default 'draft'
                         check (status in ('draft', 'published', 'archived')),
  priority             smallint not null default 1 check (priority between 1 and 5),
  -- Los FK apuntan a `profiles`, no a `auth.users`, por dos razones:
  --  1. deja que PostgREST embeba el nombre del autor en una sola consulta;
  --  2. sólo puede firmar una nota alguien con perfil editorial.
  -- Los constraints se nombran a mano PORQUE SON DOS AL MISMO DESTINO: sin
  -- nombre explícito el embed `profiles(...)` queda ambiguo y PostgREST
  -- devuelve PGRST201 (mismo golpe que nos comimos en WhatsAppBot_Rocket).
  author_id            uuid,
  updated_by           uuid,
  constraint articles_author_id_fkey
    foreign key (author_id) references public.profiles (id) on delete set null,
  constraint articles_updated_by_fkey
    foreign key (updated_by) references public.profiles (id) on delete set null,
  published_at         timestamptz,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),

  -- Una nota publicada NO puede quedar sin imagen ni sin texto alternativo:
  -- el alt es requisito de accesibilidad y la imagen es lo que levantan
  -- WhatsApp y las redes en la vista previa. Se valida también en el servidor
  -- (lib/editorial/validation.ts), pero la base es la última línea.
  constraint articles_published_needs_image check (
    status <> 'published'
    or (
      length(btrim(coalesce(featured_image_path, ''))) > 0
      and length(btrim(coalesce(image_alt, ''))) > 0
    )
  ),

  -- Una nota publicada siempre tiene fecha de publicación (la pone el trigger).
  constraint articles_published_needs_date check (
    status <> 'published' or published_at is not null
  )
);

comment on table public.articles is
  'Noticias de Killa TV. La baja editorial es archivar (status = archived), nunca borrar la fila.';
comment on column public.articles.priority is
  'Prioridad editorial 1..5. La portada muestra la publicada de mayor prioridad; empate lo gana la más reciente.';
comment on column public.articles.featured_image_path is
  'Key dentro del bucket killa-news, o una ruta absoluta de /public (así quedó el contenido migrado de lib/tv-news.ts).';
comment on column public.articles.updated_by is
  'Autor de la última modificación. Añadido al modelo pedido para cumplir "registrar autor y fechas de cada modificación".';

-- Índices pedidos en el brief.
-- `slug` y el unique de la tabla ya cubren la búsqueda por slug público.
create index if not exists articles_status_published_at_idx
  on public.articles (status, published_at desc);
create index if not exists articles_priority_published_at_idx
  on public.articles (priority desc, published_at desc);
create index if not exists articles_category_id_idx
  on public.articles (category_id);
-- Índice de la consulta de portada, la más caliente del sitio.
create index if not exists articles_published_ranking_idx
  on public.articles (priority desc, published_at desc)
  where status = 'published';

-- ---------------------------------------------------------------------
-- 5. Triggers de reglas editoriales
-- ---------------------------------------------------------------------

-- Garantiza slug único y normalizado sin depender del cliente.
create or replace function public.articles_normalize_slug()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  base_slug text;
  candidate text;
  suffix    integer := 1;
begin
  base_slug := public.slugify(coalesce(nullif(btrim(new.slug), ''), new.title));

  -- Un título que sólo tiene signos (o vacío) no puede quedar sin slug.
  if base_slug = '' then
    base_slug := 'nota';
  end if;

  base_slug := left(base_slug, 80);
  base_slug := trim(both '-' from base_slug);
  candidate := base_slug;

  while exists (
    select 1 from public.articles a
    where a.slug = candidate and (tg_op = 'INSERT' or a.id <> new.id)
  ) loop
    suffix := suffix + 1;
    candidate := base_slug || '-' || suffix;
  end loop;

  new.slug := candidate;
  return new;
end;
$$;

-- Reglas de estado + auditoría.
create or replace function public.articles_apply_editorial_rules()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    -- Una noticia nueva nace borrador salvo que se publique explícitamente.
    if new.status = 'published' and new.published_at is null then
      new.published_at := now();
    end if;
    new.author_id  := coalesce(new.author_id, auth.uid());
    new.updated_by := coalesce(new.updated_by, new.author_id);
    return new;
  end if;

  -- Al publicar recibe published_at. Si ya la tuvo (se archivó y se vuelve a
  -- publicar) se conserva la fecha original: la nota no "rejuvenece" en la
  -- portada por un archivado accidental.
  if new.status = 'published' and old.status <> 'published' and new.published_at is null then
    new.published_at := now();
  end if;

  -- El autor original no se reescribe; sí se registra quién tocó por último.
  new.author_id  := old.author_id;
  new.created_at := old.created_at;
  new.updated_at := now();
  new.updated_by := coalesce(auth.uid(), old.updated_by);
  return new;
end;
$$;

drop trigger if exists articles_normalize_slug_trg on public.articles;
create trigger articles_normalize_slug_trg
  before insert or update of slug, title on public.articles
  for each row execute function public.articles_normalize_slug();

drop trigger if exists articles_editorial_rules_trg on public.articles;
create trigger articles_editorial_rules_trg
  before insert or update on public.articles
  for each row execute function public.articles_apply_editorial_rules();

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at
  before update on public.profiles
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------
-- 6. RLS
--
-- Modelo: el público (anon) sólo lee noticias publicadas. El staff editorial
-- (admin | editor) lee y escribe todo. Nadie más escribe nada.
-- ---------------------------------------------------------------------

alter table public.profiles   enable row level security;
alter table public.categories enable row level security;
alter table public.articles   enable row level security;

-- GRANTS EXPLÍCITOS — NO SON DECORATIVOS.
-- En esta versión de Supabase los privilegios por defecto del rol `postgres`
-- ya NO incluyen lectura ni escritura para anon/authenticated/service_role
-- (`pg_default_acl` les deja sólo Dxtm). Sin estas líneas, PostgREST responde
-- "permission denied for table articles" ANTES de evaluar una sola policy, y
-- el portal público se cae entero. Verificado a mano contra el stack local.
--
-- Los grants abren la puerta; las policies deciden quién pasa.
grant usage on schema public to anon, authenticated, service_role;

grant select on public.articles, public.categories to anon, authenticated;
grant select on public.profiles to authenticated;
grant insert, update on public.articles to authenticated;
grant insert, update, delete on public.categories to authenticated;
grant update on public.profiles to authenticated;

-- `service_role` salta RLS por diseño y sólo se puede usar desde un servidor
-- con la clave secreta. La app de la Etapa 1 NO la usa (todo escribe con la
-- sesión del editor); se le dan privilegios para las tareas de
-- administración: altas de usuarios, imports y los tests de reglas.
grant all on public.articles, public.categories, public.profiles to service_role;

-- profiles ------------------------------------------------------------
drop policy if exists profiles_select_self_or_staff on public.profiles;
create policy profiles_select_self_or_staff on public.profiles
  for select to authenticated
  using (id = auth.uid() or public.is_editorial_staff());

drop policy if exists profiles_update_self_name on public.profiles;
create policy profiles_update_self_name on public.profiles
  for update to authenticated
  using (id = auth.uid())
  -- El rol NO se puede auto-modificar: eso lo hace un admin desde la consola.
  with check (id = auth.uid() and role = public.editorial_role());

drop policy if exists profiles_admin_manage on public.profiles;
create policy profiles_admin_manage on public.profiles
  for update to authenticated
  using (public.is_editorial_admin())
  with check (public.is_editorial_admin());

-- categories ----------------------------------------------------------
drop policy if exists categories_select_public on public.categories;
create policy categories_select_public on public.categories
  for select to anon, authenticated
  using (true);

drop policy if exists categories_staff_insert on public.categories;
create policy categories_staff_insert on public.categories
  for insert to authenticated
  with check (public.is_editorial_staff());

drop policy if exists categories_staff_update on public.categories;
create policy categories_staff_update on public.categories
  for update to authenticated
  using (public.is_editorial_staff())
  with check (public.is_editorial_staff());

drop policy if exists categories_admin_delete on public.categories;
create policy categories_admin_delete on public.categories
  for delete to authenticated
  using (public.is_editorial_admin());

-- articles ------------------------------------------------------------
drop policy if exists articles_select_published on public.articles;
create policy articles_select_published on public.articles
  for select to anon, authenticated
  using (status = 'published');

drop policy if exists articles_select_staff on public.articles;
create policy articles_select_staff on public.articles
  for select to authenticated
  using (public.is_editorial_staff());

drop policy if exists articles_staff_insert on public.articles;
create policy articles_staff_insert on public.articles
  for insert to authenticated
  with check (public.is_editorial_staff());

drop policy if exists articles_staff_update on public.articles;
create policy articles_staff_update on public.articles
  for update to authenticated
  using (public.is_editorial_staff())
  with check (public.is_editorial_staff());

-- NO hay policy de DELETE sobre articles, a propósito: la baja editorial es
-- archivar. Sin policy, RLS deniega y ni un editor puede borrar una nota.
