/**
 * Contenu des produits et des gammes dans la langue de la page (module pur).
 * Les champs arabes sont facultatifs, saisis dans l'admin : un champ vide
 * garde le texte français. Pas de traduction automatique.
 */
import type { Locale } from "./index.ts";

export type Spec = { label: string; value: string };

/** Champs arabes facultatifs d'un produit (colonnes name_ar, description_ar, specs_ar). */
export type ProductArabic = { name?: string | null; description?: string | null; specs?: Spec[] | null };
/** Champs arabes facultatifs d'une gamme (colonnes label_ar, short_ar, description_ar). */
export type CategoryArabic = { label?: string | null; short?: string | null; description?: string | null };

type LocalizableProduct = {
  name: string;
  category: string;
  categoryLabel: string;
  description: string;
  specs: Spec[];
  ar?: ProductArabic;
};
type LocalizableCategory = { id: string; label: string; short: string; description: string; ar?: CategoryArabic };

const pick = (arabic: string | null | undefined, french: string) => (arabic?.trim() ? arabic.trim() : french);

export function localizeCatalog<C extends LocalizableCategory, P extends LocalizableProduct>(
  catalog: { categories: C[]; products: P[] },
  locale: Locale,
): { categories: C[]; products: P[] } {
  if (locale !== "ar") return catalog;

  const categories = catalog.categories.map((category) => ({
    ...category,
    label: pick(category.ar?.label, category.label),
    short: pick(category.ar?.short, category.short),
    description: pick(category.ar?.description, category.description),
  }));
  const labels = new Map(categories.map((category) => [category.id, category.label]));

  const products = catalog.products.map((product) => ({
    ...product,
    name: pick(product.ar?.name, product.name),
    description: pick(product.ar?.description, product.description),
    specs: product.ar?.specs?.length ? product.ar.specs : product.specs,
    categoryLabel: labels.get(product.category) ?? product.categoryLabel,
  }));

  return { categories, products };
}

/** Caractéristiques saisies une par ligne au format « Libellé : valeur ». */
export function parseSpecs(raw: string): Spec[] {
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [label, ...rest] = line.split(":");
      return { label: label.trim(), value: rest.join(":").trim() };
    })
    .filter((spec) => spec.label.length > 0 && spec.value.length > 0);
}
