-- Killa TV Etapa 1: garantía transaccional de una sola noticia destacada.
--
-- El trigger de la migración anterior ofrece la experiencia editorial normal:
-- al elegir una nueva tapa desmarca la anterior. Este índice parcial agrega la
-- garantía de base que falta cuando dos editores hacen esa operación al mismo
-- tiempo desde transacciones distintas.

-- Defensa para instalaciones que pudieran haber recibido escrituras
-- concurrentes antes de aplicar el índice: conserva la destacada más reciente.
with featured_ranked as (
  select
    id,
    row_number() over (
      order by published_at desc nulls last, updated_at desc, id
    ) as position
  from public.articles
  where is_featured = true
)
update public.articles as article
set is_featured = false
from featured_ranked
where article.id = featured_ranked.id
  and featured_ranked.position > 1;

create unique index if not exists articles_una_sola_destacada
  on public.articles (is_featured)
  where is_featured = true;

-- Eran índices de la regla anterior, donde `priority` decidía la portada.
-- La prioridad queda guardada para una etapa futura, pero ninguna consulta de
-- Etapa 1 ordena por ella.
drop index if exists public.articles_priority_published_at_idx;
drop index if exists public.articles_published_ranking_idx;

