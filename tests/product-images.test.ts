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

test("chaque produit du catalogue de secours a ses images", async () => {
  const { readFileSync } = await import("node:fs");
  const { catalogSlugs, checkImages } = await import("../scripts/images/check-images.ts");
  const slugs = catalogSlugs(readFileSync("lib/catalog.ts", "utf8"));
  assert.equal(slugs.length, 25);
  const report = checkImages(slugs);
  assert.deepEqual(report.missingEntries, []);
  assert.deepEqual(report.missingFiles, []);
  assert.deepEqual(report.placeholders.sort(), [
    "coude-pe-filete-male-90",
    "motopompe-centrifuge-inox",
    "pompe-immergee-inox-4-pouces",
  ]);
});

test("après la migration, le chemin du manifest stocké en base garde aperçu flou et statut provisoire", () => {
  const placeholder = resolveProductImages("motopompe-centrifuge-inox", {
    src: "/images/products/motopompe-centrifuge-inox/main.webp",
    alt: "Photo du produit à venir",
  });
  assert.equal(placeholder.image.placeholder, true);
  assert.ok(placeholder.image.blurDataURL);

  const photo = resolveProductImages("te-pvc-pression", { src: "/images/products/te-pvc-pression/main.webp", alt: "x" });
  assert.equal(photo.image.placeholder, false);
  assert.ok(photo.image.blurDataURL);
});

test("la copie Supabase Storage de l'image du manifest est reconnue (même empreinte)", () => {
  const { main } = PRODUCT_IMAGES["te-pvc-pression"];
  const storage = `https://abc.supabase.co/storage/v1/object/public/product-images/te-pvc-pression/main-${main.hash}.webp`;
  const images = resolveProductImages("te-pvc-pression", { src: storage, alt: "Té" });
  assert.equal(images.image.src, storage);
  assert.equal(images.image.alt, "Té");
  assert.equal(images.image.blurDataURL, main.blurDataURL);

  const stale = resolveProductImages("te-pvc-pression", {
    src: "https://abc.supabase.co/storage/v1/object/public/product-images/te-pvc-pression/main-0000000000.webp",
    alt: "Té",
  });
  assert.equal(stale.image.blurDataURL, undefined, "ancienne version : pas d'aperçu du manifest");
});
