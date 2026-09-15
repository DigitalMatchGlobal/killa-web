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
    alias: "KILLA.CAFAYATE",
    address: "Rivadavia 237",
    phone: "3868 45-4000",
    phoneHref: "tel:+543868454000",
    hours: "Lun–Vie 8:30–12:30 y 16–20 · Sáb 8:30–12:30",
  },
  {
    city: "San Carlos",
    province: "Salta",
    alias: "KILLA.SANCARLOS",
    address: "Belgrano 396, entre Güemes y Juan Calchaquí",
    phone: "3875 970-966",
    phoneHref: "tel:+543875970966",
    hours: "Lun–Vie 8:30–12:30 y 16–20 · Sáb 8:30–12:30",
  },
  {
    city: "Cachi",
    province: "Salta",
    alias: "KILLA.CACHI",
    address: "Calle Arne Hoygaard, frente a la antena de Personal, B° Municipal",
    phone: "3874 508-762",
    phoneHref: "tel:+543874508762",
    hours: "Lun–Vie 8:30–12:30 y 16–20 · Sáb 8:30–12:30",
  },
  {
    city: "Yuto",
    province: "Jujuy",
    alias: "KILLA.JUJUY",
    address: "Tucumán s/n, Barrio Chacarita",
    phone: "3886 401-286",
    phoneHref: "tel:+543886401286",
    hours: "Lun–Vie 8:30–12:30 y 16–20 · Sáb 8:30–12:30",
  },
  {
    city: "Caimancito",
    province: "Jujuy",
    alias: "KILLA.JUJUY",
    address: "B° Belén, calle La Rioja sobre Av. Santa Fe",
    phone: "3886 568-976",
    phoneHref: "tel:+543886568976",
    hours: "Lun–Vie 8:30–12:30 y 16–20 · Sáb 8:30–12:30",
  },
  {
    city: "Santa María (Centro)",
    province: "Catamarca",
    alias: "KILLA.SANTAMARIA",
    address: "Belgrano 487",
    phone: "3838 400-500",
    phoneHref: "tel:+543838400500",
    hours: "Lun–Vie 8–13 y 18–21 · Sáb 8–13",
  },
  {
    city: "Santa María (B° El Recreo)",
    province: "Catamarca",
    alias: "KILLA.SANTAMARIA",
    address: "25 de Mayo s/n",
    phone: "3838 483-209",
    phoneHref: "tel:+543838483209",
    hours: "Lun–Vie 9–13 y 16–20 · Sáb 9–13",
  },
  {
    city: "Libertador Gral. San Martín",
    province: "Jujuy",
    alias: "KILLA.LIBERTADOR",
    address: "Ramírez de Velazco 2884, Mza. 90, Lote 23",
    phone: "Teléfono pendiente",
    hours: "Lun–Vie 9–13 y 18–22",
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
  { id: "cachi", label: "Cachi" },
  { id: "yuto", label: "Yuto" },
  { id: "caimancito", label: "Caimancito" },
  { id: "libertador", label: "Libertador Gral. San Martín" },
  { id: "lapoma", label: "La Poma" },
  { id: "payogasta", label: "Payogasta" },
  { id: "seclantas", label: "Seclantás" },
  { id: "molinos", label: "Molinos" },
  { id: "angastaco", label: "Angastaco" },
  { id: "sancarlos", label: "San Carlos" },
  { id: "animana", label: "Animaná" },
  { id: "tolombon", label: "Tolombón" },
  { id: "colalao", label: "Colalao del Valle" },
  { id: "quilmes", label: "Quilmes" },
  { id: "fuerte-quemado", label: "Fuerte Quemado" },
  { id: "santa-maria", label: "Santa María" },
  { id: "san-jose", label: "San José" },
] as const;

export type ZoneId = (typeof zones)[number]["id"];

export const homePlans = [
  {
    speed: "300",
    unit: "Megas",
    blurb: "Para navegar, redes y streaming en un par de dispositivos.",
    features: ["Navegación y redes", "Streaming HD", "Instalación a consultar"],
    featured: false,
  },
  {
    speed: "500",
    unit: "Megas",
    blurb: "El equilibrio para una casa con varios equipos conectados a la vez.",
    features: ["Varios dispositivos", "Streaming y videollamadas", "Instalación a consultar"],
    featured: true,
  },
  {
    speed: "1.000",
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
