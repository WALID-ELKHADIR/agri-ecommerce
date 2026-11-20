import type { QuoteRequestInput } from "./quote-validation";

/** Origines possibles d'une demande (colonne `quote_requests.source`, 40 caractères max). */
export const QUOTE_SOURCES = [
  "accueil-hero",
  "accueil-cta",
  "header",
  "carte-produit",
  "fiche-produit",
  "barre-mobile",
  "liste-devis",
  "contact",
  "footer",
] as const;

export type QuoteSource = (typeof QUOTE_SOURCES)[number];

/** Demande enregistrée lors d'un clic WhatsApp : le message envoyé tient lieu de contenu. */
export function clickRecord(
  source: QuoteSource,
  message: string,
  product?: { slug: string; quantity: number },
): QuoteRequestInput {
  return product
    ? { source, message, productSlug: product.slug, quantity: product.quantity }
    : { source, message };
}
