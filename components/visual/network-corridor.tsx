"use client";

import { useEffect, useState, type CSSProperties } from "react";

import { edges, serviceZones, type ServiceZoneId } from "@/lib/network";
import {
  provincePaths,
  regionalNodes,
  regionViewBox,
} from "@/lib/region-map-data";
import { cn } from "@/lib/utils";

type MapNode = (typeof regionalNodes)[number];

const pointById = new Map<string, MapNode>(
  regionalNodes.map((node) => [node.id, node]),
);

/*
 * El salto Jujuy–Salta une visualmente los dos corredores publicados por Killa.
 * Es una representación de alcance regional, no una traza física de fibra.
 */
const regionalEdges = [
  ...edges,
  { from: "libertador", to: "lapoma", kind: "regional", bend: -0.18 },
] as const;

const provinceLabels = [
  { name: "JUJUY", x: 342, y: 138 },
  { name: "SALTA", x: 548, y: 348 },
  { name: "TUCUMÁN", x: 455, y: 582 },
  { name: "CATAMARCA", x: 188, y: 650 },
] as const;

const zoneLabels: Record<ServiceZoneId, { x: number; y: number }> = {
  "ramal-norte": { x: 492, y: 206 },
  "valles-calchaquies": { x: 286, y: 405 },
  "corredor-sur": { x: 328, y: 655 },
};

const labelPositions: Record<
  string,
  { dx: number; dy: number; anchor?: "start" | "end" }
> = {
  yuto: { dx: 13, dy: -7 },
  libertador: { dx: -13, dy: 18, anchor: "end" },
  cachi: { dx: 13, dy: -8 },
  cafayate: { dx: 13, dy: -8 },
  colalao: { dx: 13, dy: 16 },
  santamaria: { dx: 13, dy: 17 },
};

const signalOrder = new Map(
  ["yuto", "cachi", "cafayate", "colalao", "santamaria"].map((id, index) => [
    id,
    index,
  ]),
);

function curvedLink(
  from: MapNode,
  to: MapNode,
  bend: number,
) {
  const midX = (from.x + to.x) / 2;
  const midY = (from.y + to.y) / 2;
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const controlX = midX - dy * bend;
  const controlY = midY + dx * bend;
  return `M ${from.x} ${from.y} Q ${controlX.toFixed(1)} ${controlY.toFixed(1)} ${to.x} ${to.y}`;
}

function zonePath(nodeIds: readonly string[]) {
  const points = nodeIds
    .map((id) => pointById.get(id))
    .filter((node): node is MapNode => Boolean(node));

  return points
    .map((node, index) => (index === 0 ? "M " : "L ") + node.x + " " + node.y)
    .join(" ");
}

/**
 * Mapa regional SVG basado en las geometrías oficiales de Georef Argentina.
 * En móvil funciona como fondo ambiental del hero; en Cobertura muestra las
 * provincias, los nodos principales y el corredor de alcance.
 */
