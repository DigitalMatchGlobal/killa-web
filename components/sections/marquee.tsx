import { nodes } from "@/lib/network";

/**
 * Cinta de localidades.
 *
 * Separa cobertura de Killa TV y le da movimiento continuo a la página sin
 * pedirle nada al visitante. Los nombres son los mismos nodos del corredor del
 * hero, así que la lista nunca se desincroniza del mapa.
 */
export function Marquee() {
  const items = [...nodes.map((n) => n.name), "Brealito", "Luracatao", "Caimán"];
  // La pista se duplica: cuando la primera copia sale de pantalla, la animación
  // vuelve a 0 sobre la segunda y el bucle no tiene costura.
  const loop = [...items, ...items];

  return (
    <div
      className="relative overflow-hidden border-y border-line py-5"
      aria-hidden
      style={{
        maskImage: "linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)",
      }}
    >
      <div className="marquee-track">
        {loop.map((name, index) => (
          <span
            key={`${name}-${index}`}
            className="flex shrink-0 items-center gap-6 pr-6 font-mono text-sm uppercase tracking-[0.18em] text-fg-faint"
          >
            {name}
            <span className="node-dot size-1.5 shadow-none opacity-60" />
          </span>
        ))}
      </div>
    </div>
  );
}
