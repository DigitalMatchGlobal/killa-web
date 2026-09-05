import { Mail, MessageCircle, Phone } from "lucide-react";

import { Logo } from "@/components/brand/logo";
import { PoweredBy } from "@/components/brand/powered-by";
import { navLinks, offices, site, whatsappLink } from "@/lib/site";

/**
 * Contacto + pie.
 *
 * En esta iteración no hay formulario: en el valle la conversación real pasa
 * por WhatsApp y por el teléfono de la oficina. Un formulario que va a un mail
 * que nadie mira sería peor que no tenerlo. El formulario entra cuando haya un
 * destino definido (o cuando Matchbot tome la línea).
 */
export function Contact() {
  return (
    <footer id="contacto" className="relative border-t border-line">
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(90% 80% at 50% 100%, rgba(0,188,232,0.1) 0%, transparent 62%)",
        }}
        aria-hidden
      />

      <div className="shell section-pad">
        <div className="reveal max-w-2xl">
          <p className="eyebrow">
            <span className="node-dot" aria-hidden />
            Contacto
          </p>
          <h2 className="display mt-4 text-[clamp(2.1rem,8vw,3.5rem)]">
            ¿Arrancamos?
          </h2>
          <p className="mt-5 text-fg-muted">
            Escribinos por WhatsApp y te decimos en el momento si llegamos a tu
            domicilio, con qué velocidad y a qué precio en tu localidad.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href={whatsappLink("Hola Killa, quiero hacer una consulta.")}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary w-full sm:w-auto"
            >
              <MessageCircle size={17} aria-hidden />
              Escribir por WhatsApp
            </a>
            <a href={site.phoneHref} className="btn btn-ghost w-full sm:w-auto">
              <Phone size={17} aria-hidden />
              {site.phoneDisplay}
            </a>
          </div>

          <a
            href={`mailto:${site.email}`}
            className="mt-6 inline-flex items-center gap-2.5 font-mono text-sm text-fg-muted transition-colors duration-300 hover:text-cyan"
          >
            <Mail size={16} aria-hidden />
            {site.email}
          </a>
        </div>

        <div className="rule mt-14" />

        <div className="mt-10 grid gap-10 md:grid-cols-[1.2fr_1fr_1fr]">
          <div>
            <Logo className="h-9 w-auto" />
            <p className="mt-5 max-w-xs text-sm text-fg-muted">{site.tagline}</p>
          </div>

          <nav aria-label="Secciones del sitio">
            <p className="font-mono text-[0.7rem] uppercase tracking-[0.16em] text-fg-faint">
              Sitio
            </p>
            <ul className="mt-4 flex flex-col gap-2.5">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm text-fg-muted transition-colors duration-300 hover:text-fg"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <p className="font-mono text-[0.7rem] uppercase tracking-[0.16em] text-fg-faint">
              Oficinas
            </p>
            <ul className="mt-4 flex flex-col gap-3.5">
              {offices.map((office) => (
                <li key={office.city} className="text-sm">
                  <p className="text-fg">{office.city}</p>
                  <p className="text-fg-muted">
                    {"address" in office ? office.address : `${office.province} · ${office.kind}`}
                  </p>
                  {"phoneHref" in office && (
                    <a
                      href={office.phoneHref}
                      className="font-mono text-fg-faint transition-colors duration-300 hover:text-cyan"
                    >
                      {office.phone}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-5 border-t border-line pt-7 text-xs text-fg-faint sm:flex-row sm:items-center sm:justify-between">
          <div className="grid gap-3">
            <p className="font-mono">
              © {new Date().getFullYear()} {site.legalName}
            </p>
            <p className="font-mono">Jujuy · Salta · Tucumán · Catamarca, Argentina</p>
          </div>
          <PoweredBy compact />
        </div>
      </div>
    </footer>
  );
}
