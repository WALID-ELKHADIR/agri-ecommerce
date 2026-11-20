import assert from "node:assert/strict";
import { test } from "node:test";
import { clickRecord, QUOTE_SOURCES } from "../lib/quote-sources.ts";
import { validateQuoteInput } from "../lib/quote-validation.ts";

test("chaque source tient dans la contrainte SQL (40 caractères)", () => {
  for (const source of QUOTE_SOURCES) assert.ok(source.length <= 40, source);
});

test("un clic générique est une demande valide, avec sa source et son message", () => {
  const result = validateQuoteInput(clickRecord("header", "Bonjour"));
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.data.source, "header");
    assert.equal(result.data.message, "Bonjour");
  }
});

test("un clic sur un produit transmet le produit et la quantité", () => {
  const record = clickRecord("carte-produit", "m", { slug: "x", quantity: 2 });
  assert.equal(record.productSlug, "x");
  assert.equal(record.quantity, 2);
  assert.equal(validateQuoteInput(record).ok, true);
});

test("un clic n'est pas un formulaire : pas de mesure anti-robot", () => {
  assert.equal("elapsedMs" in clickRecord("footer", "m"), false);
});
