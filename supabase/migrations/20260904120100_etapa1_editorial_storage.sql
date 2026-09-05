-- =====================================================================
-- KILLA TV — Etapa 1: bucket de imágenes editoriales.
--
-- POR QUÉ EL BUCKET ES DE LECTURA PÚBLICA Y NO PRIVADO CON URL FIRMADA
-- El criterio de aceptación 7 pide que las notas queden listas para SEO y
-- vistas previas sociales. Los crawlers de WhatsApp, Facebook y X piden la
-- imagen de Open Graph **sin sesión y semanas después** de publicada la nota:
-- una URL firmada expira y la vista previa se rompe (aparece la tarjeta sin
-- imagen). Por eso la protección va del lado de la escritura, que es lo que
-- realmente importa: subir, reemplazar y borrar queda restringido al staff
-- editorial por RLS. La lectura de una foto de prensa ya publicada no es
-- información sensible.
--
-- El límite inicial de 5 MB y los tres tipos permitidos se declaran acá **además** de
-- validarse en el servidor: si alguien consigue un token de editor y sube por
-- la API directa, el bucket rechaza igual.
-- Una migración posterior baja el techo a 3 MB. Por eso, si este archivo
-- histórico se ejecuta manualmente sobre un bucket existente, el `on conflict`
-- preserva el límite vigente en vez de restaurar 5 MB por accidente.
--
-- La guarda `to_regclass` replica el patrón de sitio-evolucion-antoniana: el
-- esquema `storage` lo crea storage-api, no la imagen de Postgres. En un
-- proyecto Supabase existe desde el minuto cero; en un Postgres pelado (por
-- ejemplo, validando el esquema sin levantar el stack completo) no, y ahí esta
-- migración se saltea con un aviso en vez de romper la cadena.
-- =====================================================================

do $$
begin
  if to_regclass('storage.buckets') is null then
    raise notice 'storage.buckets no existe: se omite el bucket killa-news y sus policies. Esperado en un Postgres pelado; NO esperado en un proyecto Supabase.';
    return;
  end if;

  insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  values (
    'killa-news',
    'killa-news',
    true,
    5242880, -- 5 MB
    array['image/jpeg', 'image/png', 'image/webp']
  )
  on conflict (id) do update
    set public             = excluded.public,
        allowed_mime_types = excluded.allowed_mime_types;

  -- Lectura: cualquiera, incluidos los crawlers sociales (ver cabecera).
  execute $ddl$ drop policy if exists killa_news_read on storage.objects $ddl$;
  execute $ddl$
    create policy killa_news_read on storage.objects
      for select to anon, authenticated
      using (bucket_id = 'killa-news')
  $ddl$;

  -- Escritura: sólo staff editorial.
  execute $ddl$ drop policy if exists killa_news_insert on storage.objects $ddl$;
  execute $ddl$
    create policy killa_news_insert on storage.objects
      for insert to authenticated
      with check (bucket_id = 'killa-news' and public.is_editorial_staff())
  $ddl$;

  execute $ddl$ drop policy if exists killa_news_update on storage.objects $ddl$;
  execute $ddl$
    create policy killa_news_update on storage.objects
      for update to authenticated
      using (bucket_id = 'killa-news' and public.is_editorial_staff())
      with check (bucket_id = 'killa-news' and public.is_editorial_staff())
  $ddl$;

  -- Borrado: sólo staff, y la capa de servidor exige además que la imagen ya
  -- no esté referenciada por ninguna nota (public.article_image_in_use).
  execute $ddl$ drop policy if exists killa_news_delete on storage.objects $ddl$;
  execute $ddl$
    create policy killa_news_delete on storage.objects
      for delete to authenticated
      using (bucket_id = 'killa-news' and public.is_editorial_staff())
  $ddl$;
end
$$;

-- ¿Alguna nota (en cualquier estado, incluidas las archivadas) sigue usando
-- esta imagen? Es la condición de "eliminación controlada" del brief: una nota
-- archivada puede volver a publicarse, así que su imagen no se borra.
--
-- SECURITY DEFINER porque debe ver borradores y archivadas de todo el equipo,
-- no sólo lo que el invocador alcanza por RLS. No devuelve contenido: sólo un
-- booleano sobre una key que el invocador ya conoce.
create or replace function public.article_image_in_use(image_path text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.articles a
    where a.featured_image_path = image_path
  );
$$;

revoke all on function public.article_image_in_use(text) from public, anon;
grant execute on function public.article_image_in_use(text) to authenticated;
