# Backend editorial de Killa TV — esquema y configuración

Esta carpeta versiona el backend de la **Etapa 1**: perfiles, categorías,
noticias, imágenes y las operaciones del panel. Nada más
(ver `../../docs/08-MVP-WEB-TV-500.md` para el alcance cerrado).

```
supabase/
  config.toml     # ajustes públicos del proyecto (sin secretos)
  migrations/     # SQL en orden por timestamp
```

## Migraciones

| Archivo | Qué trae |
|---|---|
| `20260904120000_etapa1_editorial_schema.sql` | `profiles`, `categories`, `articles`, índices, triggers de reglas editoriales y todas las RLS |
| `20260904120100_etapa1_editorial_storage.sql` | bucket `killa-news` + policies + `article_image_in_use()` |
| `20260904120200_etapa1_editorial_seed.sql` | las 3 categorías y las 3 noticias que estaban en `lib/tv-news.ts` |

Las tres son **idempotentes**: se pueden re-correr sin duplicar nada.

## Levantar el entorno local (recomendado para trabajar)

```bash
npm run supabase:start        # necesita Docker corriendo (~8-10 GB de imágenes)
supabase status               # imprime URL y claves locales
npm run supabase:stop         # bajar el stack
```

`supabase start` aplica las migraciones desde cero, así que el stack local es
la forma de probar escrituras y RLS **sin tocar producción**.

Después, en `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<Publishable de `supabase status`>
```

### Crear el primer usuario del panel

No hay alta pública (`auth.enable_signup = false`), así que las cuentas las crea
un administrador. En local, desde el Studio: <http://127.0.0.1:54323> →
Authentication → Add user (con "Auto Confirm User" tildado).

El trigger `on_auth_user_created_editorial` le arma el perfil con rol `editor`.
Para hacerlo `admin`:

```sql
update public.profiles set role = 'admin' where id = '<uuid del usuario>';
```

En el proyecto real es lo mismo desde la consola de Supabase. También se puede
pasar `display_name` (y `role: "admin"`) en el *user metadata* del alta: el
trigger los toma.

## Aplicar al proyecto real

⚠️ **El proyecto Supabase de Killa todavía no existe.** `config.toml` lleva
`project_id = "killa-web"` como nombre local. Cuando se cree en la
organización de DMG (ver `../../../INFRAESTRUCTURA-DMG.md`):

```bash
supabase login
supabase link --project-ref <ref-real>
supabase db push              # aplica las migraciones pendientes
```

⚠️ **Nunca `supabase config push`.** Sobreescribe la configuración de Auth del
proyecto remoto con lo que haya en este archivo y ya nos costó un incidente en
otro proyecto de la casa. Los ajustes de Auth en producción se cambian por
consola o Management API; `config.toml` gobierna el stack **local**.

Al crear el proyecto real hay que verificar a mano dos cosas que `config.toml`
no empuja: que el **registro público esté deshabilitado** y que el bucket
`killa-news` haya quedado con sus policies.

## Decisiones de seguridad que conviene no revertir sin pensarlo

- **El público (`anon`) sólo ve `status = 'published'`.** Los borradores y las
  archivadas no salen ni con la consulta equivocada: lo impide la policy, no el
  código de la app.
- **`articles` no tiene policy de DELETE.** La baja editorial es archivar. Ni
  un admin puede borrar una nota por API.
- **El rol se lee de `public.profiles`, no del JWT.** Revocarle el acceso a
  alguien tiene efecto inmediato, sin esperar que expire su token.
- **El bucket es de lectura pública y escritura restringida.** Es a propósito:
  los crawlers de WhatsApp y las redes piden la imagen de Open Graph sin sesión
  y meses después de publicada la nota; una URL firmada expira y la vista
  previa se rompe. La cabecera de la migración de storage lo explica en largo.
- **La app no usa `service_role` en ningún camino.** Todo escribe con la sesión
  del editor, así que un bug de la capa de datos no puede saltear la RLS. La
  clave secreta sólo aparece en los tests de reglas, que corren en local.
- **Los `grant` de la migración no son decorativos.** En esta versión de
  Supabase las tablas nuevas NO heredan privilegios de lectura para
  `anon`/`authenticated`/`service_role`: sin los grants explícitos, PostgREST
  contesta `permission denied for table articles` antes de mirar una policy.
  Verificado a mano; si se agrega una tabla, hay que darle sus grants.

## Validar el esquema y las reglas

```bash
npm run test              # unitarios: ranking, saneamiento, validación, mapeo
npm run test:rules        # RLS y reglas de la base, contra el stack local real
npm run test:e2e          # criterios de aceptación por HTTP (requiere el sitio levantado)
```

`test:rules` y `test:e2e` abortan si la URL de Supabase no es local: crean
usuarios y escriben notas, y no deben correr nunca contra producción.
