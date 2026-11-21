import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import {
  categories as fallbackCategories,
  products as fallbackProducts,
  type Category,
  type Product,
  type ProductSpec,
  withImages,
} from "@/lib/catalog";
import type { Locale } from "@/lib/i18n";
import { localizeCatalog, type CategoryArabic, type ProductArabic } from "@/lib/i18n/localize-catalog";
import { getPublicClient } from "@/lib/supabase/public";

export type Catalog = {
  categories: Category[];
  products: Product[];
};

const ALL_CATEGORY: Category = {
  id: "all",
  label: "Tous les produits",
  short: "Tous",
  description: "L'ensemble de notre gamme irrigation et pompage.",
};

type CategoryRow = {
  id: string;
  label: string;
  short: string;
  description: string;
  image_url: string | null;
  // Colonnes de 20261124100000_contenu_arabe.sql (absentes tant qu'elle n'est pas appliquée).
  label_ar?: string | null;
  short_ar?: string | null;
  description_ar?: string | null;
};

type ProductRow = {
  id: string;
  slug: string;
  name: string;
  category_id: string;
  description: string;
  image_url: string;
  image_alt: string;
  badge: string | null;
  stock: string;
  specs: ProductSpec[] | null;
  featured: boolean;
  name_ar?: string | null;
  description_ar?: string | null;
  specs_ar?: ProductSpec[] | null;
};

function productArabic(row: ProductRow): ProductArabic | undefined {
  if (!row.name_ar && !row.description_ar && !row.specs_ar) return undefined;
  return { name: row.name_ar, description: row.description_ar, specs: Array.isArray(row.specs_ar) ? row.specs_ar : null };
}

function categoryArabic(row: CategoryRow): CategoryArabic | undefined {
  if (!row.label_ar && !row.short_ar && !row.description_ar) return undefined;
  return { label: row.label_ar, short: row.short_ar, description: row.description_ar };
}

const fallbackCatalog: Catalog = {
  categories: fallbackCategories,
  products: fallbackProducts,
};

type GalleryRow = { product_id: string; url: string; alt: string; is_main: boolean; position: number };

function mapProduct(row: ProductRow, labels: Map<string, string>, gallery: GalleryRow[] = []): Product {
  // Images : celle choisie dans l'admin, sinon celle du manifest (un ancien
  // chemin .jpg encore en base est remplacé par l'image du manifest).
  const product = withImages(
    {
      slug: row.slug,
      name: row.name,
      category: row.category_id,
      categoryLabel: labels.get(row.category_id) ?? "Catalogue",
      description: row.description,
      badge: row.badge ?? undefined,
      specs: Array.isArray(row.specs) ? row.specs : [],
      stock: row.stock,
      featured: row.featured,
      ...(productArabic(row) ? { ar: productArabic(row) } : {}),
    },
    { src: row.image_url, alt: row.image_alt || row.name },
  );
  // Galerie gérée depuis l'admin : dès qu'elle existe, elle remplace celle du
  // manifest, même si elle ne contient que l'image principale.
  if (gallery.length === 0) return product;
  const extra = gallery.filter((image) => !image.is_main);
  return {
    ...product,
    gallery: extra.map((image) => ({
      src: image.url,
      alt: image.alt || row.name,
      width: 1200,
      height: 1200,
      placeholder: false,
    })),
  };
}

async function loadCatalog(): Promise<Catalog> {
  const supabase = getPublicClient();

  if (!supabase) {
    return fallbackCatalog;
  }

  try {
    const [categoriesResult, productsResult, galleryResult] = await Promise.all([
      supabase
        .from("categories")
        .select("*")
        .order("position", { ascending: true }),
      supabase
        .from("products")
        .select("*")
        .eq("published", true)
        .order("position", { ascending: true })
        .order("created_at", { ascending: true }),
      // Galeries des produits publiés (la RLS masque les autres).
      supabase.from("product_images").select("product_id, url, alt, is_main, position").order("position"),
    ]);

    if (categoriesResult.error || productsResult.error) {
      console.error(
        "[catalog] lecture Supabase impossible, données locales utilisées",
        categoriesResult.error ?? productsResult.error,
      );
      return fallbackCatalog;
    }

    const categoryRows = (categoriesResult.data ?? []) as CategoryRow[];
    const productRows = (productsResult.data ?? []) as ProductRow[];

    if (categoryRows.length === 0 || productRows.length === 0) {
      return fallbackCatalog;
    }

    const labels = new Map(categoryRows.map((row) => [row.id, row.label]));
    const categories: Category[] = [
      ALL_CATEGORY,
      ...categoryRows.map((row) => ({
        id: row.id,
        label: row.label,
        short: row.short,
        description: row.description,
        ...(row.image_url ? { imageUrl: row.image_url } : {}),
        ...(categoryArabic(row) ? { ar: categoryArabic(row) } : {}),
      })),
    ];

    return {
      categories,
      products: productRows.map((row) =>
        mapProduct(
          row,
          labels,
          ((galleryResult.data ?? []) as GalleryRow[]).filter((image) => image.product_id === row.id),
        ),
      ),
    };
  } catch (error) {
    console.error("[catalog] Supabase injoignable, données locales utilisées", error);
    return fallbackCatalog;
  }
}

/**
 * Catalogue public dans la langue demandée (français par défaut), mis en cache
 * et invalidé après chaque modification admin.
 */
export async function getCatalog(locale: Locale = "fr"): Promise<Catalog> {
  "use cache";
  cacheTag("catalog");
  cacheLife("minutes");

  return localizeCatalog(await loadCatalog(), locale);
}

export async function getProductBySlug(slug: string, locale: Locale = "fr"): Promise<Product | null> {
  const { products } = await getCatalog(locale);
  return products.find((product) => product.slug === slug) ?? null;
}

export async function getRelatedProducts(
  product: Product,
  limit = 3,
  locale: Locale = "fr",
): Promise<Product[]> {
  const { products } = await getCatalog(locale);
  return products
    .filter((item) => item.category === product.category && item.slug !== product.slug)
    .slice(0, limit);
}
