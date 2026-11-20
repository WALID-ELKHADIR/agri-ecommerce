/** Liste d'images envoyée par le gestionnaire d'images de l'admin (module pur, testé). */

export type ImageEntry = { url: string; storagePath: string | null; alt: string };

const MAX_IMAGES = 20;
const SAFE_PATH = /^[a-z0-9][a-z0-9/_.-]{0,240}\.webp$/;

function isSafeUrl(url: string, allowedOrigin: string | null): boolean {
  if (url.startsWith("/") && !url.startsWith("//")) return true;
  if (!allowedOrigin) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" && parsed.origin === new URL(allowedOrigin).origin;
  } catch {
    return false;
  }
}

/**
 * Valide la liste reçue d'un formulaire (champ caché JSON). Renvoie null si elle
 * est mal formée : URL non sûre, chemin Storage invalide, trop d'images.
 * Une URL absolue n'est acceptée que sur `allowedOrigin` (le projet Supabase).
 */
export function parseImageList(raw: string, allowedOrigin: string | null = null): ImageEntry[] | null {
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!Array.isArray(value) || value.length > MAX_IMAGES) return null;

  const entries: ImageEntry[] = [];
  for (const item of value as unknown[]) {
    if (typeof item !== "object" || item === null) return null;
    const { url, storagePath, alt } = item as Record<string, unknown>;
    if (typeof url !== "string" || url.length > 1000 || !isSafeUrl(url, allowedOrigin)) return null;
    if (storagePath !== null && (typeof storagePath !== "string" || !SAFE_PATH.test(storagePath) || storagePath.includes(".."))) {
      return null;
    }
    if (typeof alt !== "string" || alt.length > 300) return null;
    entries.push({ url, storagePath, alt: alt.trim() });
  }
  return entries;
}

/** Fichiers Storage qui ne sont plus référencés après l'enregistrement. */
export function removedStoragePaths(
  before: { storagePath: string | null }[],
  after: { storagePath: string | null }[],
): string[] {
  const kept = new Set(after.map((image) => image.storagePath).filter(Boolean));
  return before
    .map((image) => image.storagePath)
    .filter((path): path is string => Boolean(path) && !kept.has(path));
}

const BUCKET_MARKER = "/storage/v1/object/public/product-images/";

/** Chemin dans le bucket product-images d'une URL publique ; null sinon. */
export function storagePathFromUrl(url: string | null): string | null {
  if (!url) return null;
  const index = url.indexOf(BUCKET_MARKER);
  if (index < 0) return null;
  const path = decodeURIComponent(url.slice(index + BUCKET_MARKER.length));
  return SAFE_PATH.test(path) && !path.includes("..") ? path : null;
}
