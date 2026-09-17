import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");

function pngDataUrl(relativePath) {
  const buffer = readFileSync(resolve(root, relativePath));
  return `data:image/png;base64,${buffer.toString("base64")}`;
}

function provincePaths() {
  const source = readFileSync(resolve(root, "lib/region-map-data.ts"), "utf8");
  const block = source.match(/export const provincePaths = \{([\s\S]*?)\n\} as const;/)?.[1];
  if (!block) throw new Error("No se pudo leer provincePaths");

  return [...block.matchAll(/^\s+"([^"]+)": "([^"]+)",?$/gm)].map(
    ([, name, path]) => ({ name, path }),
  );
}

const symbol = pngDataUrl("public/brand/killatv-symbol-dark.png");
const wordmark = pngDataUrl("public/brand/killatv-wordmark-dark.png");
const provinces = provincePaths();

const mapPaths = provinces
  .map(
    ({ name, path }, index) => `
      <path d="${path}" data-province="${name}"
        fill="${index % 2 === 0 ? "#0b1b31" : "#10233d"}"
        stroke="#315277" stroke-width="2" vector-effect="non-scaling-stroke" />`,
  )
  .join("");

const corridorNodes = [
  [434.5, 233.4], [452.7, 226.3], [463.6, 216.2],
  [306.2, 325.5], [315.3, 358.9], [309.8, 366], [299.8, 382.2],
  [296.2, 398.4], [311.7, 422.6], [330.8, 443.9], [326.2, 452],
  [327.1, 462.1], [330.8, 475.3], [329, 491.5], [320.8, 502.6],
  [319.9, 518.8], [319.9, 524.9], [319.9, 538],
];

const corridorPath = corridorNodes
  .map(([x, y], index) => `${index === 0 ? "M" : "L"} ${x} ${y}`)
  .join(" ");

const nodeMarkup = corridorNodes
  .map(
    ([x, y], index) => `
      <circle cx="${x}" cy="${y}" r="${index === 0 || index === 2 || index === 5 || index === 11 || index === 17 ? 7 : 4}"
        fill="${index < 3 ? "#5ae2ff" : "#e9d0a0"}" stroke="#03101f" stroke-width="3" />`,
  )
  .join("");

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#030914" />
      <stop offset="0.56" stop-color="#061225" />
      <stop offset="1" stop-color="#0b1d35" />
    </linearGradient>
    <radialGradient id="cyanGlow">
      <stop offset="0" stop-color="#26b9e8" stop-opacity="0.3" />
      <stop offset="1" stop-color="#26b9e8" stop-opacity="0" />
    </radialGradient>
    <radialGradient id="moon">
      <stop offset="0" stop-color="#fff8dd" />
      <stop offset="0.72" stop-color="#ead09a" />
      <stop offset="1" stop-color="#a98347" />
    </radialGradient>
    <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
      <path d="M48 0H0V48" fill="none" stroke="#244461" stroke-opacity="0.2" />
    </pattern>
    <filter id="glow" x="-60%" y="-60%" width="220%" height="220%">
      <feGaussianBlur stdDeviation="7" result="blur" />
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <linearGradient id="fade" x1="0" x2="1">
      <stop offset="0" stop-color="#030914" />
      <stop offset="0.72" stop-color="#030914" stop-opacity="0.95" />
      <stop offset="1" stop-color="#030914" stop-opacity="0" />
    </linearGradient>
  </defs>

  <rect width="1200" height="630" fill="url(#bg)" />
  <rect width="1200" height="630" fill="url(#grid)" />
  <circle cx="1010" cy="155" r="300" fill="url(#cyanGlow)" />
  <circle cx="1052" cy="92" r="38" fill="url(#moon)" opacity="0.94" />
  <circle cx="1039" cy="82" r="5" fill="#9a7947" opacity="0.24" />
  <circle cx="1064" cy="104" r="8" fill="#9a7947" opacity="0.2" />

  <g transform="translate(760 18) scale(0.64)" opacity="0.97">
    ${mapPaths}
    <path d="${corridorPath}" fill="none" stroke="#02101f" stroke-width="13"
      stroke-linecap="round" stroke-linejoin="round" />
    <path d="${corridorPath}" fill="none" stroke="#26b9e8" stroke-width="4"
      stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="2 12"
      filter="url(#glow)" />
    ${nodeMarkup}
  </g>

  <rect x="0" y="0" width="760" height="630" fill="url(#fade)" />
  <path d="M72 49H512" stroke="#26b9e8" stroke-width="3" />

  <image href="${symbol}" x="72" y="72" width="88" height="91" preserveAspectRatio="xMidYMid meet" />
  <image href="${wordmark}" x="181" y="86" width="292" height="77" preserveAspectRatio="xMinYMid meet" />

  <text x="72" y="220" fill="#e9d0a0" font-family="Arial, Helvetica, sans-serif"
    font-size="18" font-weight="700" letter-spacing="3.2">EL CANAL OFICIAL DEL VALLE CALCHAQUÍ</text>

  <text x="72" y="294" fill="#f1f6fc" font-family="Arial, Helvetica, sans-serif"
    font-size="48" font-weight="750" letter-spacing="-1.4">
    <tspan x="72" dy="0">Noticias, deporte y turismo</tspan>
    <tspan x="72" dy="58">del Valle Calchaquí</tspan>
    <tspan x="72" dy="58" fill="#5ae2ff">y todo el NOA.</tspan>
  </text>

  <g transform="translate(72 510)">
    <rect width="500" height="54" rx="27" fill="#0b1d34" stroke="#294867" />
    <circle cx="28" cy="27" r="5" fill="#26b9e8" filter="url(#glow)" />
    <text x="48" y="34" fill="#a9bad0" font-family="Arial, Helvetica, sans-serif"
      font-size="16" font-weight="700" letter-spacing="2.4">NOTICIAS  ·  DEPORTES  ·  TURISMO</text>
  </g>

  <text x="1128" y="574" text-anchor="end" fill="#8fa5be"
    font-family="Arial, Helvetica, sans-serif" font-size="15" font-weight="700"
    letter-spacing="2">JUJUY · SALTA · TUCUMÁN · CATAMARCA</text>
  <path d="M72 596H1128" stroke="#294867" />
</svg>`;

const output = "/private/tmp/killa-og-tv-source.svg";
writeFileSync(output, svg);
console.log(output);