export function NetworkCorridor({
  className,
  mode = "responsive",
  activeZone,
  focusNodeId,
}: {
  className?: string;
  mode?: "responsive" | "full";
  activeZone?: ServiceZoneId;
  focusNodeId?: string;
}) {
  const [lunarPulse, setLunarPulse] = useState(false);
  const [pulseVersion, setPulseVersion] = useState(0);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    let loop: ReturnType<typeof setInterval> | undefined;

    const triggerPulse = () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      setLunarPulse(true);
      setPulseVersion((version) => version + 1);
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => setLunarPulse(false), 2300);
    };

    window.addEventListener("killa:lunar-pulse", triggerPulse);
    window.addEventListener("killa:theme-sequence", triggerPulse);

    if (mode === "responsive") {
      loop = setInterval(triggerPulse, 9_000);
    }

    return () => {
      window.removeEventListener("killa:lunar-pulse", triggerPulse);
      window.removeEventListener("killa:theme-sequence", triggerPulse);
      if (timer) clearTimeout(timer);
      if (loop) clearInterval(loop);
    };
  }, [mode]);

  const focusPoint = focusNodeId ? pointById.get(focusNodeId) : undefined;
  const cameraScale = focusPoint ? 1.72 : 1;
  const cameraX = focusPoint ? regionViewBox.width / 2 - focusPoint.x * cameraScale : 0;
  const cameraY = focusPoint ? regionViewBox.height / 2 - focusPoint.y * cameraScale : 0;

  return (
    <svg
      viewBox={`0 0 ${regionViewBox.width} ${regionViewBox.height}`}
      preserveAspectRatio="xMidYMid meet"
      className={cn(
        "regional-network-map",
        lunarPulse && "is-lunar-pulse",
        mode === "full" ? "network-map--full" : "network-map--responsive",
        className,
      )}
      aria-hidden="true"
      role="presentation"
    >
      <g
        className="map-camera"
        style={{ transform: `matrix(${cameraScale}, 0, 0, ${cameraScale}, ${cameraX}, ${cameraY})` }}
      >
      <g className="province-layer">
        {Object.entries(provincePaths).map(([province, path], index) => (
          <path
            key={province}
            d={path}
            className="province-shape"
            data-province={province}
            data-tone={index % 2 === 0 ? "deep" : "light"}
          />
        ))}
      </g>

      <g className="province-label-layer">
        {provinceLabels.map((province) => (
          <text
            key={province.name}
            x={province.x}
            y={province.y}
            textAnchor="middle"
            className="province-label"
          >
            {province.name}
          </text>
        ))}
      </g>

      <g className="coverage-zone-layer">
        {serviceZones.map((zone) => {
          const label = zoneLabels[zone.id];
          const selected = !activeZone || activeZone === zone.id;
          return (
            <g
              key={zone.id}
              className="coverage-zone-group"
              data-selected={selected ? "true" : "false"}
              data-zone={zone.id}
            >
              <path d={zonePath(zone.nodeIds)} className="coverage-zone" />
              <text
                x={label.x}
                y={label.y}
                textAnchor="middle"
                className="coverage-zone-label"
              >
                {zone.name}
              </text>
            </g>
          );
        })}
      </g>

      <g key={`links-${pulseVersion}`} className="link-layer">
        {regionalEdges.map((edge, index) => {
          const from = pointById.get(edge.from);
          const to = pointById.get(edge.to);
          if (!from || !to) return null;
          const path = curvedLink(from, to, edge.bend);
          const regional = edge.kind === "regional";
          return (
            <g key={`${edge.from}-${edge.to}`}>
              <path
                d={path}
                className={cn("network-link-base", regional && "network-link-regional")}
              />
              <path
                d={path}
                className={cn("network-link-flow", regional && "network-link-regional")}
                style={{ animationDelay: `${index * -0.16}s` }}
              />
            </g>
          );
        })}
      </g>

      <g key={`nodes-${pulseVersion}`} className="node-layer">
        {regionalNodes.map((node, index) => {
          const important = node.kind === "office" || node.kind === "hub";
          const selected = focusNodeId === node.id;
          const label = labelPositions[node.id] ?? { dx: 12, dy: -8 };
          const signalIndex = signalOrder.get(node.id);
          return (
            <g
              key={node.id}
              className={cn(
                "map-node",
                important && "map-node-important",
                signalIndex !== undefined && "map-node-signal",
                selected && "map-node-selected",
              )}
              style={
                signalIndex !== undefined
                  ? ({
                      ["--signal-index" as string]: signalIndex,
                      ["--signal-delay" as string]: `${0.82 + signalIndex * 0.18}s`,
                    } as CSSProperties)
                  : undefined
              }
            >
              {(important || selected) && (
                <circle
                  cx={node.x}
                  cy={node.y}
                  r="13"
                  className="map-node-pulse"
                  style={{ animationDelay: `${index * -0.21}s` }}
                />
              )}
              <circle
                cx={node.x}
                cy={node.y}
                r={important ? 5.5 : 3}
                className="map-node-core"
              />
              {(important || selected) && label && (
                <text
                  x={node.x + label.dx}
                  y={node.y + label.dy}
                  textAnchor={label.anchor ?? "start"}
                  className="map-node-label"
                >
                  {node.name}
                </text>
              )}
            </g>
          );
        })}
      </g>
      </g>
    </svg>
  );
}
