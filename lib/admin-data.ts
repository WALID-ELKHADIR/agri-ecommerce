import "server-only";

import type { ProductSpec } from "@/lib/catalog";
import { createSupabaseServerClient } from "@/lib/supabase/server";

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
};

function mapRow(row: ProductRow): AdminProduct {
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
  };
}

export async function listAdminProducts() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("products")
    .select(
      "id, slug, name, category_id, description, image_url, image_alt, badge, stock, specs, featured, published, position",
    )
    .order("position", { ascending: true })
    .order("created_at", { ascending: true });

  return {
    products: (data ?? []).map((row) => mapRow(row as ProductRow)),
    error: error?.message ?? null,
  };
}

export async function getAdminProduct(id: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("products")
    .select(
      "id, slug, name, category_id, description, image_url, image_alt, badge, stock, specs, featured, published, position",
    )
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return mapRow(data as ProductRow);
}

export async function listAdminCategories() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("categories")
    .select("id, label, short, description")
    .order("position", { ascending: true });

  return data ?? [];
}

export type AdminQuote = {
  id: string;
  name: string | null;
  phone: string | null;
  email: string | null;
  profile: string | null;
  productSlug: string | null;
  quantity: number | null;
  message: string | null;
  source: string;
  status: string;
  createdAt: string;
};

export async function listQuoteRequests() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("quote_requests")
    .select(
      "id, name, phone, email, profile, product_slug, quantity, message, source, status, created_at",
    )
    .order("created_at", { ascending: false })
    .limit(200);

  return {
    quotes: (data ?? []).map((row) => ({
      id: row.id as string,
      name: row.name as string | null,
      phone: row.phone as string | null,
      email: row.email as string | null,
      profile: row.profile as string | null,
      productSlug: row.product_slug as string | null,
      quantity: row.quantity as number | null,
      message: row.message as string | null,
      source: row.source as string,
      status: row.status as string,
      createdAt: row.created_at as string,
    })),
    error: error?.message ?? null,
  };
}

export async function getAdminStats() {
  const supabase = await createSupabaseServerClient();

  const [products, published, quotes, pending] = await Promise.all([
    supabase.from("products").select("id", { count: "exact", head: true }),
    supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("published", true),
    supabase.from("quote_requests").select("id", { count: "exact", head: true }),
    supabase
      .from("quote_requests")
      .select("id", { count: "exact", head: true })
      .eq("status", "new"),
  ]);

  return {
    products: products.count ?? 0,
    published: published.count ?? 0,
    quotes: quotes.count ?? 0,
    pending: pending.count ?? 0,
  };
}
