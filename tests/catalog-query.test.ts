import assert from "node:assert/strict";
import { test } from "node:test";
import { catalogHref, parseCatalogQuery, queryCatalog, stockOptions } from "../lib/catalog-query.ts";

const P = (slug: string, extra: Partial<{ name: string; category: string; categoryLabel: string; stock: string; featured: boolean; specs: { label: string; value: string }[] }> = {}) => ({
  slug,
  name: extra.name ?? slug,
  category: extra.category ?? "pompes",
  categoryLabel: extra.categoryLabel ?? "Pompes",
  stock: extra.stock ?? "Disponible",
  featured: extra.featured ?? false,
  specs: extra.specs ?? [],
});

const known = { categories: ["pompes", "raccords"], stocks: ["disponible", "sur-demande"] };

test("recherche sans accents, sur le nom, la gamme et les caractéristiques", () => {
  const products = [
    P("a", { name: 'Pompe immergée inox 4"' }),
    P("b", { name: "Té PVC", category: "raccords", categoryLabel: "Raccords" }),
    P("c", { name: "Kit", specs: [{ label: "Alimentation", value: "220 V mono" }] }),
  ];
  const q = (text: string) => queryCatalog(products, parseCatalogQuery({ q: text }, known)).map((p) => p.slug);
  assert.deepEqual(q("pompe immergee"), ["a"]);
  assert.deepEqual(q("raccords"), ["b"]);
  assert.deepEqual(q("220 v"), ["c"]);
});

test("paramètres inconnus ou hostiles ignorés, recherche bornée", () => {
  const query = parseCatalogQuery({ gamme: "inconnue", tri: "<script>", dispo: "xyz", q: "x".repeat(5000) }, known);
  assert.equal(query.gamme, null);
  assert.equal(query.tri, "featured");
  assert.equal(query.dispo, null);
  assert.equal(query.q.length, 80);
});

test("valeurs multiples : la première valeur connue", () => {
  assert.equal(parseCatalogQuery({ gamme: ["zzz", "raccords", "pompes"] }, known).gamme, "raccords");
});

test("options de disponibilité : valeurs réelles, regroupées sans casse ni accents", () => {
  const options = stockOptions([P("a"), P("b", { stock: "disponible" }), P("c", { stock: "Sur demande" })]);
  assert.deepEqual(
    options.map((o) => [o.value, o.count]),
    [
      ["disponible", 2],
      ["sur-demande", 1],
    ],
  );
  assert.equal(options[0].label, "Disponible");
});

test("filtre par gamme et disponibilité", () => {
  const products = [P("a"), P("b", { stock: "Sur demande" }), P("c", { category: "raccords" })];
  const result = queryCatalog(products, parseCatalogQuery({ gamme: "pompes", dispo: "sur-demande" }, known));
  assert.deepEqual(result.map((p) => p.slug), ["b"]);
});

test("tri « mis en avant » stable", () => {
  const products = [P("a"), P("b", { featured: true }), P("c"), P("d", { featured: true })];
  assert.deepEqual(queryCatalog(products, parseCatalogQuery({}, known)).map((p) => p.slug), ["b", "d", "a", "c"]);
});

test("tri par nom", () => {
  const products = [P("b", { name: "Béta" }), P("a", { name: "alpha" })];
  assert.deepEqual(queryCatalog(products, parseCatalogQuery({ tri: "name" }, known)).map((p) => p.slug), ["a", "b"]);
});

test("liens : seulement les valeurs utiles", () => {
  assert.equal(catalogHref({ gamme: "pompes" }), "/produits?gamme=pompes");
  assert.equal(catalogHref({}), "/produits");
  assert.equal(catalogHref({ q: "", gamme: null, tri: "featured" }), "/produits");
  assert.equal(catalogHref({ q: "té pvc", tri: "name" }), "/produits?q=t%C3%A9+pvc&tri=name");
});
