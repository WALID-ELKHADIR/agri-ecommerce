/**
 * Validation des demandes de devis avant insertion dans `quote_requests`.
 * Les limites reprennent les contraintes CHECK de la migration
 * 20261119100000_admin_rls.sql. Module pur, testé dans tests/quote-validation.test.ts.
 *
 * Les données arrivent d'une Server Action : n'importe quel client peut
 * l'appeler avec n'importe quel JSON. Chaque champ est donc vérifié à
 * l'exécution, pas seulement par TypeScript.
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
  /**
   * Durée (ms) entre l'affichage du formulaire et l'envoi, mesurée dans le
   * navigateur (insensible au décalage d'horloge). Absente pour un simple clic.
   */
  elapsedMs?: number;
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

const INVALID = Symbol("invalid");

/** Texte nettoyé, `null` si absent ou vide, `INVALID` si ce n'est pas une chaîne. */
function text(value: unknown, max: number): string | null | typeof INVALID {
  if (value === undefined || value === null) return null;
  if (typeof value !== "string") return INVALID;
  const trimmed = value.trim().slice(0, max);
  return trimmed ? trimmed : null;
}

function validQuantity(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 1 && value <= MAX_QUANTITY;
}

function cleanItems(items: unknown): QuoteItem[] | null | typeof INVALID {
  if (items === undefined || items === null) return null;
  if (!Array.isArray(items) || items.length > MAX_ITEMS) return INVALID;
  if (items.length === 0) return null;

  const cleaned: QuoteItem[] = [];
  for (const item of items as unknown[]) {
    if (typeof item !== "object" || item === null) return INVALID;
    const { slug, name, quantity } = item as Record<string, unknown>;
    const cleanSlug = text(slug, LIMITS.itemSlug);
    const cleanName = text(name, LIMITS.itemName);
    if (typeof cleanSlug !== "string" || typeof cleanName !== "string" || !validQuantity(quantity)) {
      return INVALID;
    }
    cleaned.push({ slug: cleanSlug, name: cleanName, quantity });
  }
  return cleaned;
}

export function validateQuoteInput(input: QuoteRequestInput): QuoteValidation {
  if (typeof input !== "object" || input === null) {
    return { ok: false, reason: "invalid" };
  }

  const website = text(input.website, 200);
  if (website === INVALID || website) {
    return { ok: false, reason: "spam" };
  }

  const { elapsedMs } = input;
  // Une valeur absurde (négative, NaN) vient d'un client défaillant, pas d'un
  // robot pressé : on l'ignore plutôt que de perdre une vraie demande.
  if (typeof elapsedMs === "number" && Number.isFinite(elapsedMs) && elapsedMs >= 0 && elapsedMs < MIN_FILL_MS) {
    return { ok: false, reason: "spam" };
  }

  const items = cleanItems(input.items);
  const fields = {
    name: text(input.name, LIMITS.name),
    phone: text(input.phone, LIMITS.phone),
    email: text(input.email, LIMITS.email),
    profile: text(input.profile, LIMITS.profile),
    product_slug: text(input.productSlug, LIMITS.productSlug),
    message: text(input.message, LIMITS.message),
    source: text(input.source, LIMITS.source),
  };

  if (items === INVALID || Object.values(fields).some((value) => value === INVALID)) {
    return { ok: false, reason: "invalid" };
  }

  const data: QuoteInsert = {
    name: fields.name as string | null,
    phone: fields.phone as string | null,
    email: fields.email as string | null,
    profile: fields.profile as string | null,
    product_slug: fields.product_slug as string | null,
    quantity: validQuantity(input.quantity) ? input.quantity : null,
    message: fields.message as string | null,
    source: (fields.source as string | null) ?? "site",
    items,
  };

  const hasContent =
    data.name || data.phone || data.email || data.message || data.product_slug || data.items;
  if (!hasContent) {
    return { ok: false, reason: "empty" };
  }

  return { ok: true, data };
}
