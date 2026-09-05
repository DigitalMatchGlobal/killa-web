-- =====================================================================
-- KILLA TV — Etapa 1: datos iniciales.
--
-- 1. Las tres categorías pedidas: Noticias, Deportes, Turismo.
-- 2. Las tres noticias que hoy están hardcodeadas en lib/tv-news.ts.
--
-- DECISIÓN SOBRE LAS CATEGORÍAS DEL CONTENIDO MIGRADO
-- Las tres notas del mockup traían etiquetas propias ("Institucional",
-- "Killa", "Servicios") que no están entre las tres categorías del brief. Se
-- migran todas a **Noticias** en vez de inventar secciones nuevas. Cuando el
-- equipo de prensa defina su árbol real, reasigna desde el panel; el dato
-- original queda en el historial de git de lib/tv-news.ts.
--
-- PRIORIDADES: las tres quedan en 1 (sin prioridad especial), así la portada
-- se resuelve por fecha y muestra exactamente la misma nota que mostraba el
-- mockup estático. Es la regla "si no existen prioridades especiales, aparece
-- la noticia más reciente" ejercitada con datos reales.
--
-- Idempotente: cada fila se inserta sólo si no existe su slug. No se usa
-- `on conflict do nothing` porque el trigger `articles_normalize_slug_trg`
-- desambiguaría el slug antes del conflicto y crearía duplicados con sufijo.
-- =====================================================================

insert into public.categories (name, slug)
values
  ('Noticias', 'noticias'),
  ('Deportes', 'deportes'),
  ('Turismo',  'turismo')
on conflict (slug) do nothing;

do $$
declare
  noticias_id uuid;
begin
  select id into noticias_id from public.categories where slug = 'noticias';

  -- 1 -----------------------------------------------------------------
  if not exists (select 1 from public.articles where slug = 'killa-conecta-cuatro-provincias') then
    insert into public.articles
      (title, slug, excerpt, body, category_id, featured_image_path, image_alt,
       status, priority, published_at, created_at)
    values (
      'Killa conecta comunidades en cuatro provincias del norte',
      'killa-conecta-cuatro-provincias',
      'Una red regional que une localidades de Jujuy, Salta, Tucumán y Catamarca.',
      'La infraestructura de Killa alcanza comunidades de Jujuy, Salta, Tucumán y Catamarca, con presencia en el Ramal norte y a lo largo de los Valles Calchaquíes.'
        || E'\n\n' ||
      'El despliegue combina fibra, redes de datos y enlaces dedicados para acompañar las necesidades de hogares, empresas e instituciones de la región.'
        || E'\n\n' ||
      'Este contenido forma parte de la carga editorial inicial de demostración. El equipo de Killa TV podrá reemplazarlo, editarlo y publicarlo desde su panel privado.',
      noticias_id,
      '/news/alcance-regional.jpg',
      'Mapa institucional del alcance regional de Killa',
      'published', 1,
      '2026-08-30 12:00:00-03', '2026-08-30 12:00:00-03'
    );
  end if;

  -- 2 -----------------------------------------------------------------
  if not exists (select 1 from public.articles where slug = 'dos-unidades-una-misma-red') then
    insert into public.articles
      (title, slug, excerpt, body, category_id, featured_image_path, image_alt,
       status, priority, published_at, created_at)
    values (
      'Dos unidades, una misma red: Killa Internet y Killa TV',
      'dos-unidades-una-misma-red',
      'Conectividad y comunicación regional reunidas bajo una misma empresa.',
      'Killa desarrolla dos unidades complementarias: una dedicada a la infraestructura de comunicaciones y otra enfocada en contenidos regionales.'
        || E'\n\n' ||
      'Killa Internet conecta hogares, empresas y comunidades. Killa TV refleja la identidad, la cultura y la actualidad de las localidades donde la empresa está presente.'
        || E'\n\n' ||
      'El nuevo portal editorial busca que esas historias puedan publicarse y compartirse sin depender de asistencia técnica.',
      noticias_id,
      '/news/dos-unidades.jpg',
      'Presentación institucional de Killa Internet y Killa TV',
      'published', 1,
      '2026-08-30 11:00:00-03', '2026-08-30 11:00:00-03'
    );
  end if;

  -- 3 -----------------------------------------------------------------
  if not exists (select 1 from public.articles where slug = 'infraestructura-propia-soluciones-a-medida') then
    insert into public.articles
      (title, slug, excerpt, body, category_id, featured_image_path, image_alt,
       status, priority, published_at, created_at)
    values (
      'Infraestructura propia y soluciones a medida para el norte',
      'infraestructura-propia-soluciones-a-medida',
      'Redes FTTH, conexiones dedicadas y proyectos de telecomunicaciones llave en mano.',
      'Killa implementa soluciones de telecomunicaciones para hogares, empresas, municipios e instituciones del norte argentino.'
        || E'\n\n' ||
      'Los servicios incluyen redes de fibra al hogar, conexiones de internet dedicado, redes de datos y proyectos llave en mano.'
        || E'\n\n' ||
      'La presencia local permite relevar, implementar y sostener cada solución con un equipo que conoce el territorio.',
      noticias_id,
      '/news/infraestructura.jpg',
      'Servicios de telecomunicaciones de Killa Internet',
      'published', 1,
      '2026-08-30 10:00:00-03', '2026-08-30 10:00:00-03'
    );
  end if;
end
$$;
