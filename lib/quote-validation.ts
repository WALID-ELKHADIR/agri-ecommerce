/**
 * Validation des demandes de devis avant insertion dans `quote_requests`.
 * Les limites reprennent les contraintes CHECK de la migration
 * 20261119100000_admin_rls.sql. Module pur, testé dans tests/quote-validation.test.ts.
 */

/** Délai minimal entre l'affichage d'un formulaire et son envoi (anti-robot). */
export const MIN_FILL_MS = 3000;

const LIMITS = {
  name: 120,
  phone: 40,
  email: 160,
  profile: 120,
  productSlug: 160,
  message: 2000,
  source: 40,
  itemSlug: 160,
  itemName: 200,
} as const;

const MAX_QUANTITY = 100_000;
const MAX_ITEMS = 50;

export type QuoteItem = { slug: string; name: string; quantity: number };

export type QuoteRequestInput = {
  name?: string;
  phone?: string;
  email?: string;
  profile?: string;
  productSlug?: string;
  quantity?: number;
  message?: string;
  source?: string;
  /** Devis multi-produits (liste de devis). */
  items?: QuoteItem[];
  /** Champ piège invisible : un humain le laisse vide. */
  website?: string;
  /** Horodatage (ms) de l'affichage du formulaire ; absent pour un simple clic. */
  startedAt?: number;
};

/** Ligne prête à insérer dans `quote_requests`. */
export type QuoteInsert = {
  name: string | null;
  phone: string | null;
  email: string | null;
  profile: string | null;
  product_slug: string | null;
  quantity: number | null;
  message: string | null;
  source: string;
  items: QuoteItem[] | null;
};

export type QuoteValidation =
  | { ok: true; data: QuoteInsert }
  | { ok: false; reason: "empty" | "spam" | "invalid" };

function clean(value: string | undefined, max: number): string | null {
  const trimmed = (value ?? "").trim().slice(0, max);
  return trimmed ? trimmed : null;
}

function validQuantity(value: number | undefined): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 1 && value <= MAX_QUANTITY;
}

function cleanItems(items: QuoteItem[] | undefined): QuoteItem[] | null | "invalid" {
  if (items === undefined || items.length === 0) return null;
  if (items.length > MAX_ITEMS) return "invalid";

  const cleaned: QuoteItem[] = [];
  for (const item of items) {
    const slug = clean(item.slug, LIMITS.itemSlug);
    const name = clean(item.name, LIMITS.itemName);
    if (!slug || !name || !validQuantity(item.quantity)) return "invalid";
    cleaned.push({ slug, name, quantity: item.quantity });
  }
  return cleaned;
}

export function validateQuoteInput(input: QuoteRequestInput, now: number): QuoteValidation {
  if (input.website?.trim()) {
    return { ok: false, reason: "spam" };
  }
  if (input.startedAt !== undefined && now - input.startedAt < MIN_FILL_MS) {
    return { ok: false, reason: "spam" };
  }

  const items = cleanItems(input.items);
  if (items === "invalid") {
    return { ok: false, reason: "invalid" };
  }

  const data: QuoteInsert = {
    name: clean(input.name, LIMITS.name),
    phone: clean(input.phone, LIMITS.phone),
    email: clean(input.email, LIMITS.email),
    profile: clean(input.profile, LIMITS.profile),
    product_slug: clean(input.productSlug, LIMITS.productSlug),
    quantity: validQuantity(input.quantity) ? input.quantity : null,
    message: clean(input.message, LIMITS.message),
    source: clean(input.source, LIMITS.source) ?? "site",
    items,
  };

  const hasContent =
    data.name || data.phone || data.email || data.message || data.product_slug || data.items;
  if (!hasContent) {
    return { ok: false, reason: "empty" };
  }

  return { ok: true, data };
}
