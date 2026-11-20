import assert from "node:assert/strict";
import { test } from "node:test";
import { computeSquareCrop, outputSize } from "../lib/admin/image-crop.ts";
import { parseImageList, removedStoragePaths } from "../lib/admin/image-list.ts";

test("recadrage carré : sans zoom, le plus grand carré centré", () => {
  assert.deepEqual(computeSquareCrop(4000, 3000, { zoom: 1, x: 0, y: 0 }), { x: 500, y: 0, size: 3000 });
  assert.deepEqual(computeSquareCrop(800, 1200, { zoom: 1, x: 0, y: 0 }), { x: 0, y: 200, size: 800 });
});

test("recadrage carré : zoom et décalage restent dans l'image", () => {
  assert.deepEqual(computeSquareCrop(4000, 3000, { zoom: 2, x: 0, y: 0 }), { x: 1250, y: 750, size: 1500 });
  assert.deepEqual(computeSquareCrop(4000, 3000, { zoom: 2, x: -1, y: 1 }), { x: 0, y: 1500, size: 1500 });
  assert.deepEqual(computeSquareCrop(4000, 3000, { zoom: 1, x: 1, y: -1 }), { x: 1000, y: 0, size: 3000 });
  // Valeurs hors bornes ramenées dans l'intervalle.
  assert.deepEqual(computeSquareCrop(1000, 1000, { zoom: 9, x: 5, y: -5 }), { x: 667, y: 0, size: 333 });
});

test("taille de sortie : 1600 px au plus, jamais d'agrandissement", () => {
  assert.equal(outputSize(3000), 1600);
  assert.equal(outputSize(900), 900);
});

test("liste d'images : seules des entrées bien formées sont acceptées", () => {
  const ok = parseImageList(
    JSON.stringify([
      { url: "https://x.supabase.co/storage/v1/object/public/product-images/produits/a.webp", storagePath: "produits/a.webp", alt: "A" },
      { url: "/images/products/te-pvc-pression/main.webp", storagePath: null, alt: "" },
    ]),
    "https://x.supabase.co",
  );
  assert.equal(ok?.length, 2);
  const foreign = JSON.stringify([{ url: "https://pirate.example/a.webp", storagePath: null, alt: "" }]);
  assert.equal(parseImageList(foreign, "https://x.supabase.co"), null, "hôte étranger refusé");
  assert.equal(parseImageList(foreign), null, "sans origine autorisée, aucune URL absolue");
  assert.equal(parseImageList("pas du json"), null);
  assert.equal(parseImageList(JSON.stringify({ url: "x" })), null);
  assert.equal(parseImageList(JSON.stringify([{ url: "javascript:alert(1)", storagePath: null, alt: "" }])), null);
  assert.equal(parseImageList(JSON.stringify([{ url: "/a.webp", storagePath: "../../etc", alt: "" }])), null);
  assert.equal(parseImageList(JSON.stringify(Array(21).fill({ url: "/a.webp", storagePath: null, alt: "" }))), null);
});

test("fichiers à supprimer : ceux qui ne sont plus utilisés", () => {
  assert.deepEqual(
    removedStoragePaths(
      [{ storagePath: "produits/a.webp" }, { storagePath: "produits/b.webp" }, { storagePath: null }],
      [{ storagePath: "produits/b.webp" }],
    ),
    ["produits/a.webp"],
  );
});

test("chemin Storage retrouvé depuis une URL publique du bucket", async () => {
  const { storagePathFromUrl } = await import("../lib/admin/image-list.ts");
  assert.equal(
    storagePathFromUrl("https://abc.supabase.co/storage/v1/object/public/product-images/categories/x.webp"),
    "categories/x.webp",
  );
  assert.equal(storagePathFromUrl("/images/categories/arrosage.webp"), null);
  assert.equal(storagePathFromUrl(null), null);
});
