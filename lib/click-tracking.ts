/**
 * Lecture des clics délégués (module pur, testé dans tests/click-tracking.test.ts).
 * Les cartes produit sont du HTML rendu par le serveur, sans composant client :
 * un seul écouteur global lit ces attributs `data-*` au clic.
 */
import { QUOTE_SOURCES, type QuoteSource } from "./quote-sources.ts";
import type { QuoteRequestInput } from "./quote-validation.ts";

type Attributes = { source?: string; slug?: string; qty?: string; name?: string };

function quantity(value: string | undefined): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 1 ? Math.min(parsed, 99) : 1;
}

/** Demande à enregistrer pour un clic sur un lien `wa.me` ; null si le lien ou la source sont inconnus. */
export function waClickRecord(attributes: Attributes, href: string): QuoteRequestInput | null {
  if (!QUOTE_SOURCES.includes(attributes.source as QuoteSource)) return null;
  let url: URL;
  try {
    url = new URL(href);
  } catch {
    return null;
  }
  if (url.hostname !== "wa.me") return null;
  const message = url.searchParams.get("text") ?? "";
  const source = attributes.source as QuoteSource;
  return attributes.slug
    ? { source, message, productSlug: attributes.slug, quantity: quantity(attributes.qty) }
    : { source, message };
}

/** Produit à ajouter à la liste de devis depuis un bouton `data-quote-add`. */
export function quoteAddFromAttributes(
  attributes: Attributes,
): { product: { slug: string; name: string }; quantity: number } | null {
  if (!attributes.slug || !attributes.name) return null;
  return { product: { slug: attributes.slug, name: attributes.name }, quantity: quantity(attributes.qty) };
}
