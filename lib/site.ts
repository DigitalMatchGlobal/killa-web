/**
 * Fuente única de contenido del sitio.
 *
 * Todo lo que hay acá salió del sitio actual (killa.com.ar) y del relevamiento
 * en ../docs. Nada está inventado: lo que no pudimos verificar está marcado
 * con TODO y NO se muestra al visitante como un dato duro.
 */

export const site = {
  name: "Killa",
  legalName: "Killa Internet & TV",
  // TODO(cliente): confirmar grafía oficial. El logotipo usa "killa" en minúscula
  // y el dominio es killa.com.ar; en los docs internos figura KILLA en mayúscula.
  url: "https://killa.com.ar",
  tagline: "Brindamos acceso a Internet de forma eficiente y estable",
  yearsInBusiness: 13,
  email: "info@killa.com.ar",
  phoneDisplay: "3868 45-4000",
  phoneHref: "tel:+543868454000",
  // TODO(cliente): confirmar que el número general atiende WhatsApp. Si tienen una
  // línea distinta para WhatsApp (o la que unifica Matchbot), cambiar sólo acá.
  whatsapp: "5493868454000",
} as const;

export const offices = [
  {
    city: "Cafayate",
    province: "Salta",
    address: "Rivadavia 327",
    phone: "3868 45-4000",
    phoneHref: "tel:+543868454000",
  },
  {
    city: "Cachi",
    province: "Salta",
    address: "Av. Arne Høygaard s/n",
    phone: "387 450-8762",
    phoneHref: "tel:+543874508762",
  },
  {
    city: "Yuto",
    province: "Jujuy",
    address: "Tucumán s/n, Barrio Chacarita",
    phone: "0388 649-8408",
    phoneHref: "tel:+543886498408",
  },
  {
    city: "San Salvador de Jujuy",
    province: "Jujuy",
    kind: "Soporte regional",
  },
  {
    city: "Salta",
    province: "Salta",
    kind: "Soporte regional",
  },
  {
    city: "Caimán",
    province: "Jujuy",
    kind: "Soporte local",
  },
] as const;

/**
 * Zonas comerciales. El selector de zona existe por una razón de negocio, no
 * decorativa: Cafayate maneja tarifas distintas al resto del valle
 * (ver ../docs/00-CONTEXTO.md §1). Por eso el precio no se publica todavía y
 * la consulta sale a WhatsApp con la zona ya escrita.
 */
export const zones = [
  { id: "cafayate", label: "Cafayate" },
  { id: "cachi", label: "Cachi y alrededores" },
  { id: "valle", label: "San Carlos · Molinos · Angastaco" },
  { id: "poma", label: "La Poma · Seclantás" },
  { id: "yuto", label: "Yuto (Jujuy)" },
] as const;

export type ZoneId = (typeof zones)[number]["id"];

export const homePlans = [
  {
    speed: "100",
    unit: "Megas",
    blurb: "Para navegar, redes y streaming en un par de dispositivos.",
    features: ["Navegación y redes", "Streaming HD", "Instalación a consultar"],
    featured: false,
  },
  {
    speed: "150",
    unit: "Megas",
    blurb: "El equilibrio para una casa con varios equipos conectados a la vez.",
    features: ["Varios dispositivos", "Streaming y videollamadas", "Instalación a consultar"],
    featured: true,
  },
  {
    speed: "200",
    unit: "Megas",
    blurb: "Para hogares exigentes, home office y trabajo con archivos pesados.",
    features: ["Home office", "Streaming 4K", "Instalación a consultar"],
    featured: false,
  },
] as const;

export const businessServices = [
  {
    title: "Internet dedicado",
    body: "Conexiones dedicadas con ancho de banda garantizado para operaciones que no pueden detenerse.",
    icon: "gauge",
  },
  {
    title: "Redes de datos",
    body: "Implementación y mantenimiento de redes internas de datos y comunicaciones.",
    icon: "network",
  },
  {
    title: "Redes FTTH",
    body: "Despliegue de fibra al hogar para emprendimientos, barrios y complejos.",
    icon: "cable",
  },
  {
    title: "Radioenlaces y microondas",
    body: "Enlaces punto a punto para llevar conectividad donde no llega el tendido.",
    icon: "radio",
  },
  {
    title: "Tendidos troncales",
    body: "Tendidos aéreos y multipares para redes troncales.",
    icon: "route",
  },
  {
    title: "Llave en mano",
    body: "Soluciones en telecomunicaciones integrales: relevamiento, obra, puesta en marcha y soporte.",
    icon: "key",
  },
] as const;

/** Compromiso social — cifras declaradas por la empresa en killa.com.ar. */
export const socialCommitment = [
  {
    value: "6",
    label: "destacamentos policiales",
    detail: "con internet sin cargo",
    items: ["La Poma", "Payogasta", "Molinos", "Seclantás", "San Carlos", "Animaná"],
  },
  {
    value: "3",
    label: "escuelas",
    detail: "conectadas sin cargo",
    items: [
      "Escuela Primaria La Cabaña (Dpto. San Carlos)",
      "Escuela de Educación Técnica de Cachi",
      "Escuela Primaria de Brealito",
    ],
  },
  {
    value: "2",
    label: "iglesias",
    detail: "y casas parroquiales conectadas sin cargo",
    items: ["Molinos", "San Carlos"],
  },
  {
    value: "250",
    label: "familias",
    detail: "con servicio subsidiado en Brealito y Luracatao",
    items: ["En articulación con la Fundación Turismo Campesino"],
  },
] as const;

export const navLinks = [
  { href: "#ecosistema", label: "Qué hacemos" },
  { href: "#hogar", label: "Internet en tu casa" },
  { href: "#empresas", label: "Empresas" },
  { href: "#cobertura", label: "Cobertura" },
  { href: "/tv", label: "Killa TV" },
  { href: "#contacto", label: "Contacto" },
] as const;

/** Arma el link de WhatsApp con el mensaje ya escrito (plan + zona). */
export function whatsappLink(message: string) {
  return `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(message)}`;
}
