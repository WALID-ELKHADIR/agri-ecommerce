/**
 * Filtres, recherche et tri du catalogue public, lus depuis l'URL
 * (module pur, testé dans tests/catalog-query.test.ts).
 */
import { slugify } from "./slugify.ts";

export type CatalogSort = "featured" | "name" | "category";
export type CatalogQuery = { q: string; gamme: string | null; dispo: string | null; tri: CatalogSort };

type Param = string | string[] | undefined;

type QueryableProduct = {
  name: string;
  slug: string;
  category: string;
  categoryLabel: string;
  stock: string;
  featured?: boolean;
  specs: { label: string; value: string }[];
};

const SORTS: CatalogSort[] = ["featured", "name", "category"];
const MAX_QUERY = 80;
const collator = new Intl.Collator("fr", { sensitivity: "base", numeric: true });

function values(param: Param): string[] {
  if (param === undefined) return [];
  return Array.isArray(param) ? param : [param];
}

function firstKnown(param: Param, allowed: readonly string[]): string | null {
  return values(param).find((value) => allowed.includes(value)) ?? null;
}

/** Clé de disponibilité : « Sur demande » → « sur-demande ». */
export function stockKey(stock: string): string {
  return slugify(stock);
}

export function parseCatalogQuery(
  params: Record<string, Param>,
  known: { categories: string[]; stocks: string[] },
): CatalogQuery {
  return {
    q: (values(params.q)[0] ?? "").trim().slice(0, MAX_QUERY),
    gamme: firstKnown(params.gamme, known.categories),
    dispo: firstKnown(params.dispo, known.stocks),
    tri: (firstKnown(params.tri, SORTS) as CatalogSort | null) ?? "featured",
  };
}

/** Disponibilités réellement présentes, avec leur libellé le plus courant et leur nombre. */
export function stockOptions(products: { stock: string }[]): { value: string; label: string; count: number }[] {
  const groups = new Map<string, { labels: Map<string, number>; count: number }>();
  for (const { stock } of products) {
    const key = stockKey(stock);
    if (!key) continue;
    const group = groups.get(key) ?? { labels: new Map(), count: 0 };
    group.count++;
    group.labels.set(stock.trim(), (group.labels.get(stock.trim()) ?? 0) + 1);
    groups.set(key, group);
  }
  return [...groups.entries()].map(([value, group]) => ({
    value,
    label: [...group.labels.entries()].sort((a, b) => b[1] - a[1])[0][0],
    count: group.count,
  }));
}

export function queryCatalog<T extends QueryableProduct>(products: T[], query: CatalogQuery): T[] {
  const words = slugify(query.q).split("-").filter(Boolean);
  const sorters: Record<CatalogSort, (a: T, b: T) => number> = {
    featured: (a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)),
    name: (a, b) => collator.compare(a.name, b.name),
    category: (a, b) => collator.compare(a.categoryLabel, b.categoryLabel),
  };

  return products
    .filter((product) => {
      if (query.gamme && product.category !== query.gamme) return false;
      if (query.dispo && stockKey(product.stock) !== query.dispo) return false;
      if (words.length) {
        const haystack = slugify(
          [product.name, product.slug, product.categoryLabel, ...product.specs.map((s) => `${s.label} ${s.value}`)].join(" "),
        );
        if (!words.every((word) => haystack.includes(word))) return false;
      }
      return true;
    })
    .sort(sorters[query.tri]);
}

/** Lien vers le catalogue, sans les valeurs par défaut. */
export function catalogHref(query: Partial<CatalogQuery>): string {
  const params = new URLSearchParams();
  if (query.q) params.set("q", query.q);
  if (query.gamme) params.set("gamme", query.gamme);
  if (query.dispo) params.set("dispo", query.dispo);
  if (query.tri && query.tri !== "featured") params.set("tri", query.tri);
  const search = params.toString();
  return search ? `/produits?${search}` : "/produits";
}
