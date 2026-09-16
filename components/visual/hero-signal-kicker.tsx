"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { CSSProperties } from "react";

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
  const [scrollProgress, setScrollProgress] = useState(0);

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

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      setScrollProgress(Math.min(window.scrollY / 80, 1));
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      className="hero-signal-kicker"
      role="img"
      aria-label="Infraestructura propia de Killa conectando localidades del norte argentino"
      style={{
        "--brand-opacity": 1 - scrollProgress,
        "--brand-y": `${scrollProgress * -32}px`,
        "--brand-scale": 1 - scrollProgress * 0.18,
      } as CSSProperties}
    >
      <div className="hero-signal-kicker__meta" aria-hidden>
        <span className="node-dot" />
        <Image
          src="/brand/killa-internet.png"
          alt=""
          width={2160}
          height={825}
          className="hero-signal-kicker__logo hero-signal-kicker__logo--dark h-auto object-contain"
          priority
        />
        <Image
          src="/brand/killa-official.png"
          alt=""
          width={1600}
          height={533}
          className="hero-signal-kicker__logo hero-signal-kicker__logo--light hidden h-auto object-contain"
          priority
        />
        <span className="sr-only">Infraestructura propia</span>
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
