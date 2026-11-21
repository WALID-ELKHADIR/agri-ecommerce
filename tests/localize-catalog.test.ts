import assert from "node:assert/strict";
import test from "node:test";
import { localizeCatalog, parseSpecs } from "../lib/i18n/localize-catalog.ts";

const base = {
  categories: [
    { id: "all", label: "Tous les produits", short: "Tous", description: "Tout" },
    { id: "pompes", label: "Pompes", short: "Pompes", description: "Pompes FR", ar: { label: "المضخات", short: "", description: null } },
    { id: "raccords", label: "Raccords", short: "Raccords", description: "Raccords FR" },
  ],
  products: [
    {
      slug: "pompe",
      name: "Pompe immergée",
      category: "pompes",
      categoryLabel: "Pompes",
      description: "Description FR",
      specs: [{ label: "Débit", value: "6 m³/h" }],
      ar: { name: "مضخة غاطسة", description: "  ", specs: [{ label: "التدفق", value: "6 م³/س" }] },
    },
    {
      slug: "coude",
      name: "Coude PE",
      category: "raccords",
      categoryLabel: "Raccords",
      description: "Coude FR",
      specs: [],
    },
  ],
};

test("en français, le catalogue est rendu tel quel", () => {
  assert.equal(localizeCatalog(base, "fr"), base);
});

test("en arabe, les champs arabes remplis remplacent le français", () => {
  const { products, categories } = localizeCatalog(base, "ar");
  assert.equal(products[0].name, "مضخة غاطسة");
  assert.deepEqual(products[0].specs, [{ label: "التدفق", value: "6 م³/س" }]);
  assert.equal(categories[1].label, "المضخات");
  assert.equal(products[0].categoryLabel, "المضخات");
});

test("un champ arabe vide ou absent garde le texte français", () => {
  const { products, categories } = localizeCatalog(base, "ar");
  assert.equal(products[0].description, "Description FR");
  assert.equal(categories[1].short, "Pompes");
  assert.equal(categories[1].description, "Pompes FR");
  assert.equal(products[1].name, "Coude PE");
  assert.equal(products[1].categoryLabel, "Raccords");
});

test("des caractéristiques arabes vides gardent les caractéristiques françaises", () => {
  const catalog = { categories: [], products: [{ ...base.products[0], ar: { specs: [] } }] };
  assert.deepEqual(localizeCatalog(catalog, "ar").products[0].specs, base.products[0].specs);
});

test("le catalogue d'origine n'est pas modifié", () => {
  localizeCatalog(base, "ar");
  assert.equal(base.products[0].name, "Pompe immergée");
});

test("parseSpecs lit « Libellé : valeur » ligne par ligne et ignore les lignes invalides", () => {
  assert.deepEqual(parseSpecs("التدفق: 6 م³/س\n\n  القدرة : 1 kW \nsans séparateur"), [
    { label: "التدفق", value: "6 م³/س" },
    { label: "القدرة", value: "1 kW" },
  ]);
  assert.deepEqual(parseSpecs("Heure: 10:30"), [{ label: "Heure", value: "10:30" }]);
});
