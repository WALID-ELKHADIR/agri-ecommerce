import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { storagePathFromUrl } from "@/lib/admin/image-list";

const BUCKET = "product-images";

/**
 * Supprime de Storage les fichiers qui ne sont plus utilisés nulle part.
 * Un même fichier peut être partagé (produit dupliqué, image réutilisée) :
 * on vérifie toutes les galeries et toutes les images de catégorie avant de
 * supprimer, pour ne jamais casser l'image d'un autre produit.
 */
export async function removeUnreferencedFiles(supabase: SupabaseClient, paths: string[]): Promise<void> {
  const candidates = [...new Set(paths.filter(Boolean))];
  if (candidates.length === 0) return;

  const [gallery, categories] = await Promise.all([
    supabase.from("product_images").select("storage_path").in("storage_path", candidates),
    supabase.from("categories").select("image_url"),
  ]);
  // En cas de doute (lecture impossible), on ne supprime rien.
  if (gallery.error || categories.error) return;

  const used = new Set<string>();
  for (const row of (gallery.data ?? []) as { storage_path: string | null }[]) {
    if (row.storage_path) used.add(row.storage_path);
  }
  for (const row of (categories.data ?? []) as { image_url: string | null }[]) {
    const path = storagePathFromUrl(row.image_url);
    if (path) used.add(path);
  }

  const orphans = candidates.filter((path) => !used.has(path));
  if (orphans.length > 0) await supabase.storage.from(BUCKET).remove(orphans);
}
