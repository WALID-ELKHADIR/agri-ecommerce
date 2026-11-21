"use server";

import { updateTag } from "next/cache";
import { revalidateLocalized } from "@/lib/i18n/revalidate";
import { redirect } from "next/navigation";
import { parseImageList, storagePathFromUrl } from "@/lib/admin/image-list";
import { removeUnreferencedFiles } from "@/lib/admin/storage-cleanup";
import { requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/slugify";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function refresh() {
  updateTag("catalog");
  revalidateLocalized("/");
  revalidateLocalized("/produits");
  revalidateLocalized("/admin/categories");
}

function fail(path: string, message: string): never {
  redirect(`${path}?error=${encodeURIComponent(message)}`);
}

function field(formData: FormData, name: string, max: number): string {
  return String(formData.get(name) ?? "").trim().slice(0, max);
}

export async function saveCategoryAction(formData: FormData) {
  await requireAdmin();

  const originalId = field(formData, "original_id", 80);
  const label = field(formData, "label", 80);
  const short = field(formData, "short", 40) || label;
  const description = field(formData, "description", 400);
  const failurePath = originalId ? `/admin/categories/${originalId}` : "/admin/categories/nouvelle";

  if (!label) fail(failurePath, "Donnez un nom à la catégorie.");

  const images = parseImageList(String(formData.get("images") ?? "[]"), process.env.NEXT_PUBLIC_SUPABASE_URL ?? null);
  if (!images) fail(failurePath, "Image invalide : rechargez la page et réessayez.");
  const imageUrl = images[0]?.url ?? null;

  const supabase = await createSupabaseServerClient();

  if (originalId) {
    const { data: previous } = await supabase.from("categories").select("image_url").eq("id", originalId).maybeSingle();
    const { error } = await supabase
      .from("categories")
      .update({ label, short, description, image_url: imageUrl })
      .eq("id", originalId);
    if (error) fail(failurePath, error.message);

    // Ancienne image remplacée ou retirée : le fichier Storage est supprimé.
    const oldPath = storagePathFromUrl((previous as { image_url: string | null } | null)?.image_url ?? null);
    if (oldPath && oldPath !== storagePathFromUrl(imageUrl)) {
      await removeUnreferencedFiles(supabase, [oldPath]);
    }
  } else {
    const id = slugify(field(formData, "id", 80) || label);
    if (!id) fail(failurePath, "Identifiant invalide : utilisez des lettres ou des chiffres.");

    const { data: last } = await supabase
      .from("categories")
      .select("position")
      .order("position", { ascending: false })
      .limit(1)
      .maybeSingle();
    const position = ((last as { position: number } | null)?.position ?? 0) + 1;

    const { error } = await supabase.from("categories").insert({ id, label, short, description, image_url: imageUrl, position });
    if (error) {
      fail(failurePath, error.code === "23505" ? `L'identifiant « ${id} » existe déjà.` : error.message);
    }
  }

  refresh();
  redirect(`/admin/categories?ok=${encodeURIComponent("Catégorie enregistrée.")}`);
}

/** Échange la position d'une catégorie avec sa voisine (« up » ou « down »). */
export async function moveCategoryAction(formData: FormData) {
  await requireAdmin();
  const id = field(formData, "id", 80);
  const direction = formData.get("direction") === "up" ? "up" : "down";

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from("categories").select("id, position").order("position");
  const rows = (data ?? []) as { id: string; position: number }[];
  const index = rows.findIndex((row) => row.id === id);
  const neighborIndex = direction === "up" ? index - 1 : index + 1;

  if (index >= 0 && neighborIndex >= 0 && neighborIndex < rows.length) {
    // Positions renumérotées 1..n pour éviter les égalités héritées.
    const order = rows.map((row) => row.id);
    [order[index], order[neighborIndex]] = [order[neighborIndex], order[index]];
    const results = await Promise.all(
      order.map((categoryId, position) =>
        supabase.from("categories").update({ position: position + 1 }).eq("id", categoryId),
      ),
    );
    refresh();
    const failed = results.find((result) => result.error);
    if (failed?.error) fail("/admin/categories", `Ordre non enregistré : ${failed.error.message}`);
  }
  redirect("/admin/categories");
}

export async function deleteCategoryAction(formData: FormData) {
  await requireAdmin();
  const id = field(formData, "id", 80);
  const supabase = await createSupabaseServerClient();

  const { count } = await supabase.from("products").select("id", { count: "exact", head: true }).eq("category_id", id);
  if ((count ?? 0) > 0) {
    fail(
      "/admin/categories",
      `Cette catégorie contient ${count} produit${(count ?? 0) > 1 ? "s" : ""} : déplacez-les vers une autre catégorie avant de la supprimer.`,
    );
  }

  const { data: previous } = await supabase.from("categories").select("image_url").eq("id", id).maybeSingle();
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) {
    // Garde-fou : la clé étrangère refuse aussi la suppression (code 23503).
    fail("/admin/categories", error.code === "23503" ? "Cette catégorie contient encore des produits." : error.message);
  }

  const path = storagePathFromUrl((previous as { image_url: string | null } | null)?.image_url ?? null);
  if (path) await removeUnreferencedFiles(supabase, [path]);

  refresh();
  redirect(`/admin/categories?ok=${encodeURIComponent("Catégorie supprimée.")}`);
}
