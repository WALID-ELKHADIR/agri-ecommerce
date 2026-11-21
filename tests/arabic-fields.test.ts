import assert from "node:assert/strict";
import test from "node:test";
import { categoryArabicColumns, isMissingColumn, productArabicColumns, stripArabic } from "../lib/admin/arabic-fields.ts";

const form = (values: Record<string, string>) => (name: string) => values[name] ?? "";

test("les champs arabes remplis deviennent des colonnes, nettoyées et bornées", () => {
  const columns = productArabicColumns(
    form({ name_ar: "  مضخة  ", description_ar: "و".repeat(3000), specs_ar: "التدفق: 6\nخطأ" }),
  );
  assert.equal(columns.name_ar, "مضخة");
  assert.equal(columns.description_ar?.length, 2000);
  assert.deepEqual(columns.specs_ar, [{ label: "التدفق", value: "6" }]);
});

test("un champ arabe vide est enregistré à null (le site garde le français)", () => {
  assert.deepEqual(productArabicColumns(form({})), { name_ar: null, description_ar: null, specs_ar: null });
  assert.deepEqual(categoryArabicColumns(form({ label_ar: " " })), { label_ar: null, short_ar: null, description_ar: null });
});

test("les champs arabes d'une gamme sont bornés comme en base", () => {
  const columns = categoryArabicColumns(form({ label_ar: "م".repeat(100), short_ar: "م".repeat(60), description_ar: "م".repeat(500) }));
  assert.equal(columns.label_ar?.length, 80);
  assert.equal(columns.short_ar?.length, 40);
  assert.equal(columns.description_ar?.length, 400);
});

test("stripArabic retire seulement les colonnes arabes (base pas encore migrée)", () => {
  assert.deepEqual(stripArabic({ name: "Pompe", name_ar: "مضخة", specs_ar: null, stock: "x" }), { name: "Pompe", stock: "x" });
});

test("une colonne absente est reconnue, en lecture (Postgres) comme en écriture (PostgREST)", () => {
  assert.equal(isMissingColumn({ code: "42703" }), true);
  assert.equal(isMissingColumn({ code: "PGRST204" }), true);
  assert.equal(isMissingColumn({ code: "23505" }), false);
  assert.equal(isMissingColumn(null), false);
});
