/**
 * Selector único de localidades para la web.
 *
 * Une las tres fuentes verificadas que ya existían por separado:
 *  - `coverageLocalities` (lib/network.ts): localidad → corredor + nodo + oficina.
 *  - `serviceZones` (lib/network.ts): nombre del corredor.
 *  - `coverage` (lib/network.ts): provincia real de cada localidad.
 *  - `offices` (lib/site.ts): dirección, teléfono y horarios de la oficina.
 *
 * Antes la sección de planes tenía su propia lista de zonas (sólo id + label),
 * duplicada y sin estos datos. Ahora planes y el explorador de cobertura comen
 * de la misma fuente. Nada de esto es inventado: todo sale del relevamiento.
 */
import { coverage, coverageLocalities, serviceZones } from "./network";
import { offices } from "./site";

export function normalizeText(value: string) {
  return value.normalize("NFD").replace(/[̀-ͯ]/g, "").toLocaleLowerCase("es").trim();
}

type OfficeInfo = {
  city: string;
  province: string;
  address: string;
  phone: string;
  phoneHref?: string;
  hours: string;
  /** Alias para pagos por transferencia de la zona (titular: KILLA COMUNICACIONES SRL). */
  alias: string;
};

export type LocalityDetail = {
  id: string;
  name: string;
  nodeId: string;
  /** Corredor operativo (Ramal Norte / Valles Calchaquíes). */
  corridor: string;
  /** Provincia real de la localidad. */
  province: string;
  /** Oficina Killa de referencia más cercana. */
  office: OfficeInfo;
  /** Cafayate maneja tarifa diferenciada (único dato de precio verificado). */
  higherTariff: boolean;
  aliases: readonly string[];
};

const provinceByTown = new Map<string, string>();
for (const group of coverage) {
  for (const town of group.towns) provinceByTown.set(normalizeText(town), group.province);
}

function findOffice(supportOffice: string): OfficeInfo {
  const office =
    offices.find((o) => o.city === supportOffice) ??
    offices.find((o) => o.city.startsWith(supportOffice)) ??
    offices[0];
  return {
    city: office.city,
    province: office.province,
    address: office.address,
    phone: office.phone,
    phoneHref: "phoneHref" in office ? office.phoneHref : undefined,
    hours: office.hours,
    alias: office.alias,
  };
}

export const localityDetails: LocalityDetail[] = coverageLocalities.map((loc) => {
  const zone = serviceZones.find((z) => z.id === loc.zoneId);
  const aliases = "aliases" in loc ? loc.aliases : [];
  const province =
    [loc.name, ...aliases]
      .map((candidate) => provinceByTown.get(normalizeText(candidate)))
      .find(Boolean) ?? "";
  return {
    id: loc.id,
    name: loc.name,
    nodeId: loc.nodeId,
    corridor: zone?.name ?? "",
    province,
    office: findOffice(loc.supportOffice),
    higherTariff: loc.id === "cafayate",
    aliases,
  };
});

export function findLocality(id: string) {
  return localityDetails.find((loc) => loc.id === id);
}

export function matchLocality(loc: LocalityDetail, query: string) {
  const needle = normalizeText(query);
  if (!needle) return true;
  return [loc.name, ...loc.aliases].some((candidate) => normalizeText(candidate).includes(needle));
}

/** Evento que la sección de planes usa para enfocar una localidad en el mapa. */
export const FOCUS_LOCALITY_EVENT = "killa:focus-locality";
