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
  yearsInBusiness: 18,
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
 * El selector de localidad de la sección de planes vive en `lib/localities.ts`,
 * que une esta lista de oficinas con las localidades y corredores de
 * `lib/network.ts`. Cafayate maneja tarifas distintas al resto del valle
 * (ver ../docs/00-CONTEXTO.md §1); por eso el precio no se publica todavía y la
 * consulta sale a WhatsApp con la localidad ya escrita.
 */

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

/** Titular de todas las cuentas de pago por transferencia (una por alias/zona). */
export const paymentHolder = "KILLA COMUNICACIONES SRL";

/**
 * wa.me a partir del `tel:` de una oficina, para enviar el comprobante a esa
 * oficina. Si la oficina no tiene número cargado (p. ej. Libertador), cae al
 * WhatsApp general de Killa.
 * TODO(cliente): confirmar que cada número de oficina atiende WhatsApp; varios
 * podrían ser líneas fijas y tener un móvil distinto para mensajería.
 */
export function officeWhatsappLink(phoneHref: string | undefined, message: string) {
  const digits = phoneHref?.replace(/\D/g, "");
  const number = digits && digits.length >= 10 ? digits : site.whatsapp;
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
