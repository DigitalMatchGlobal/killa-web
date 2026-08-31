"use client";

import { useEffect, useState } from "react";

const LOCALITIES = ["Yuto", "Cachi", "Cafayate", "Santa María"] as const;
const SIGNAL_CYCLE_MS = 2800;

/**
 * Una síntesis del producto de Killa, no un eyebrow decorativo:
 * una localidad entra a la red propia y la señal llega al norte.
 *
 * Las localidades comparten la misma celda de grid para que la rotación
 * nunca cambie el ancho ni empuje el título del hero. En movimiento reducido
 * se conserva la primera localidad y el diagrama sigue siendo legible.
 */
export function HeroSignalKicker() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );

    if (reducedMotion.matches) return;

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % LOCALITIES.length);
    }, SIGNAL_CYCLE_MS);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <div
      className="hero-signal-kicker"
      role="img"
      aria-label="Infraestructura propia de Killa conectando localidades del norte argentino"
    >
      <div className="hero-signal-kicker__meta" aria-hidden>
        <span className="node-dot" />
        <span>Infraestructura propia</span>
        <span className="hero-signal-kicker__ticks">
          {LOCALITIES.map((locality, index) => (
            <i
              key={locality}
              className={index === activeIndex ? "is-active" : undefined}
            />
          ))}
        </span>
      </div>

      <div className="hero-signal-kicker__flow" aria-hidden>
        <span className="hero-signal-kicker__localities">
          {LOCALITIES.map((locality, index) => (
            <span
              key={locality}
              className={index === activeIndex ? "is-active" : undefined}
            >
              {locality}
            </span>
          ))}
        </span>

        <span className="hero-signal-kicker__rail">
          <span key={activeIndex} className="hero-signal-kicker__pulse" />
        </span>
        <span
          key={`tip-${activeIndex}`}
          className="hero-signal-kicker__tip"
        />
        <strong
          key={`result-${activeIndex}`}
          className="hero-signal-kicker__result"
        >
          Norte conectado
        </strong>
      </div>
    </div>
  );
}
