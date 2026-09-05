-- =====================================================================
-- KILLA TV — Etapa 1: el rol `admin` deja de ser auto-asignable.
--
-- QUÉ CAMBIA
-- `handle_new_editorial_user()` leía `raw_user_meta_data ->> 'role'` y, si
-- decía "admin", creaba el perfil como admin. Ahora ese campo se **ignora por
-- completo**: todo usuario nuevo nace `editor`, sin excepción.
--
-- POR QUÉ
-- `raw_user_meta_data` es metadata del usuario, no una fuente de autoridad. En
-- el flujo previsto la llenaba un admin desde la consola, pero:
--
--   * si algún día se reabre el registro público (o se habilita un proveedor
--     OAuth, o una Edge Function crea usuarios con metadata del cliente), ese
--     campo pasa a estar bajo control de quien se registra, y el privilegio
--     más alto del sistema queda a un JSON de distancia;
--   * el proyecto real venía con `disable_signup: false`, así que ese escenario
--     no era hipotético: era el estado de fábrica.
--
-- La promoción a admin pasa a ser una **operación administrativa explícita**,
-- deliberadamente incómoda y auditable, contra la tabla:
--
--     update public.profiles set role = 'admin' where id = '<uuid>';
--
-- NO TOCA LOS PERFILES EXISTENTES. Esta migración cambia sólo el
-- comportamiento del alta futura: quien ya es admin sigue siéndolo. Si hiciera
-- un `update` retroactivo podría dejar el proyecto sin ningún admin, y encima
-- pisaría una decisión que alguien tomó a mano.
--
-- `display_name` se sigue tomando de la metadata: es un nombre para mostrar,
-- no un permiso.
--
-- Idempotente: `create or replace` + `drop trigger if exists`.
-- =====================================================================

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
    -- Siempre 'editor'. `raw_user_meta_data ->> 'role'` se ignora a propósito:
    -- ver la cabecera. La promoción a admin es un UPDATE explícito.
    'editor'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

comment on function public.handle_new_editorial_user() is
  'Crea el perfil editorial de un usuario nuevo, SIEMPRE con rol editor. Ignora raw_user_meta_data.role: la promoción a admin es una operación administrativa explícita (update public.profiles set role = ''admin'').';

-- El trigger no cambia de forma, pero se re-declara para que la migración sea
-- autosuficiente si alguien la corre sobre una base donde se perdió.
drop trigger if exists on_auth_user_created_editorial on auth.users;
create trigger on_auth_user_created_editorial
  after insert on auth.users
  for each row execute function public.handle_new_editorial_user();
