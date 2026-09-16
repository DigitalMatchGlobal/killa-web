import { ChevronDown, MapPin, Phone, Receipt } from "lucide-react";

import { CoverageExplorer } from "@/components/sections/coverage-explorer";
import { CopyField } from "@/components/ui/copy-field";

import { officeSlug } from "@/lib/localities";
import { officeWhatsappLink, offices, paymentHolder, whatsappLink } from "@/lib/site";

/**
 * Cobertura y oficinas.
 *
 * Para un ISP regional esto es la sección que más se consulta: la primera
 * pregunta de todo visitante es "¿llegás a mi casa?". Las localidades son las
 * mismas que dibuja el corredor del hero, tomadas de lib/network.ts.
 *
 * El explorador agrupa las localidades en corredores operativos para que la
 * cobertura se entienda de un vistazo, especialmente desde el teléfono.
 */
export function Coverage() {
  return (
    <section id="cobertura" className="section-pad relative border-t border-line">
      <div className="shell">
        <header className="reveal max-w-2xl">
          <p className="eyebrow">
            <span className="node-dot" aria-hidden />
            Área de cobertura
          </p>
          <h2 className="display mt-4 text-[clamp(2rem,7vw,3.25rem)]">
            Dos corredores.
            <br />Una red que los conecta.
          </h2>
          <p className="mt-5 text-fg-muted">
            Agrupamos la cobertura como Killa presta el servicio: Ramal Norte y
            Valles Calchaquíes. Seleccioná una zona para explorar sus localidades.
          </p>
        </header>

        <CoverageExplorer />

        {/* Oficinas verificadas: identidad, contacto y —abajo— cómo pagar por
            transferencia. El alias es la cuenta de esa zona; el titular es único
            para todas, por eso se aclara una sola vez debajo de la grilla. */}
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {offices.map((office, index) => {
            const phoneHref = "phoneHref" in office ? office.phoneHref : undefined;
            return (
              <article
                key={`${office.city}-${office.address}`}
                id={officeSlug(office.city)}
                className="office-card card card-topline reveal flex scroll-mt-24 flex-col p-6"
                style={{ ["--reveal-delay" as string]: `${index * 80}ms` }}
              >
                <h3 className="font-display text-xl font-semibold tracking-tight text-fg">
                  {office.city}
                  <span className="ml-2 text-sm font-normal text-fg-faint">
                    {office.province}
                  </span>
                </h3>
                <p className="mt-4 flex items-start gap-2.5 text-sm text-fg-muted">
                  <MapPin size={16} className="mt-0.5 shrink-0 text-fg-faint" aria-hidden />
                  {office.address}
                </p>
                {phoneHref ? (
                  <a
                    href={phoneHref}
                    className="mt-2.5 flex items-center gap-2.5 font-mono text-sm text-fg-muted transition-colors duration-300 hover:text-cyan"
                  >
                    <Phone size={16} className="shrink-0 text-fg-faint" aria-hidden />
                    {office.phone}
                  </a>
                ) : <p className="mt-2.5 font-mono text-xs text-fg-faint">{office.phone}</p>}
                <p className="mt-3 text-xs leading-relaxed text-fg-faint">{office.hours}</p>

                {/* Pago por transferencia: oculto por defecto, se abre por
                    oficina para no recargar la tarjeta. */}
                <details className="group mt-auto border-t border-line pt-4">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-2 text-xs font-medium text-fg-muted transition-colors hover:text-fg [&::-webkit-details-marker]:hidden">
                    Datos para pagar por transferencia
                    <ChevronDown size={16} className="shrink-0 text-fg-faint transition-transform duration-300 group-open:rotate-180" aria-hidden />
                  </summary>
                  <div className="mt-3">
                    <p className="font-mono text-[0.58rem] uppercase tracking-[0.14em] text-fg-faint">
                      Alias para pagos
                    </p>
                    <div className="mt-2">
                      <CopyField value={office.alias} label={`alias ${office.alias}`} />
                    </div>
                    <a
                      href={officeWhatsappLink(
                        phoneHref,
                        `Hola Killa (${office.city}), adjunto el comprobante de pago de mi servicio (alias ${office.alias}).`,
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-medium text-cyan transition-opacity hover:opacity-80"
                    >
                      <Receipt size={14} aria-hidden />
                      Enviar comprobante
                    </a>
                  </div>
                </details>
              </article>
            );
          })}
        </div>

        <p className="reveal mt-4 text-xs text-fg-faint">
          Todas las cuentas están a nombre de{" "}
          <span className="text-fg-muted">{paymentHolder}</span>. Transferí al alias de tu
          zona y enviá el comprobante por WhatsApp a esa oficina.
        </p>

        <div className="reveal mt-8">
          <a
            href={whatsappLink("Hola Killa, quiero saber si llegan a mi domicilio. Estoy en:")}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary w-full sm:w-auto"
          >
            Consultar factibilidad en mi domicilio
          </a>
        </div>
      </div>
    </section>
  );
}
