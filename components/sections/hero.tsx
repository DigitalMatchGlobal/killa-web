import { ArrowDown, ArrowRight } from "lucide-react";

import { HeroSignalKicker } from "@/components/visual/hero-signal-kicker";
import { NetworkCorridor } from "@/components/visual/network-corridor";
import { LunarSignature } from "@/components/visual/lunar-signature";
import { site, whatsappLink } from "@/lib/site";

/**
 * Hero.
 *
 * La idea: no poner una foto de stock de fibra óptica, sino el activo real de
 * la empresa — su red. El corredor se dibuja solo al cargar y los pulsos de
 * datos recorren la Ruta 40 de La Poma a Cafayate. El resplandor cálido de
 * arriba es la luna: "killa" es luna en quechua.
 *
 * **Regla dura de esta sección: entra completa en un celular real.** La ventana
 * de Safari en un iPhone 13 mide 664 px de alto, no 844 — las barras del
 * navegador se comen 180 px. Todo lo de acá está dimensionado contra ese
 * número, porque el cliente abre el link desde el teléfono.
 *
 * Por eso, en celular el mapa deja de ser una textura detrás del copy: ocupa
 * la mitad inferior del primer pliegue, conserva sus nodos y rótulos, y el CTA
 * flota en el margen libre. El párrafo largo vuelve recién en escritorio.
 *
 * El mapa rotulado y legible vive en la sección de cobertura, que tiene el
 * alto para mostrarlo bien en cualquier dispositivo.
 */
export function Hero() {
  return (
    <section
      id="top"
      className="hero-frame relative isolate flex flex-col overflow-hidden pt-[72px]"
    >
      {/* Fondos: trama de tendido + luz de luna. */}
      <div className="absolute inset-0 -z-20 grid-weave opacity-[0.5]" aria-hidden />
      <div className="hero-day-night absolute inset-0 -z-20" aria-hidden />
      <div
        className="absolute left-1/2 top-[-18rem] -z-20 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full opacity-60 blur-[90px] sm:top-[-22rem]"
        style={{
          background:
            "radial-gradient(circle, rgba(233,208,160,0.16) 0%, rgba(0,188,232,0.13) 42%, transparent 70%)",
        }}
        aria-hidden
      />

      <div className="shell relative flex flex-1 flex-col lg:grid lg:grid-cols-[1.05fr_1fr] lg:items-center lg:gap-8">
        <LunarSignature />
        {/*
          En celular el mapa es fondo absoluto de todo el hero. A partir de lg
          vuelve al flujo y ocupa la segunda columna de la grilla.
        */}
        <div className="hero-map pointer-events-none absolute -inset-x-5 bottom-0 top-[8.4rem] -z-10 translate-x-[2.8rem] sm:top-[9rem] sm:translate-x-[3.6rem] lg:relative lg:inset-auto lg:order-2 lg:h-[74svh] lg:w-full lg:translate-x-0">
          <NetworkCorridor className="absolute inset-0 h-full w-full" />
          {/* Gradiente lateral: protege el CTA sin apagar la cartografía. */}
          <div
            className="absolute inset-0 lg:hidden"
            style={{
              background:
                "linear-gradient(90deg, rgb(var(--midnight) / 0.72) 0%, rgb(var(--midnight) / 0.2) 48%, transparent 78%)",
            }}
            aria-hidden
          />
        </div>

        <div className="hero-content relative flex flex-1 flex-col items-start py-4 lg:order-1 lg:py-20">
          <HeroSignalKicker />

          <h1 className="hero-title display mt-4 text-[clamp(2.15rem,8.6vw,4.6rem)] lg:mt-5 lg:text-[clamp(3.2rem,4.6vw,4.9rem)]">
            Internet estable
            <br />
            <span className="text-cyan">donde otros</span>
            <br />
            no llegan.
          </h1>

          <p className="hero-copy hero-copy-long mt-5 hidden max-w-[46ch] text-[0.975rem] leading-[1.6] text-fg-muted sm:text-lg lg:mt-6 lg:block">
            {site.yearsInBusiness} años conectando el norte argentino con redes
            propias, tecnología y un equipo que vive acá —{" "}
            <span className="text-fg">de Jujuy a Catamarca</span>, a través de los
            Valles Calchaquíes.
          </p>

          <a
            href={whatsappLink("Hola Killa, quiero contratar internet. Mi localidad es:")}
            target="_blank"
            rel="noopener noreferrer"
            className="hero-primary btn btn-primary mt-auto w-auto px-6 lg:mt-8"
          >
            Quiero contratar
          </a>

          {/*
            Enlace y no botón: dos botones apilados se comen 60 px del pliegue
            en un celular, y este es claramente el CTA secundario.
          */}
          <a
            href="#cobertura"
            className="hero-secondary group mb-1 mt-2 inline-flex items-center gap-2 py-1 text-sm text-fg-muted transition-colors duration-300 hover:text-cyan lg:mb-0 lg:mt-4"
          >
            Ver si llegamos a tu zona
            <ArrowRight
              size={15}
              className="transition-transform duration-300 group-hover:translate-x-1"
              aria-hidden
            />
          </a>

          {/* Alternativa textual del mapa: quien no ve el lienzo lee lo mismo. */}
          <p className="sr-only">
            Killa conecta localidades de Jujuy, Salta, Tucumán y Catamarca. Su red
            recorre los Valles Calchaquíes desde Yuto hasta San José. Las oficinas
            están en Cafayate, Cachi y Yuto.
          </p>
        </div>
      </div>

      <a
        href="#hogar"
        aria-label="Ir a los planes de internet"
        className="absolute bottom-6 right-5 hidden size-11 place-items-center rounded-full border border-line text-fg-faint transition-colors duration-300 hover:border-cyan/60 hover:text-cyan lg:grid"
      >
        <ArrowDown size={17} aria-hidden />
      </a>
    </section>
  );
}
