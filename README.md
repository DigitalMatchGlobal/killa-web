# killa-web · Landing institucional + Killa TV

**Estado:** landing en primera iteración de diseño, lista para mostrar; **backend
editorial de Killa TV implementado y verificado en local**. Nada aprobado, nada
publicado, ningún proyecto Supabase real creado todavía.
**Última actualización:** 2026-09-04

Es la primera etapa del proyecto P3 del programa (web institucional + Killa TV).
El resto del relevamiento vive en [`../docs/`](../docs/); la oferta comercial que
esta pieza acompaña es [`../docs/08-MVP-WEB-TV-500.md`](../docs/08-MVP-WEB-TV-500.md).

```bash
npm install
npm run dev      # http://localhost:3000
npm run build
npm run preview:lan  # preview optimizado en http://0.0.0.0:4321
```

---

## 1. Qué es y qué no es

**Es** una landing completa y navegable: hero, ecosistema de unidades de negocio,
planes de hogar, servicios empresariales, cobertura en cuatro provincias con
oficinas, banda de Killa TV, quiénes somos y
contacto. Todo el contenido salió del sitio actual (killa.com.ar) y del
relevamiento; **nada está inventado**.

**No es** todavía:

- el portal de noticias de Killa TV con carga propia (portada, nota, editores) —
  es lo que está presupuestado en el doc 08 y se construye sobre esta misma base;
- el área de clientes ni nada que toque Mikrowisp;
- un sitio con precios publicados (ver §3).

---

## 2. La decisión de diseño que sostiene todo: el corredor

El hero **no** tiene una foto de stock de fibra óptica. Tiene el activo real de
la empresa: su red.

[`lib/network.ts`](lib/network.ts) guarda las coordenadas geográficas de las 18
localidades que Killa muestra en su material institucional y los corredores que
las unen — de Jujuy a Catamarca, atravesando los Valles Calchaquíes.
[`components/visual/network-corridor.tsx`](components/visual/network-corridor.tsx)
lo proyecta a pantalla con corrección de aspecto y le manda pulsos de luz.

Tres razones por las que vale la pena:

1. **Es la sección más consultada, puesta en el hero.** La primera pregunta de
   todo visitante de un ISP regional es "¿llegás a mi casa?". Acá la respuesta
   está antes de hacer scroll.
2. **No se puede reutilizar en otro cliente.** La forma del dibujo es la
   geografía de Killa. Eso es lo contrario de una plantilla.
3. **La lista de localidades es una sola.** La sección de cobertura lee el mismo
   archivo, así que el mapa y la lista no se pueden desincronizar.

### Cómo se adapta al celular (y el número que manda)

🔴 **La ventana real de Safari en un iPhone 13 mide 664 px de alto, no 844.**
Las barras del navegador se comen 180 px, y en un iPhone SE queda en 553. Ese
es el número contra el que está dimensionado el hero, porque el cliente abre el
link desde el teléfono y la primera pantalla es todo lo que ve.

En 664 px no entran a la vez el titular, el texto, los botones y un mapa
rotulado: el mapa queda fuera del pliegue, y metido a la fuerza deja los nodos
nodos a 24 px unos de otros con las etiquetas pisándose. Así que el mapa cambia
de rol según el ancho de **ventana** (breakpoint `lg`, 1024 px):

| | Celular | Escritorio |
|---|---|---|
| Hero | mapa **de fondo, sin rótulos** y más tenue, detrás del texto | mapa rotulado en la columna derecha |
| Cobertura | mapa **rotulado**, en un bloque con alto propio | ídem |

Así el hero entra completo en cualquier teléfono y **sigue teniendo
movimiento**, y el mapa se lee de verdad una pantalla más abajo. Las cifras
(13+ años, 18 localidades…) salieron del hero a su propia banda por la misma
razón: ocupaban 92 px del pliegue.

