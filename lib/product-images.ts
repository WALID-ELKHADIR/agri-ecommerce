/**
 * Choix des images d'un produit : manifest des images du site (phase 2bis)
 * ou image enregistrée en base depuis l'admin. Module pur, testé.
 */
import { PRODUCT_IMAGES, type ManifestImage } from "./images-manifest.ts";

export type ProductImage = {
  src: string;
  alt: string;
  width: number;
  height: number;
  /** Aperçu flou pour un chargement sans saut ; absent pour une image externe. */
  blurDataURL?: string;
  /** Image provisoire : la photo du produit reste à fournir. */
  placeholder: boolean;
};

export type ResolvedProductImages = { image: ProductImage; gallery: ProductImage[] };

const LEGACY_PATH = /^\/images\/products\/[^/]+\.(jpe?g|png)$/i;

/** Ancien chemin d'image (avant la refonte des images), à remplacer par le manifest. */
export function isLegacyImagePath(src: string): boolean {
  return LEGACY_PATH.test(src);
}

function fromManifest(image: ManifestImage): ProductImage {
  return {
    src: image.src,
    alt: image.alt,
    width: image.width,
    height: image.height,
    blurDataURL: image.blurDataURL,
    placeholder: image.source === "placeholder",
  };
}

/**
 * Vrai si l'image en base est celle du manifest : son chemin local, ou sa copie
 * dans Supabase Storage (`product-images/<slug>/main-<empreinte>.webp`, voir
 * scripts/images/sync-images.ts) à la même empreinte de contenu.
 */
function isManifestCopy(slug: string, src: string, main: ManifestImage): boolean {
  return src === main.src || src.endsWith(`/product-images/${slug}/main-${main.hash}.webp`);
}

export function resolveProductImages(
  slug: string,
  stored?: { src: string; alt: string },
): ResolvedProductImages {
  const manifest = PRODUCT_IMAGES[slug];
  const gallery = manifest ? manifest.gallery.map(fromManifest) : [];

  if (manifest && stored?.src && isManifestCopy(slug, stored.src, manifest.main)) {
    // Même image : on garde l'URL en base (locale ou Storage) et les métadonnées du manifest.
    return { image: { ...fromManifest(manifest.main), src: stored.src, alt: stored.alt || manifest.main.alt }, gallery };
  }

  const useStored = stored && stored.src && !(manifest && isLegacyImagePath(stored.src));
  if (useStored) {
    return {
      image: { src: stored.src, alt: stored.alt, width: 1200, height: 1200, placeholder: false },
      gallery,
    };
  }
  if (manifest) {
    return { image: fromManifest(manifest.main), gallery };
  }
  return {
    image: { src: stored?.src ?? "", alt: stored?.alt ?? "", width: 1200, height: 1200, placeholder: true },
    gallery,
  };
}
