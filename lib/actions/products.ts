"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { parseImageList, removedStoragePaths, type ImageEntry } from "@/lib/admin/image-list";
import { removeUnreferencedFiles } from "@/lib/admin/storage-cleanup";
import { requireAdmin } from "@/lib/auth";
import type { ProductSpec } from "@/lib/catalog";
import { slugify } from "@/lib/slugify";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type Supabase = Awaited<ReturnType<typeof createSupabaseServerClient>>;

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
  revalidatePath("/admin/produits");
}

function fail(path: string, message: string): never {
  redirect(`${path}?error=${encodeURIComponent(message)}`);
}

/** Galerie enregistrée d'un produit (pour comparer et supprimer les fichiers retirés). */
async function storedImages(supabase: Supabase, productId: string): Promise<{ storagePath: string | null }[]> {
  const { data } = await supabase.from("product_images").select("storage_path").eq("product_id", productId);
  return ((data ?? []) as { storage_path: string | null }[]).map((row) => ({ storagePath: row.storage_path }));
}

/**
 * Remplace la galerie du produit ; la première image devient l'image principale.
 * Les nouvelles lignes sont insérées avant de retirer les anciennes : si
 * l'insertion échoue, la galerie précédente reste intacte.
 */
async function replaceGallery(supabase: Supabase, productId: string, images: ImageEntry[], fallbackAlt: string) {
  const { data: oldRows, error: readError } = await supabase
    .from("product_images")
    .select("id, storage_path")
    .eq("product_id", productId);
  if (readError) throw new Error(readError.message);
  const before = ((oldRows ?? []) as { id: string; storage_path: string | null }[]);

  let newIds: string[] = [];
  if (images.length > 0) {
    // Principale posée à la fin : l'index unique n'autorise qu'une principale à la fois.
    const { data, error } = await supabase
      .from("product_images")
      .insert(
        images.map((image, position) => ({
          product_id: productId,
          url: image.url,
          storage_path: image.storagePath,
          alt: image.alt || fallbackAlt,
          position,
          is_main: false,
        })),
      )
      .select("id, position");
    if (error) throw new Error(error.message);
    newIds = ((data ?? []) as { id: string; position: number }[]).sort((a, b) => a.position - b.position).map((row) => row.id);
  }

  if (before.length > 0) {
    const { error } = await supabase.from("product_images").delete().in("id", before.map((row) => row.id));
    if (error) throw new Error(error.message);
  }
  if (newIds.length > 0) {
    const { error } = await supabase.from("product_images").update({ is_main: true }).eq("id", newIds[0]);
    if (error) throw new Error(error.message);
  }

  await removeUnreferencedFiles(
    supabase,
    removedStoragePaths(before.map((row) => ({ storagePath: row.storage_path })), images),
  );
}