En ventanas de hasta 620 px de alto el hero usa una versión más corta del
eyebrow y del párrafo. Además, `ViewportHeightSync` toma la altura visible
inicial de `visualViewport` como respaldo para versiones de WebKit que todavía
miden `100vh` detrás de las barras de Safari.

Para revisar desde un teléfono se usa `npm run preview:lan`: el modo desarrollo
de Next bloquea por defecto recursos de depuración pedidos desde la IP local y
además muestra su indicador flotante. El preview de producción evita ambos.

⚠️ El corte se mide contra `window.innerWidth`, **no** contra el ancho del
lienzo: en escritorio la columna del mapa mide ~640 px y se leería como
"angosta", con lo que el hero de escritorio perdía los nombres.

**Accesibilidad:** el lienzo es `aria-hidden` y el hero lleva la misma
información en texto para lectores de pantalla. Con `prefers-reduced-motion` el
mapa se dibuja una sola vez, sin pulsos, sin pings y sin animación de entrada.

---

## 3. Por qué no hay precios

El sitio actual dice "Consultar precio" en los tres planes, y el relevamiento
explica por qué: **Cafayate maneja tarifas más altas que el resto del valle**
([`../docs/00-CONTEXTO.md`](../docs/00-CONTEXTO.md) §1).

En vez de esconder eso, la sección de planes lo convierte en su mecanismo: un
selector de zona que arma el mensaje de WhatsApp con el plan y la localidad ya
escritos. El visitante hace un toque y del otro lado llega una consulta
calificada, no un "hola".

Cuando se conecte Mikrowisp, **ese mismo selector muestra el precio real por
zona sin rehacer la sección** — es el requerimiento WEB-03 de
[`../docs/02-REQUERIMIENTOS.md`](../docs/02-REQUERIMIENTOS.md), ya con su lugar
hecho en la interfaz.

---

## 4. Sistema de diseño

Todo vive en [`app/globals.css`](app/globals.css).

| | |
|---|---|
| **Fondo oscuro** | No es una preferencia estética: el logotipo de Killa es blanco sobre transparente y sólo funciona sobre oscuro. |
| **Cian `#00BCE8`** | Es el color de marca tal cual está hoy en killa.com.ar. No se cambió nada. |
| **Arena `#E9D0A0`** | Acento secundario, exclusivo de Killa TV: el medio necesita voz propia sin salirse de la marca. Y el resplandor cálido del hero — *killa* es luna en quechua. |
| **Nodo cian con halo** | El isotipo es una esfera con meridianos y nodos. Ese punto se repite en eyebrows, viñetas y mapa para que el sitio hable el idioma del logo. |
| **Sora / Inter / JetBrains Mono** | Display, lectura y etiquetas técnicas. Las tres de Google Fonts, servidas por `next/font` (sin request a terceros). |

### Tres gotchas caros que ya están resueltos acá

- ⚠️ **Los tokens de color se registran en `@theme` como `rgb(var(--x))`, sin
  `<alpha-value>`.** Esa es sintaxis de Tailwind **v3**; en v4 queda como valor
  inválido y `text-cyan` / `border-line` caen a `currentColor`. El sitio pierde
  todos los colores **sin tirar un solo error**. Pasó en este proyecto y costó
  una vuelta entera de capturas darse cuenta.
- ⚠️ **Probar en WebKit, no sólo en Chrome.** El motor de todo navegador en
  iOS es WebKit, y su ventana útil es mucho más baja de lo que sugiere el
  tamaño nominal del teléfono. Todo el hero se rehízo por esto.
- ⚠️ **Las clases propias (`.btn`, `.card`, `.eyebrow`…) van dentro de
  `@layer components`.** Sin la capa ganan por orden de aparición y anulan
  utilidades puestas en el mismo elemento: `class="btn hidden sm:inline-flex"`
  se mostraba siempre porque `.btn { display: inline-flex }` pisaba a `hidden`.

---

## 5. Pendientes antes de publicar

Marcados con `TODO(cliente)` en el código.

