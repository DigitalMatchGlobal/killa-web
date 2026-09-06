/**
 * Forma compartida por las píldoras de "Compartir nota".
 *
 * Vive en su propio módulo **sin `"use client"`** a propósito. Cuando esta
 * constante estaba dentro de `share-actions.tsx`, el Server Component que la
 * importaba no recibía el string sino el stub de referencia al cliente que
 * genera Next: interpolarlo en un `className` escupía
 * `function() { throw new Error("Attempted to call sharePillClass...") }`
 * como lista de clases y las píldoras perdían borde y forma. El build de
 * producción lo inlineaba y lo tapaba; en `next dev` se veía roto.
 *
 * `whitespace-nowrap` evita que una etiqueta se parta en dos renglones cuando
 * la fila envuelve en mobile: el ancho mínimo del bloque pasa a ser el de la
 * píldora más ancha y no la suma de todas.
 *
 * NO trae `hover:`. Cada red le agrega su tinte y, si la base definiera uno,
 * no ganaría el que va último en el string sino el que Tailwind haya emitido
 * último en la hoja: un conflicto silencioso y dependiente de la compilación.
 */
export const sharePillClass =
  "inline-flex min-h-11 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full border border-line px-4 text-sm text-fg-muted transition-colors";
