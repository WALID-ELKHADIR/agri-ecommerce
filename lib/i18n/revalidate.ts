import "server-only";

import { revalidatePath } from "next/cache";
import { localizedPaths } from "./routing";

/**
 * revalidatePath pour une adresse visible (« /produits ») : les pages réelles
 * sont /fr/produits et /ar/produits (voir proxy.ts), les deux sont revalidées.
 */
export function revalidateLocalized(path: string, type?: "layout" | "page"): void {
  for (const real of localizedPaths(path)) revalidatePath(real, type);
}
