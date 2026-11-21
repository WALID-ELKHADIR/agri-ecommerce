import assert from "node:assert/strict";
import { test } from "node:test";
import { quoteAddFromAttributes, waClickRecord } from "../lib/click-tracking.ts";
import { validateQuoteInput } from "../lib/quote-validation.ts";

const href = "https://wa.me/212600000000?text=Bonjour%20%F0%9F%91%8B%0A%E2%80%A2%202%20%C3%97%20Pompe";

test("clic WhatsApp : source connue, message relu dans le lien", () => {
  const record = waClickRecord({ source: "carte-produit", slug: "pompe", qty: "2" }, href);
  assert.deepEqual(record, { source: "carte-produit", message: "Bonjour 👋\n• 2 × Pompe", productSlug: "pompe", quantity: 2 });
  assert.equal(validateQuoteInput(record!).ok, true);
});

test("clic WhatsApp générique : sans produit", () => {
  assert.deepEqual(waClickRecord({ source: "header" }, href), { source: "header", message: "Bonjour 👋\n• 2 × Pompe" });
});

test("clic WhatsApp : source inconnue ou lien étranger ignorés", () => {
  assert.equal(waClickRecord({ source: "pirate" }, href), null);
  assert.equal(waClickRecord({ source: "header" }, "https://exemple.com/?text=x"), null);
  assert.equal(waClickRecord({ source: "header" }, "pas une url"), null);
});

test("clic WhatsApp : quantité invalide ignorée", () => {
  const record = waClickRecord({ source: "fiche-produit", slug: "x", qty: "abc" }, href);
  assert.equal(record?.quantity, 1);
});

test("ajout au devis : attributs lus et bornés", () => {
  assert.deepEqual(quoteAddFromAttributes({ slug: "a", name: "Pompe A", qty: "3" }), { product: { slug: "a", name: "Pompe A" }, quantity: 3 });
  assert.deepEqual(quoteAddFromAttributes({ slug: "a", name: "Pompe A" }), { product: { slug: "a", name: "Pompe A" }, quantity: 1 });
  assert.equal(quoteAddFromAttributes({ slug: "", name: "A" }), null);
  assert.equal(quoteAddFromAttributes({ slug: "a" }), null);
  assert.equal(quoteAddFromAttributes({ slug: "a", name: "A", qty: "500" })?.quantity, 99);
});
