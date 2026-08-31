/**
 * El corredor regional de Killa.
 *
 * Las localidades y provincias provienen del material institucional publicado
 * por Killa en sus redes. Las coordenadas sólo proyectan la geografía en el
 * lienzo; el mapa es una visualización de alcance, no un plano técnico de obra.
 * TODO(cliente): confirmar la lista definitiva y la traza antes de publicar.
 */

export type NetworkNode = {
  id: string;
  name: string;
  lat: number;
  lon: number;
  /** office = oficina comercial. hub = nodo visual regional. */
  kind: "office" | "town" | "hub";
};

export const nodes: NetworkNode[] = [
  { id: "yuto", name: "Yuto", lat: -23.64, lon: -64.47, kind: "office" },
  { id: "caimancito", name: "Caimancito", lat: -23.74, lon: -64.59, kind: "town" },
  { id: "libertador", name: "Libertador G. S. M.", lat: -23.81, lon: -64.79, kind: "hub" },
  { id: "lapoma", name: "La Poma", lat: -24.72, lon: -66.2, kind: "town" },
  { id: "payogasta", name: "Payogasta", lat: -25.05, lon: -66.1, kind: "town" },
  { id: "cachi", name: "Cachi", lat: -25.12, lon: -66.16, kind: "office" },
  { id: "seclantas", name: "Seclantás", lat: -25.28, lon: -66.27, kind: "town" },
  { id: "brealito", name: "Brealito", lat: -25.283745912, lon: -66.355745011, kind: "town" },
  { id: "luracatao", name: "Luracatao", lat: -25.24598911, lon: -66.435332593, kind: "town" },
  { id: "molinos", name: "Molinos", lat: -25.44, lon: -66.31, kind: "town" },
  { id: "angastaco", name: "Angastaco", lat: -25.68, lon: -66.14, kind: "town" },
  { id: "sancarlos", name: "San Carlos", lat: -25.89, lon: -65.93, kind: "town" },
  { id: "animana", name: "Animaná", lat: -25.97, lon: -65.98, kind: "town" },
  { id: "cafayate", name: "Cafayate", lat: -26.07, lon: -65.97, kind: "office" },
  { id: "tolombon", name: "Tolombón", lat: -26.2, lon: -65.93, kind: "town" },
  { id: "colalao", name: "Colalao del Valle", lat: -26.36, lon: -65.95, kind: "hub" },
  { id: "quilmes", name: "Quilmes", lat: -26.47, lon: -66.04, kind: "town" },
  { id: "fuerte", name: "Fuerte Quemado", lat: -26.63, lon: -66.05, kind: "town" },
  { id: "santamaria", name: "Santa María", lat: -26.69, lon: -66.05, kind: "hub" },
  { id: "sanjose", name: "San José", lat: -26.82, lon: -66.05, kind: "town" },
];

export type NetworkEdge = {
  from: string;
  to: string;
  kind: "trunk" | "feed";
  bend: number;
};

export const edges: NetworkEdge[] = [
  { from: "libertador", to: "caimancito", kind: "trunk", bend: 0.08 },
  { from: "caimancito", to: "yuto", kind: "trunk", bend: -0.06 },
  { from: "lapoma", to: "payogasta", kind: "trunk", bend: 0.08 },
  { from: "payogasta", to: "cachi", kind: "trunk", bend: -0.06 },
  { from: "cachi", to: "seclantas", kind: "trunk", bend: -0.08 },
  { from: "seclantas", to: "brealito", kind: "feed", bend: 0.08 },
  { from: "brealito", to: "luracatao", kind: "feed", bend: -0.06 },
  { from: "seclantas", to: "molinos", kind: "trunk", bend: 0.07 },
  { from: "molinos", to: "angastaco", kind: "trunk", bend: -0.1 },
  { from: "angastaco", to: "sancarlos", kind: "trunk", bend: 0.09 },
  { from: "sancarlos", to: "animana", kind: "trunk", bend: -0.07 },
  { from: "animana", to: "cafayate", kind: "trunk", bend: 0.06 },
  { from: "cafayate", to: "tolombon", kind: "trunk", bend: -0.07 },
  { from: "tolombon", to: "colalao", kind: "trunk", bend: 0.07 },
  { from: "colalao", to: "quilmes", kind: "feed", bend: -0.12 },
  { from: "quilmes", to: "fuerte", kind: "trunk", bend: 0.06 },
  { from: "fuerte", to: "santamaria", kind: "trunk", bend: -0.05 },
  { from: "santamaria", to: "sanjose", kind: "trunk", bend: 0.06 },
];

export const nodeById = new Map(nodes.map((node) => [node.id, node]));

export const coverage = [
  {
    province: "Jujuy",
    detail: "Ramal norte",
    towns: ["Libertador Gral. San Martín", "Caimancito", "Yuto"],
  },
  {
    province: "Salta",
    detail: "Valles Calchaquíes · Ruta Nacional 40",
    towns: [
      "La Poma",
      "Payogasta",
      "Cachi",
      "Seclantás",
      "Brealito",
      "Luracatao",
      "Molinos",
      "Angastaco",
      "San Carlos",
      "Animaná",
      "Cafayate",
      "Tolombón",
    ],
  },
  {
    province: "Tucumán",
    detail: "Valle Calchaquí tucumano",
    towns: ["Quilmes", "Colalao del Valle"],
  },
  {
    province: "Catamarca",
    detail: "Corredor de Santa María",
    towns: ["Fuerte Quemado", "Santa María", "San José"],
  },
] as const;

