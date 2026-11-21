// Vérifie la migration du catalogue (phase 2bis) dans un Postgres en mémoire.
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { after, before, test } from "node:test";
import type { PGlite } from "@electric-sql/pglite";
import { PRODUCT_IMAGES } from "../lib/images-manifest.ts";
import { createSupabaseDb } from "./helpers/supabase-db.ts";

let db: PGlite;

before(async () => {
  db = await createSupabaseDb();
});

after(() => db.close());

async function rows<T>(sql: string, params: unknown[] = []): Promise<T[]> {
  return (await db.query<T>(sql, params)).rows;
}

test("les trois nouvelles catégories existent, sans doublon", async () => {
  const ids = (await rows<{ id: string }>("select id from public.categories order by position")).map((r) => r.id);
  assert.deepEqual(ids, ["pompes", "raccords", "kits", "accessoires-pompage", "arrosage", "outillage"]);
});

// Produits illustrés par une photo d'ambiance (pas de photo fournisseur) : hors manifest produits.
const AMBIANCE_PRODUCTS: Record<string, string> = {
  "gaine-goutte-a-goutte": "/images/products/gaine-goutte-a-goutte/main.webp",
};

test("chaque produit de la base a son image dans le manifest (plus aucun ancien .jpg)", async () => {
  const products = await rows<{ slug: string; image_url: string }>("select slug, image_url from public.products");
  assert.equal(products.length, Object.keys(PRODUCT_IMAGES).length + Object.keys(AMBIANCE_PRODUCTS).length);
  for (const product of products) {
    assert.equal(product.image_url, PRODUCT_IMAGES[product.slug]?.main.src ?? AMBIANCE_PRODUCTS[product.slug], product.slug);
  }
});

test("gaine goutte-à-goutte : publiée en irrigation, photo présente, caractéristiques indicatives", async () => {
  const [gaine] = await rows<{ name: string; category_id: string; image_url: string; description: string; specs: { label: string; value: string }[]; published: boolean }>(
    "select name, category_id, image_url, description, specs, published from public.products where slug = 'gaine-goutte-a-goutte'",
  );
  assert.ok(gaine, "produit absent");
  assert.match(gaine.name, /goutte-à-goutte/i);
  assert.equal(gaine.category_id, "arrosage");
  assert.equal(gaine.published, true);
  assert.ok(existsSync(join("public", gaine.image_url)), gaine.image_url);
  assert.ok(gaine.specs.length >= 4);
  // Aucune valeur présentée comme un fait : chaque plage est « selon modèle ».
  for (const spec of gaine.specs) assert.match(spec.value, /selon modèle/, spec.label);
  assert.match(gaine.description, /indicati/);
});

test("les nouveaux produits sont publiés, sans caractéristiques inventées", async () => {
  const created = await rows<{ specs: unknown[]; published: boolean; stock: string }>(
    "select specs, published, stock from public.products where position between 100 and 113",
  );
  assert.equal(created.length, 14);
  for (const product of created) {
    assert.deepEqual(product.specs, []);
    assert.equal(product.published, true);
    assert.equal(product.stock, "Sur demande");
  }
});

test("une image choisie depuis l'admin n'est jamais écrasée", async () => {
  const custom = "https://exemple.supabase.co/storage/v1/object/public/product-images/te.webp";
  await db.query("update public.products set image_url = $1 where slug = 'te-pvc-pression'", [custom]);
  await db.exec(readFileSync("supabase/migrations/20261120100000_catalogue_images.sql", "utf8"));
  const [row] = await rows<{ image_url: string }>("select image_url from public.products where slug = 'te-pvc-pression'");
  assert.equal(row.image_url, custom);
});

test("un texte alternatif modifié depuis l'admin n'est jamais écrasé", async () => {
  await db.exec(`
    update public.products set image_url = '/images/products/x.jpg', image_alt = 'Mon texte'
      where slug = 'pompe-centrifuge-fonte';
    update public.products set image_url = '/images/products/y.jpg', image_alt = 'Pompe centrifuge en fonte bleue'
      where slug = 'pompe-centrifuge-monobloc';
  `);
  await db.exec(readFileSync("supabase/migrations/20261120100000_catalogue_images.sql", "utf8"));
  const result = await rows<{ slug: string; image_url: string; image_alt: string }>(
    "select slug, image_url, image_alt from public.products where slug in ('pompe-centrifuge-fonte', 'pompe-centrifuge-monobloc') order by slug",
  );
  assert.equal(result[0].image_alt, "Mon texte", "texte personnalisé conservé");
  assert.equal(result[0].image_url, PRODUCT_IMAGES["pompe-centrifuge-fonte"].main.src, "image toujours remplacée");
  // Le texte d'origine d'un autre produit n'est pas reconnu comme celui du monobloc : conservé aussi.
  assert.equal(result[1].image_alt, "Pompe centrifuge en fonte bleue");
});
