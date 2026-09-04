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

El proyecto existe desde el 2026-09-04:

| | |
|---|---|
| Ref | `ztuhmauobojsiwgxrhqa` |
| URL | `https://ztuhmauobojsiwgxrhqa.supabase.co` |
| Región | `us-east-2` |
| Pooler | `aws-0-us-east-2.pooler.supabase.com:5432`, usuario `postgres.ztuhmauobojsiwgxrhqa` |

El proyecto vive en una **cuenta dedicada de DigitalMatch**, distinta de la
cuenta personal con la que suele estar logueada la CLI en las máquinas de
desarrollo (por eso `supabase projects list` no lo muestra).

**Opción A — CLI (recomendada).**

⚠️ **No usar `supabase login --token`** para esto: sobreescribe el token
guardado de la máquina y deja sin acceso a los otros proyectos de la casa
(`sitio-evolucion-antoniana`, `WhatsAppBot_Rocket`). El token de DigitalMatch se
pasa por variable de entorno, que sólo vale para ese comando:

```bash
export SUPABASE_ACCESS_TOKEN=<PAT de la cuenta DigitalMatch>   # no queda guardado
supabase link --project-ref ztuhmauobojsiwgxrhqa
supabase db push                                               # pide la contraseña de la base
unset SUPABASE_ACCESS_TOKEN
```

El PAT se genera en <https://supabase.com/dashboard/account/tokens> **estando
logueado con la cuenta de DigitalMatch**.

**Opción B — sobre la connection string**, sin depender de qué cuenta esté
logueada:

```bash
supabase db push --db-url "postgresql://postgres.ztuhmauobojsiwgxrhqa:<PASSWORD>@aws-0-us-east-2.pooler.supabase.com:5432/postgres"
```

Si la contraseña tiene caracteres especiales hay que **percent-encodearla**
dentro de la URL (`&` → `%26`, `/` → `%2F`, `@` → `%40`, `#` → `%23`).

**Opción C — SQL Editor.** Pegar el contenido de cada archivo de `migrations/`
en orden de timestamp. Son idempotentes, así que re-correrlas no rompe nada.

⚠️ La contraseña de la base **no se guarda en el repo ni en `.env`**: la app no
la usa (habla por la API REST con la clave anónima). Sólo hace falta para
aplicar migraciones.

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