export async function saveProductAction(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim().slice(0, 160);
  const slugInput = String(formData.get("slug") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim().slice(0, 2000);
  const badge = String(formData.get("badge") ?? "").trim().slice(0, 40);
  const stock = String(formData.get("stock") ?? "").trim().slice(0, 40) || "Disponible";
  const specsRaw = String(formData.get("specs") ?? "");
  const featured = formData.get("featured") === "on";
  const published = formData.get("published") === "on";
  const position = Number(formData.get("position") ?? 0) || 0;

  const slug = slugify(slugInput || name);
  const failurePath = id ? `/admin/produits/${id}` : "/admin/produits/nouveau";

  if (!name || !slug || !category) fail(failurePath, "Nom et catégorie sont obligatoires.");

  const images = parseImageList(String(formData.get("images") ?? "[]"));
  if (!images) fail(failurePath, "Liste d'images invalide : rechargez la page et réessayez.");
  if (published && images.length === 0) {
    fail(failurePath, "Ajoutez au moins une photo avant de publier ce produit.");
  }

  const main = images[0];
  const payload = {
    slug,
    name,
    category_id: category,
    description,
    // Image principale lue par le site ; vide = image du manifest ou provisoire.
    image_url: main?.url ?? "",
    image_alt: main?.alt || name,
    badge: badge.length > 0 ? badge : null,
    stock,
    specs: parseSpecs(specsRaw),
    featured,
    published,
    position,
  };

  const supabase = await createSupabaseServerClient();
  const result = id
    ? await supabase.from("products").update(payload).eq("id", id).select("id").single()
    : await supabase.from("products").insert(payload).select("id").single();

  if (result.error || !result.data) {
    fail(
      failurePath,
      result.error?.code === "23505"
        ? "Ce slug est déjà utilisé par un autre produit."
        : (result.error?.message ?? "Enregistrement impossible."),
    );
  }

  try {
    await replaceGallery(supabase, (result.data as { id: string }).id, images, name);
  } catch (error) {
    fail(failurePath, `Produit enregistré, mais la galerie n'a pas pu l'être : ${error instanceof Error ? error.message : ""}`);
  }

  refreshCatalog();
  redirect(`/admin/produits?ok=${encodeURIComponent("Produit enregistré.")}`);
}

/** Bascule un booléen (publié, mis en avant) depuis la liste. */
async function toggle(formData: FormData, column: "published" | "featured", labels: [string, string]) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "").trim();
  const value = formData.get("value") === "true";
  const back = String(formData.get("back") ?? "/admin/produits");
  const returnTo = back.startsWith("/admin/produits") ? back : "/admin/produits";

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("products").update({ [column]: value }).eq("id", id);
  refreshCatalog();
  const separator = returnTo.includes("?") ? "&" : "?";
  redirect(
    error
      ? `${returnTo}${separator}error=${encodeURIComponent(error.message)}`
      : `${returnTo}${separator}ok=${encodeURIComponent(value ? labels[0] : labels[1])}`,
  );
}

export async function togglePublishedAction(formData: FormData) {
  await toggle(formData, "published", ["Produit publié.", "Produit masqué du site."]);
}

export async function toggleFeaturedAction(formData: FormData) {
  await toggle(formData, "featured", ["Produit mis en avant.", "Produit retiré de la mise en avant."]);
}

/** Copie un produit (non publié) avec sa galerie ; les fichiers sont partagés, pas dupliqués. */
export async function duplicateProductAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "").trim();
  const supabase = await createSupabaseServerClient();

  const { data: source } = await supabase.from("products").select("*").eq("id", id).maybeSingle();
  if (!source) fail("/admin/produits", "Produit introuvable.");

  const original = source as Record<string, unknown> & { slug: string; name: string };
  const { data: existing } = await supabase.from("products").select("slug").like("slug", `${original.slug}-copie%`);
  const taken = new Set(((existing ?? []) as { slug: string }[]).map((row) => row.slug));
  let slug = `${original.slug}-copie`;
  for (let n = 2; taken.has(slug); n++) slug = `${original.slug}-copie-${n}`;

  const copy: Record<string, unknown> = { ...original, slug, name: `${original.name} (copie)`, published: false, featured: false };
  delete copy.id;
  delete copy.created_at;
  delete copy.updated_at;

  const { data: created, error } = await supabase.from("products").insert(copy).select("id").single();
  if (error || !created) fail("/admin/produits", error?.message ?? "Copie impossible.");

  // La copie partage les mêmes fichiers : ils ne sont supprimés de Storage que
  // lorsque plus aucun produit ne les utilise (voir removeUnreferencedFiles).
  const { data: gallery } = await supabase
    .from("product_images")
    .select("url, storage_path, alt, position, is_main")
    .eq("product_id", id);
  const rows = (gallery ?? []) as { url: string; storage_path: string | null; alt: string; position: number; is_main: boolean }[];
  if (rows.length > 0) {
    await supabase
      .from("product_images")
      .insert(rows.map((row) => ({ ...row, product_id: (created as { id: string }).id })));
  }

  refreshCatalog();
  redirect(`/admin/produits/${(created as { id: string }).id}?ok=${encodeURIComponent("Copie créée (non publiée).")}`);
}

export async function deleteProductAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) redirect("/admin/produits");

  const supabase = await createSupabaseServerClient();
  const files = (await storedImages(supabase, id)).map((image) => image.storagePath).filter(Boolean) as string[];
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) fail("/admin/produits", error.message);

  // Fichiers encore utilisés par une copie ou une catégorie : conservés.
  await removeUnreferencedFiles(supabase, files);

  refreshCatalog();
  redirect(`/admin/produits?ok=${encodeURIComponent("Produit supprimé.")}`);
}
