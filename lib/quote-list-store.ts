/**
 * Liste de devis du visiteur, gardée dans le navigateur (module pur, testé
 * dans tests/quote-list-store.test.ts). Toute lecture ou écriture du stockage
 * est protégée : navigation privée, quota plein ou données corrompues ne
 * cassent jamais la liste, qui continue alors en mémoire.
 */

export type QuoteLine = { slug: string; name: string; quantity: number };
export type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export const QUOTE_LIST_KEY = "saqia:devis:v1";
const MAX_QUANTITY = 99;
const MAX_LINES = 50;
const EMPTY: QuoteLine[] = [];

function clampQuantity(value: number): number {
  return Math.min(MAX_QUANTITY, Math.max(1, Math.floor(value)));
}

function isLine(value: unknown): value is QuoteLine {
  if (typeof value !== "object" || value === null) return false;
  const { slug, name, quantity } = value as Record<string, unknown>;
  return (
    typeof slug === "string" &&
    slug.length > 0 &&
    slug.length <= 160 &&
    typeof name === "string" &&
    name.length > 0 &&
    name.length <= 200 &&
    typeof quantity === "number" &&
    Number.isFinite(quantity) &&
    quantity >= 1
  );
}

function read(storage: () => StorageLike | null): QuoteLine[] {
  try {
    const raw = storage()?.getItem(QUOTE_LIST_KEY);
    if (!raw) return EMPTY;
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return EMPTY;
    return parsed
      .filter(isLine)
      .slice(0, MAX_LINES)
      .map((line) => ({ slug: line.slug, name: line.name, quantity: clampQuantity(line.quantity) }));
  } catch {
    return EMPTY;
  }
}

export function createQuoteListStore(storage: () => StorageLike | null) {
  let lines = read(storage);
  const listeners = new Set<() => void>();

  function commit(next: QuoteLine[]) {
    lines = next;
    try {
      const target = storage();
      if (next.length === 0) target?.removeItem(QUOTE_LIST_KEY);
      else target?.setItem(QUOTE_LIST_KEY, JSON.stringify(next));
    } catch {
      // Stockage indisponible : la liste reste en mémoire.
    }
    listeners.forEach((listener) => listener());
  }

  return {
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    getSnapshot: () => lines,
    getServerSnapshot: () => EMPTY,
    add(product: { slug: string; name: string }, quantity = 1) {
      const existing = lines.find((line) => line.slug === product.slug);
      if (existing) {
        commit(
          lines.map((line) =>
            line.slug === product.slug ? { ...line, quantity: clampQuantity(line.quantity + quantity) } : line,
          ),
        );
      } else if (lines.length < MAX_LINES) {
        commit([...lines, { slug: product.slug, name: product.name, quantity: clampQuantity(quantity) }]);
      }
    },
    setQuantity(slug: string, quantity: number) {
      if (quantity <= 0) {
        commit(lines.filter((line) => line.slug !== slug));
        return;
      }
      commit(lines.map((line) => (line.slug === slug ? { ...line, quantity: clampQuantity(quantity) } : line)));
    },
    remove(slug: string) {
      commit(lines.filter((line) => line.slug !== slug));
    },
    clear() {
      commit(EMPTY);
    },
    count: () => lines.reduce((total, line) => total + line.quantity, 0),
    syncFromStorage() {
      lines = read(storage);
      listeners.forEach((listener) => listener());
    },
  };
}

/** Instance du navigateur (aucun accès au stockage côté serveur). */
export const quoteList = createQuoteListStore(() => {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
});
