// Visuels générés par IA pour les 3 produits sans photo (scripts/images/process-ia.ts).
import assert from "node:assert/strict";
import { existsSync, readFileSync, statSync } from "node:fs";
import { test } from "node:test";
import sharp from "sharp";

export const IA_PRODUCTS = ["pompe-immergee-inox-4-pouces", "motopompe-centrifuge-inox", "coude-pe-filete-male-90"];

test("chaque visuel IA existe, fait 1200 × 1200 et pèse moins de 150 Ko", async () => {
  for (const slug of IA_PRODUCTS) {
    const file = `public/images/products/${slug}/ia.webp`;
    assert.ok(existsSync(file), `${file} manquant`);
    assert.ok(statSync(file).size <= 150 * 1024, `${file} dépasse 150 Ko`);
    const { width, height, format } = await sharp(file).metadata();
    assert.deepEqual([width, height, format], [1200, 1200, "webp"], slug);
  }
});

test("les originaux sont archivés et déclarés comme générés par IA", () => {
  const readme = readFileSync("public/images/_archive/2026-11-images-ia/README.md", "utf8");
  assert.match(readme, /générés? par (une )?IA/i);
  for (const slug of IA_PRODUCTS) {
    assert.ok(existsSync(`public/images/_archive/2026-11-images-ia/${slug}.jpg`), slug);
    assert.match(readme, new RegExp(slug));
  }
});

test("le catalogue de secours utilise ces visuels", () => {
  const catalog = readFileSync("lib/catalog.ts", "utf8");
  for (const slug of IA_PRODUCTS) assert.ok(catalog.includes(`/images/products/${slug}/ia.webp`), slug);
});
