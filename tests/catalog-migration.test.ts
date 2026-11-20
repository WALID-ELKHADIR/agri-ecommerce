// Vérifie la migration du catalogue (phase 2bis) dans un Postgres en mémoire.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
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

test("chaque produit de la base a son image dans le manifest (plus aucun ancien .jpg)", async () => {
  const products = await rows<{ slug: string; image_url: string }>("select slug, image_url from public.products");
  assert.equal(products.length, Object.keys(PRODUCT_IMAGES).length);
  for (const product of products) {
    assert.equal(product.image_url, PRODUCT_IMAGES[product.slug]?.main.src, product.slug);
  }
});

test("les nouveaux produits sont publiés, sans caractéristiques inventées", async () => {
  const created = await rows<{ specs: unknown[]; published: boolean; stock: string }>(
    "select specs, published, stock from public.products where position >= 100",
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
