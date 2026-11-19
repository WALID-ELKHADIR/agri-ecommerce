import assert from "node:assert/strict";
import { test } from "node:test";
import { MIN_FILL_MS, validateQuoteInput, type QuoteRequestInput } from "../lib/quote-validation.ts";

test("champ piège rempli : considéré comme spam", () => {
  const result = validateQuoteInput({ name: "Ali", website: "http://spam.example" });
  assert.deepEqual(result, { ok: false, reason: "spam" });
});

test("formulaire envoyé trop vite : considéré comme spam", () => {
  const result = validateQuoteInput({ name: "Ali", elapsedMs: MIN_FILL_MS - 1 });
  assert.deepEqual(result, { ok: false, reason: "spam" });
});

test("formulaire rempli normalement : accepté", () => {
  assert.equal(validateQuoteInput({ name: "Ali", elapsedMs: MIN_FILL_MS }).ok, true);
});

test("durée de remplissage absurde (négative ou non numérique) : ignorée, pas de faux spam", () => {
  for (const elapsedMs of [-5000, Number.NaN, Number.POSITIVE_INFINITY]) {
    assert.equal(validateQuoteInput({ name: "Ali", elapsedMs }).ok, true, `elapsedMs: ${elapsedMs}`);
  }
});

test("sans durée (clic depuis une fiche produit) : pas de délai minimal", () => {
  assert.equal(validateQuoteInput({ productSlug: "pompe-x", quantity: 2 }).ok, true);
});

test("demande entièrement vide : refusée", () => {
  assert.deepEqual(validateQuoteInput({ name: "  ", phone: "" }), { ok: false, reason: "empty" });
});

test("tronque les textes aux limites de la base", () => {
  const result = validateQuoteInput({
    name: "n".repeat(200),
    phone: "1".repeat(60),
    email: "e".repeat(300),
    profile: "p".repeat(200),
    productSlug: "s".repeat(300),
    message: "m".repeat(3000),
    source: "x".repeat(80),
  });
  assert.ok(result.ok);
  assert.equal(result.data.name?.length, 120);
  assert.equal(result.data.phone?.length, 40);
  assert.equal(result.data.email?.length, 160);
  assert.equal(result.data.profile?.length, 120);
  assert.equal(result.data.product_slug?.length, 160);
  assert.equal(result.data.message?.length, 2000);
  assert.equal(result.data.source.length, 40);
});

test("quantité hors limites : ignorée", () => {
  for (const quantity of [0, -3, 100_001, 1.5, Number.NaN]) {
    const result = validateQuoteInput({ productSlug: "x", quantity });
    assert.ok(result.ok);
    assert.equal(result.data.quantity, null, `quantité: ${quantity}`);
  }
  const ok = validateQuoteInput({ productSlug: "x", quantity: 100_000 });
  assert.ok(ok.ok);
  assert.equal(ok.data.quantity, 100_000);
});

test("items : au plus 50 lignes valides", () => {
  const item = { slug: "pompe-x", name: "Pompe X", quantity: 2 };
  const valid = validateQuoteInput({ items: [item] });
  assert.ok(valid.ok);
  assert.deepEqual(valid.data.items, [item]);

  assert.deepEqual(validateQuoteInput({ items: Array(51).fill(item) }), { ok: false, reason: "invalid" });
  assert.deepEqual(validateQuoteInput({ items: [{ ...item, quantity: 0 }] }), { ok: false, reason: "invalid" });
});

test("données de forme inattendue (appel direct de l'action) : refusées sans planter", () => {
  const weird = [
    { name: 42 },
    { website: { a: 1 } },
    { items: "pas un tableau" },
    { items: [null] },
    { items: [{ slug: 1, name: [], quantity: "2" }] },
  ] as unknown as QuoteRequestInput[];
  for (const input of weird) {
    const result = validateQuoteInput(input);
    assert.equal(result.ok, false, JSON.stringify(input));
  }
  assert.equal(validateQuoteInput(null as unknown as QuoteRequestInput).ok, false);
});

test("source par défaut : site", () => {
  const result = validateQuoteInput({ message: "Bonjour" });
  assert.ok(result.ok);
  assert.equal(result.data.source, "site");
});
