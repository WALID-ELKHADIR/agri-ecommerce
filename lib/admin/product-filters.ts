/** Recherche, filtres et tri de la liste des produits de l'admin (module pur). */
import { slugify } from "../slugify.ts";

export type FilterableProduct = {
  name: string;
  slug: string;
  category: string;
  published: boolean;
  featured: boolean;
  position: number;
  createdAt: string;
};

export type ProductSort = "position" | "name" | "recent" | "featured";
export type ProductStatus = "all" | "published" | "draft";

export type ProductFilters = {
  q?: string;
  category?: string;
  status?: ProductStatus;
  sort?: ProductSort;
};

const collator = new Intl.Collator("fr", { sensitivity: "base", numeric: true });

const SORTS: Record<ProductSort, (a: FilterableProduct, b: FilterableProduct) => number> = {
  // À position égale, l'ordre reçu (celui de la base) est conservé : le tri est stable.
  position: (a, b) => a.position - b.position,
  name: (a, b) => collator.compare(a.name, b.name),
  recent: (a, b) => b.createdAt.localeCompare(a.createdAt),
  featured: (a, b) => Number(b.featured) - Number(a.featured) || a.position - b.position,
};

export function filterProducts<T extends FilterableProduct>(products: T[], filters: ProductFilters): T[] {
  const words = slugify(filters.q ?? "").split("-").filter(Boolean);
  return products
    .filter((product) => {
      if (filters.category && product.category !== filters.category) return false;
      if (filters.status === "published" && !product.published) return false;
      if (filters.status === "draft" && product.published) return false;
      if (words.length) {
        const haystack = `${slugify(product.name)}-${product.slug}`;
        if (!words.every((word) => haystack.includes(word))) return false;
      }
      return true;
    })
    .sort(SORTS[filters.sort ?? "position"]);
}