| # | Qué falta | Dónde |
|---|---|---|
| 1 | **Confirmar el WhatsApp.** Hoy los ~10 CTA apuntan al teléfono general (`+54 9 3868 45-4000`). Si hay otra línea — o cuando Matchbot tome la atención — se cambia en un solo lugar. | [`lib/site.ts`](lib/site.ts) |
| 2 | **Logotipo vectorial.** Hoy es un PNG bajado del sitio actual. Pedir el SVG o el AI. | [`public/brand/`](public/brand/) |
| 3 | **Grafía oficial.** El logo usa `killa` en minúscula, el dominio es killa.com.ar y los docs internos escriben KILLA. Cerrarlo antes de producir nada más. | — |
| 4 | **Lista definitiva de localidades.** Las 18 del mapa salen del material institucional compartido por Killa en redes. Hay que confirmarlas una por una antes de publicar. | [`lib/network.ts`](lib/network.ts) |
| 5 | **Fotos reales del valle y del equipo técnico.** Es lo único que le falta a la página para dejar de ser sólo gráfica. | — |
| 6 | ~~Novedades / Killa TV con carga propia.~~ **Hecho**: el backend editorial está implementado. Falta crear el proyecto Supabase real y las cuentas del equipo de prensa. | [`docs/BACKEND-ETAPA-1.md`](docs/BACKEND-ETAPA-1.md) |

Nada de esto bloquea mostrar la iteración: son datos, no desarrollo.

---

## 6. Stack

Next.js 16 (App Router) · React 19 · Tailwind 4 · lucide-react · **Supabase**
(Postgres + Auth + Storage) para Killa TV.

Es deliberadamente el mismo stack de `GRUPO-LP` y `BPORT/opcion-a`, y **el mismo
sobre el que se monta el portal de noticias del doc 08** — que necesita Next sí o
sí para que las notas compartidas por WhatsApp salgan con foto y titular. La
landing no se tiró al llegar esa etapa: se le agregaron rutas, como estaba
previsto.

La home institucional sigue siendo estática. Lo que usa base es Killa TV.

---

## 7. Killa TV: portal editorial (Etapa 1)

El portal de noticias y su panel privado están implementados sobre Supabase.

| Ruta | Qué es |
|---|---|
| `/tv` | Portada: destacada manual + últimas publicaciones |
| `/tv/noticias/[slug]` | La nota, con Open Graph para WhatsApp y redes |
| `/tv/categoria/[slug]` | Sección, con paginación |
| `/tv/panel` | Panel privado del equipo de prensa (requiere sesión) |

Para levantarlo en local:

```bash
npm run supabase:start        # stack local (necesita Docker)
cp .env.example .env.local    # completar con lo que imprime `supabase status`
npm run dev
```

Sin variables de entorno el portal **no se rompe**: cae al contenido estático de
`lib/tv-news.ts` y avisa por consola. Es fallback de desarrollo, no de
producción.

- Configuración, migraciones y cómo crear el primer usuario: [`supabase/README.md`](supabase/README.md)
- Decisiones, verificación y pendientes: [`docs/BACKEND-ETAPA-1.md`](docs/BACKEND-ETAPA-1.md)

```bash
npm run test           # reglas puras (destacada, saneamiento, validación)
npm run test:rules     # RLS contra un Postgres real
npm run test:e2e       # criterios de aceptación por HTTP
npm run test:desbordes # desbordes horizontales en anchos de teléfono reales
```

`test:desbordes` necesita el sitio levantado (`npm run dev` o `npm start`) y
Playwright instalado aparte (`npm i -D playwright`); usa el Chrome del sistema,
no baja navegadores. Recorre las rutas públicas de 320 px a 1280 px y falla si
algo se sale del ancho de la pantalla. Vale la pena correrlo antes de publicar
cambios de maquetado: `body` tiene `overflow-x: hidden`, así que un desborde no
se ve como una barra de scroll sino como texto cortado contra el margen derecho
—invisible en desktop, evidente en el celular—.
