/**
 * Contenido inicial de demostración para el mockup editorial.
 *
 * Se construye sobre el material institucional entregado por Killa. En la
 * implementación final estas entradas llegan desde la base de datos y el panel
 * privado, no desde este archivo.
 */
export const tvNews = [
  {
    slug: "killa-conecta-cuatro-provincias",
    category: "Institucional",
    title: "Killa conecta comunidades en cuatro provincias del norte",
    excerpt:
      "Una red regional que une localidades de Jujuy, Salta, Tucumán y Catamarca.",
    date: "30 de agosto de 2026",
    image: "/news/alcance-regional.jpg",
    imageAlt: "Mapa institucional del alcance regional de Killa",
    body: [
      "La infraestructura de Killa alcanza comunidades de Jujuy, Salta, Tucumán y Catamarca, con presencia en el Ramal norte y a lo largo de los Valles Calchaquíes.",
      "El despliegue combina fibra, redes de datos y enlaces dedicados para acompañar las necesidades de hogares, empresas e instituciones de la región.",
      "Este contenido forma parte de la carga editorial inicial de demostración. El equipo de Killa TV podrá reemplazarlo, editarlo y publicarlo desde su panel privado.",
    ],
  },
  {
    slug: "dos-unidades-una-misma-red",
    category: "Killa",
    title: "Dos unidades, una misma red: Killa Internet y Killa TV",
    excerpt:
      "Conectividad y comunicación regional reunidas bajo una misma empresa.",
    date: "30 de agosto de 2026",
    image: "/news/dos-unidades.jpg",
    imageAlt: "Presentación institucional de Killa Internet y Killa TV",
    body: [
      "Killa desarrolla dos unidades complementarias: una dedicada a la infraestructura de comunicaciones y otra enfocada en contenidos regionales.",
      "Killa Internet conecta hogares, empresas y comunidades. Killa TV refleja la identidad, la cultura y la actualidad de las localidades donde la empresa está presente.",
      "El nuevo portal editorial busca que esas historias puedan publicarse y compartirse sin depender de asistencia técnica.",
    ],
  },
  {
    slug: "infraestructura-propia-soluciones-a-medida",
    category: "Servicios",
    title: "Infraestructura propia y soluciones a medida para el norte",
    excerpt:
      "Redes FTTH, conexiones dedicadas y proyectos de telecomunicaciones llave en mano.",
    date: "30 de agosto de 2026",
    image: "/news/infraestructura.jpg",
    imageAlt: "Servicios de telecomunicaciones de Killa Internet",
    body: [
      "Killa implementa soluciones de telecomunicaciones para hogares, empresas, municipios e instituciones del norte argentino.",
      "Los servicios incluyen redes de fibra al hogar, conexiones de internet dedicado, redes de datos y proyectos llave en mano.",
      "La presencia local permite relevar, implementar y sostener cada solución con un equipo que conoce el territorio.",
    ],
  },
] as const;

export type TvNewsItem = (typeof tvNews)[number];

export function getTvNews(slug: string) {
  return tvNews.find((article) => article.slug === slug);
}
