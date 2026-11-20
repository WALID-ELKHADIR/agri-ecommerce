import assert from "node:assert/strict";
import { existsSync, statSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { PRODUCT_IMAGES } from "../lib/images-manifest.ts";
import { isLegacyImagePath, resolveProductImages } from "../lib/product-images.ts";

test("reconnaît les anciens chemins d'images (avant la phase 2bis)", () => {
  assert.equal(isLegacyImagePath("/images/products/te-pvc.jpg"), true);
  assert.equal(isLegacyImagePath("/images/products/pompe.JPEG"), true);
  assert.equal(isLegacyImagePath("/images/products/te-pvc-pression/main.webp"), false);
  assert.equal(isLegacyImagePath("https://xyz.supabase.co/storage/v1/object/public/product-images/a.webp"), false);
  assert.equal(isLegacyImagePath(""), false);
});

test("sans image en base, ou avec un ancien chemin, l'image du manifest est utilisée", () => {
  for (const stored of [undefined, "/images/products/te-pvc.jpg"]) {
    const images = resolveProductImages("te-pvc-pression", stored ? { src: stored, alt: "" } : undefined);
    assert.equal(images.image.src, "/images/products/te-pvc-pression/main.webp");
    assert.ok(images.image.blurDataURL?.startsWith("data:image/webp;base64,"));
    assert.equal(images.gallery.length, 1);
  }
});

test("une image choisie dans l'admin est respectée, la galerie du manifest reste", () => {
  const custom = "https://xyz.supabase.co/storage/v1/object/public/product-images/te.webp";
  const images = resolveProductImages("te-pvc-pression", { src: custom, alt: "Té PVC" });
  assert.equal(images.image.src, custom);
  assert.equal(images.image.alt, "Té PVC");
  assert.equal(images.image.blurDataURL, undefined);
  assert.equal(images.gallery.length, 1);
});

test("produit absent du manifest : image en base telle quelle, galerie vide", () => {
  const images = resolveProductImages("produit-ajoute-dans-l-admin", { src: "/x.webp", alt: "X" });
  assert.equal(images.image.src, "/x.webp");
  assert.deepEqual(images.gallery, []);
});

test("les images provisoires sont signalées", () => {
  assert.equal(resolveProductImages("motopompe-centrifuge-inox").image.placeholder, true);
  assert.equal(resolveProductImages("te-pvc-pression").image.placeholder, false);
});

test("chaque image du manifest existe, fait 1200 × 1200 et pèse moins de 150 Ko", () => {
  for (const [slug, images] of Object.entries(PRODUCT_IMAGES)) {
    for (const image of [images.main, ...images.gallery]) {
      const file = join("public", image.src);
      assert.ok(existsSync(file), `${slug} : ${file} manquant`);
      assert.ok(statSync(file).size <= 150 * 1024, `${slug} : ${file} dépasse 150 Ko`);
      assert.equal(image.width, 1200);
      assert.equal(image.height, 1200);
      assert.ok(image.alt.trim().length > 0, `${slug} : texte alternatif vide`);
      assert.doesNotMatch(image.alt, /moyza/i, `${slug} : mention du fournisseur`);
    }
  }
});
