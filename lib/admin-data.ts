import "server-only";

import type { ProductSpec } from "@/lib/catalog";
import type { QuoteItem } from "@/lib/quote-validation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// ---------------------------------------------------------------------------
// Produits
// ---------------------------------------------------------------------------

export type AdminProduct = {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  image: string;
  imageAlt: string;
  badge: string | null;
  stock: string;
  specs: ProductSpec[];
  featured: boolean;
  published: boolean;
  position: number;
  createdAt: string;
  nameAr: string;
  descriptionAr: string;
  specsAr: ProductSpec[];
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
  published: boolean;
  position: number;
  created_at: string;
  // Absentes tant que 20261124100000_contenu_arabe.sql n'est pas appliquée.
  name_ar?: string | null;
  description_ar?: string | null;
  specs_ar?: ProductSpec[] | null;
};

// « * » : l'admin reste utilisable avant la migration du contenu arabe.
const PRODUCT_COLUMNS = "*";

function mapProduct(row: ProductRow): AdminProduct {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    category: row.category_id,
    description: row.description,
    image: row.image_url,
    imageAlt: row.image_alt,
    badge: row.badge,
    stock: row.stock,
    specs: Array.isArray(row.specs) ? row.specs : [],
    featured: row.featured,
    published: row.published,
    position: row.position,
    createdAt: row.created_at,
    nameAr: row.name_ar ?? "",
    descriptionAr: row.description_ar ?? "",
    specsAr: Array.isArray(row.specs_ar) ? row.specs_ar : [],
  };
}

export async function listAdminProducts() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_COLUMNS)
    .order("position", { ascending: true })
    .order("created_at", { ascending: true });

  return {
    products: ((data ?? []) as ProductRow[]).map(mapProduct),
    error: error?.message ?? null,
  };
}

export async function getAdminProduct(id: string): Promise<AdminProduct | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("products").select(PRODUCT_COLUMNS).eq("id", id).maybeSingle();
  if (error || !data) return null;
  return mapProduct(data as ProductRow);
}

/** Image de la galerie d'un produit (ou d'une catégorie), telle que manipulée par l'admin. */
export type AdminImage = {
  url: string;
  /** Chemin dans le bucket product-images ; null pour une image du site (manifest). */
  storagePath: string | null;
  alt: string;
};

/**
 * Galerie d'un produit, image principale en premier. Sans galerie enregistrée
 * (produit antérieur à la phase 3), l'image principale du produit sert de point de départ.
 */
export async function getProductImages(product: AdminProduct): Promise<AdminImage[]> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("product_images")
    .select("url, storage_path, alt, is_main, position")
    .eq("product_id", product.id)
    .order("is_main", { ascending: false })
    .order("position", { ascending: true });

  const rows = (data ?? []) as { url: string; storage_path: string | null; alt: string }[];
  if (rows.length > 0) {
    return rows.map((row) => ({ url: row.url, storagePath: row.storage_path, alt: row.alt }));
  }
  return product.image ? [{ url: product.image, storagePath: null, alt: product.imageAlt }] : [];
}

// ---------------------------------------------------------------------------
// Catégories
// ---------------------------------------------------------------------------

export type AdminCategory = {
  id: string;
  label: string;
  short: string;
  description: string;
  imageUrl: string | null;
  position: number;
  productCount: number;
  labelAr: string;
  shortAr: string;
  descriptionAr: string;
};

export async function listAdminCategories(): Promise<AdminCategory[]> {
  const supabase = await createSupabaseServerClient();
  const [categories, products] = await Promise.all([
    supabase.from("categories").select("*").order("position"),
    supabase.from("products").select("category_id"),
  ]);

  const counts = new Map<string, number>();
  for (const row of (products.data ?? []) as { category_id: string }[]) {
    counts.set(row.category_id, (counts.get(row.category_id) ?? 0) + 1);
  }

  type Row = {
    id: string;
    label: string;
    short: string;
    description: string;
    image_url: string | null;
    position: number;
    label_ar?: string | null;
    short_ar?: string | null;
    description_ar?: string | null;
  };
  return ((categories.data ?? []) as Row[]).map((row) => ({
    id: row.id,
    label: row.label,
    short: row.short,
    description: row.description,
    imageUrl: row.image_url,
    position: row.position,
    productCount: counts.get(row.id) ?? 0,
    labelAr: row.label_ar ?? "",
    shortAr: row.short_ar ?? "",
    descriptionAr: row.description_ar ?? "",
  }));
}

export async function getAdminCategory(id: string): Promise<AdminCategory | null> {
  const categories = await listAdminCategories();
  return categories.find((category) => category.id === id) ?? null;
}

// ---------------------------------------------------------------------------
// Demandes de devis
// ---------------------------------------------------------------------------

export type QuoteStatus = "new" | "contacted" | "won" | "lost";

export type AdminQuote = {
  id: string;
  name: string | null;
  phone: string | null;
  email: string | null;
  profile: string | null;
  productSlug: string | null;
  quantity: number | null;
  message: string | null;
  items: QuoteItem[] | null;
  source: string;
  status: QuoteStatus;
  createdAt: string;
};

export async function listQuoteRequests(limit = 1000) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("quote_requests")
    .select("id, name, phone, email, profile, product_slug, quantity, message, items, source, status, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  type Row = {
    id: string;
    name: string | null;
    phone: string | null;
    email: string | null;
    profile: string | null;
    product_slug: string | null;
    quantity: number | null;
    message: string | null;
    items: QuoteItem[] | null;
    source: string;
    status: QuoteStatus;
    created_at: string;
  };

  return {
    quotes: ((data ?? []) as Row[]).map(
      (row): AdminQuote => ({
        id: row.id,
        name: row.name,
        phone: row.phone,
        email: row.email,
        profile: row.profile,
        productSlug: row.product_slug,
        quantity: row.quantity,
        message: row.message,
        items: Array.isArray(row.items) ? row.items : null,
        source: row.source,
        status: row.status,
        createdAt: row.created_at,
      }),
    ),
    error: error?.message ?? null,
  };
}

// ---------------------------------------------------------------------------
// Tableau de bord
// ---------------------------------------------------------------------------

export async function getAdminStats() {
  const supabase = await createSupabaseServerClient();

  const [products, published, quotes, pending] = await Promise.all([
    supabase.from("products").select("id", { count: "exact", head: true }),
    supabase.from("products").select("id", { count: "exact", head: true }).eq("published", true),
    supabase.from("quote_requests").select("id", { count: "exact", head: true }),
    supabase.from("quote_requests").select("id", { count: "exact", head: true }).eq("status", "new"),
  ]);

  return {
    products: products.count ?? 0,
    published: published.count ?? 0,
    quotes: quotes.count ?? 0,
    pending: pending.count ?? 0,
  };
}
