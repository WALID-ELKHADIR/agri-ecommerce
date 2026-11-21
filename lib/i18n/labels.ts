/** Libellés traduits de valeurs du catalogue (module pur). */
import { stockKey } from "../catalog-query.ts";
import type { Dictionary } from "./fr.ts";

/** Disponibilité saisie dans l'admin (« Sur demande »…) dans la langue de la page ; valeur inconnue : telle quelle. */
export function stockLabel(stock: string, t: Pick<Dictionary, "stock">): string {
  return t.stock[stockKey(stock)] ?? stock;
}
