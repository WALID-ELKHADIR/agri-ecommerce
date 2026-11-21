// Vérifie la migration du contenu arabe (champs facultatifs) dans un Postgres en mémoire.
import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import type { PGlite } from "@electric-sql/pglite";
import { createSupabaseDb } from "./helpers/supabase-db.ts";

let db: PGlite;

before(async () => {
  db = await createSupabaseDb();
});

after(() => db.close());

test("produits et gammes ont des champs arabes facultatifs, vides par défaut", async () => {
  const { rows } = await db.query<{ table_name: string; column_name: string; is_nullable: string }>(
    `select table_name, column_name, is_nullable from information_schema.columns
     where table_schema = 'public' and column_name like '%\\_ar' order by table_name, column_name`,
  );
  assert.deepEqual(
    rows.map((row) => `${row.table_name}.${row.column_name}:${row.is_nullable}`),
    [
      "categories.description_ar:YES",
      "categories.label_ar:YES",
      "categories.short_ar:YES",
      "products.description_ar:YES",
      "products.name_ar:YES",
      "products.specs_ar:YES",
    ],
  );
  const filled = await db.query("select 1 from public.products where name_ar is not null or specs_ar is not null");
  assert.equal(filled.rows.length, 0, "aucune traduction n'est inventée");
});

test("un nom arabe et des caractéristiques en liste sont acceptés", async () => {
  await db.query(
    `update public.products set name_ar = 'مضخة', specs_ar = '[{"label":"التدفق","value":"6"}]'::jsonb
     where slug = 'gaine-goutte-a-goutte'`,
  );
  const { rows } = await db.query<{ name_ar: string }>("select name_ar from public.products where slug = 'gaine-goutte-a-goutte'");
  assert.equal(rows[0].name_ar, "مضخة");
});

test("des caractéristiques qui ne sont pas une liste sont refusées", async () => {
  await assert.rejects(
    db.query(`update public.products set specs_ar = '{"a":1}'::jsonb where slug = 'gaine-goutte-a-goutte'`),
  );
});

test("un nom arabe trop long est refusé", async () => {
  await assert.rejects(
    db.query(`update public.products set name_ar = repeat('م', 200) where slug = 'gaine-goutte-a-goutte'`),
  );
});
