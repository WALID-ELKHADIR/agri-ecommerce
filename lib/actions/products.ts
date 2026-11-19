"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import type { ProductSpec } from "@/lib/catalog";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseSpecs(raw: string): ProductSpec[] {
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [label, ...rest] = line.split(":");
      return { label: label.trim(), value: rest.join(":").trim() };
    })
    .filter((spec) => spec.label.length > 0 && spec.value.length > 0);
}

function refreshCatalog() {
  updateTag("catalog");
  revalidatePath("/");
  revalidatePath("/produits");
}

export async function saveProductAction(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const image = String(formData.get("image") ?? "").trim();
  const imageAlt = String(formData.get("image_alt") ?? "").trim();
  const badge = String(formData.get("badge") ?? "").trim();
  const stock = String(formData.get("stock") ?? "").trim() || "Disponible";
  const specsRaw = String(formData.get("specs") ?? "");
  const featured = formData.get("featured") === "on";
  const published = formData.get("published") === "on";
  const position = Number(formData.get("position") ?? 0) || 0;

  const slug = slugify(slugInput || name);
  const failurePath = id ? `/admin/produits/${id}` : "/admin/produits/nouveau";

  if (!name || !slug || !category || !image) {
    redirect(`${failurePath}?error=${encodeURIComponent("Nom, slug, gamme et image sont obligatoires.")}`);
  }

  const payload = {
    slug,
    name,
    category_id: category,
    description,
    image_url: image,
    image_alt: imageAlt || name,
    badge: badge.length > 0 ? badge : null,
    stock,
    specs: parseSpecs(specsRaw),
    featured,
    published,
    position,
  };

  const supabase = await createSupabaseServerClient();
  const { error } = id
    ? await supabase.from("products").update(payload).eq("id", id)
    : await supabase.from("products").insert(payload);

  if (error) {
    const message =
      error.code === "23505"
        ? "Ce slug est déjà utilisé par un autre produit."
        : error.message;
    redirect(`${failurePath}?error=${encodeURIComponent(message)}`);
  }

  refreshCatalog();
  redirect("/admin/produits?ok=1");
}

export async function deleteProductAction(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "").trim();

  if (!id) {
    redirect("/admin/produits");
  }

  const supabase = await createSupabaseServerClient();
  await supabase.from("products").delete().eq("id", id);

  refreshCatalog();
  redirect("/admin/produits?deleted=1");
}
