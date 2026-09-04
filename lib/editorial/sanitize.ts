/**
 * Saneamiento del contenido editorial.
 *
 * DECISIÓN: el cuerpo de una nota se guarda como **texto plano** con párrafos
 * separados por línea en blanco, no como HTML.
 *
 * Por qué: el equipo de prensa de Killa escribe notas, no markup. Guardar texto
 * y renderizarlo con `<p>{parrafo}</p>` hace que React escape todo por
 * definición, así que no queda superficie de XSS que haya que confiar en
 * limpiar bien: el vector directamente no existe. Un editor de texto
 * enriquecido con su propio sanitizador es una decisión de la Etapa 2, cuando
 * se sepa si lo piden.
 *
 * Igual se limpia en la escritura: si alguien pega HTML desde Word o manda un
 * payload por la API, se guarda el texto sin etiquetas en vez de dejar basura
 * en la base esperando que algún render futuro la interprete.
 */

/** Caracteres de control invisibles, preservando \n y \t. */
const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

/** Quita etiquetas, comentarios y caracteres de control. Normaliza saltos. */
export function sanitizePlainText(input: string): string {
  return input
    .replace(/\r\n?/g, "\n")
    .replace(/<!--[\s\S]*?-->/g, "")
    // Bloques con contenido ejecutable: se van enteros, no sólo la etiqueta.
    .replace(/<(script|style|iframe|object|embed)\b[\s\S]*?<\/\1\s*>/gi, "")
    .replace(/<[^>]*>/g, "")
    .replace(CONTROL_CHARS, "")
    .trim();
}

/**
 * Igual que el anterior pero además colapsa los saltos: título, bajada y texto
 * alternativo son de una sola línea.
 */
export function sanitizeSingleLine(input: string): string {
  return sanitizePlainText(input).replace(/\s+/g, " ").trim();
}

/** Cuerpo: preserva los párrafos y colapsa las líneas en blanco de más. */
export function sanitizeBody(input: string): string {
  return sanitizePlainText(input)
    .split("\n")
    .map((line) => line.replace(/[ \t]+/g, " ").trimEnd())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Parte el cuerpo en párrafos para renderizar. */
export function toParagraphs(body: string): string[] {
  return body
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.replace(/\n/g, " ").trim())
    .filter((paragraph) => paragraph.length > 0);
}