/**
 * Agrupación comercial de la cobertura. Las provincias siguen dibujadas como
 * referencia geográfica, pero el visitante consulta por corredor de servicio,
 * que es la lógica que Killa utiliza en su comunicación actual.
 */
export const serviceZones = [
  {
    id: "ramal-norte",
    accent: "cyan",
    name: "Ramal Norte",
    province: "Jujuy",
    summary: "Yuto, Caimancito y Libertador",
    towns: ["Yuto", "Caimancito", "Libertador Gral. San Martín"],
    nodeIds: ["libertador", "caimancito", "yuto"],
  },
  {
    id: "valles-calchaquies",
    accent: "sand",
    name: "Valles Calchaquíes",
    province: "Salta · RN 40",
    summary: "De La Poma a Cafayate",
    towns: [
      "La Poma",
      "Payogasta",
      "Cachi",
      "Seclantás",
      "Brealito",
      "Luracatao",
      "Molinos",
      "Angastaco",
      "San Carlos",
      "Animaná",
      "Cafayate",
    ],
    nodeIds: [
      "lapoma",
      "payogasta",
      "cachi",
      "seclantas",
      "molinos",
      "angastaco",
      "sancarlos",
      "animana",
      "cafayate",
    ],
  },
  {
    id: "corredor-sur",
    accent: "mint",
    name: "Corredor Sur",
    province: "Salta · Tucumán · Catamarca",
    summary: "De Tolombón a San José",
    towns: [
      "Tolombón",
      "Colalao del Valle",
      "Quilmes",
      "Fuerte Quemado",
      "Santa María",
      "San José",
    ],
    nodeIds: [
      "tolombon",
      "colalao",
      "quilmes",
      "fuerte",
      "santamaria",
      "sanjose",
    ],
  },
] as const;

export type ServiceZoneId = (typeof serviceZones)[number]["id"];

/**
 * Índice del buscador de cobertura. La oficina asignada es el punto de soporte
 * de referencia más cercano dentro del corredor, no una promesa de factibilidad
 * para un domicilio puntual.
 */
export const coverageLocalities = [
  { id: "yuto", name: "Yuto", nodeId: "yuto", zoneId: "ramal-norte", supportOffice: "Yuto" },
  { id: "caimancito", name: "Caimancito", nodeId: "caimancito", zoneId: "ramal-norte", supportOffice: "Yuto" },
  { id: "libertador", name: "Libertador G. S. M.", nodeId: "libertador", zoneId: "ramal-norte", supportOffice: "Yuto", aliases: ["Libertador General San Martín", "Libertador Gral. San Martín"] },
  { id: "lapoma", name: "La Poma", nodeId: "lapoma", zoneId: "valles-calchaquies", supportOffice: "Cachi" },
  { id: "payogasta", name: "Payogasta", nodeId: "payogasta", zoneId: "valles-calchaquies", supportOffice: "Cachi" },
  { id: "cachi", name: "Cachi", nodeId: "cachi", zoneId: "valles-calchaquies", supportOffice: "Cachi" },
  { id: "seclantas", name: "Seclantás", nodeId: "seclantas", zoneId: "valles-calchaquies", supportOffice: "Cachi" },
  { id: "brealito", name: "Brealito", nodeId: "brealito", zoneId: "valles-calchaquies", supportOffice: "Cachi" },
  { id: "luracatao", name: "Luracatao", nodeId: "luracatao", zoneId: "valles-calchaquies", supportOffice: "Cachi" },
  { id: "molinos", name: "Molinos", nodeId: "molinos", zoneId: "valles-calchaquies", supportOffice: "Cachi" },
  { id: "angastaco", name: "Angastaco", nodeId: "angastaco", zoneId: "valles-calchaquies", supportOffice: "Cafayate" },
  { id: "sancarlos", name: "San Carlos", nodeId: "sancarlos", zoneId: "valles-calchaquies", supportOffice: "Cafayate" },
  { id: "animana", name: "Animaná", nodeId: "animana", zoneId: "valles-calchaquies", supportOffice: "Cafayate" },
  { id: "cafayate", name: "Cafayate", nodeId: "cafayate", zoneId: "valles-calchaquies", supportOffice: "Cafayate" },
  { id: "tolombon", name: "Tolombón", nodeId: "tolombon", zoneId: "corredor-sur", supportOffice: "Cafayate" },
  { id: "colalao", name: "Colalao del Valle", nodeId: "colalao", zoneId: "corredor-sur", supportOffice: "Cafayate" },
  { id: "quilmes", name: "Quilmes", nodeId: "quilmes", zoneId: "corredor-sur", supportOffice: "Cafayate" },
  { id: "fuerte", name: "Fuerte Quemado", nodeId: "fuerte", zoneId: "corredor-sur", supportOffice: "Cafayate" },
  { id: "santamaria", name: "Santa María", nodeId: "santamaria", zoneId: "corredor-sur", supportOffice: "Cafayate" },
  { id: "sanjose", name: "San José", nodeId: "sanjose", zoneId: "corredor-sur", supportOffice: "Cafayate" },
  { id: "caiman", name: "Caimán", nodeId: "caimancito", zoneId: "ramal-norte", supportOffice: "Caimán", aliases: ["Caiman"] },
] as const satisfies readonly {
  id: string;
  name: string;
  nodeId: string;
  zoneId: ServiceZoneId;
  supportOffice: string;
  aliases?: readonly string[];
}[];

export type CoverageLocality = (typeof coverageLocalities)[number];
