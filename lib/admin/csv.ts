/**
 * Export CSV lisible par Excel en français : BOM UTF-8, séparateur « ; »,
 * fins de ligne CRLF. Une cellule qui commence par = + - @ est préfixée d'une
 * apostrophe pour qu'elle ne soit jamais exécutée comme une formule.
 */
function cell(value: string | number | null | undefined): string {
  let text = value === null || value === undefined ? "" : String(value);
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return /[";\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function toCsv(headers: string[], rows: (string | number | null | undefined)[][]): string {
  return `﻿${[headers, ...rows].map((row) => row.map(cell).join(";")).join("\r\n")}`;
}
