import assert from "node:assert/strict";
import { test } from "node:test";
import { MIN_FILL_MS, validateQuoteInput } from "../lib/quote-validation.ts";

const NOW = 1_000_000;

test("champ piège rempli : considéré comme spam", () => {
  const result = validateQuoteInput({ name: "Ali", website: "http://spam.example" }, NOW);
  assert.deepEqual(result, { ok: false, reason: "spam" });
});

test("formulaire envoyé trop vite : considéré comme spam", () => {
  const result = validateQuoteInput({ name: "Ali", startedAt: NOW - (MIN_FILL_MS - 1) }, NOW);
  assert.deepEqual(result, { ok: false, reason: "spam" });
});

test("formulaire rempli normalement : accepté", () => {
  const result = validateQuoteInput({ name: "Ali", startedAt: NOW - MIN_FILL_MS }, NOW);
  assert.equal(result.ok, true);
});

test("sans startedAt (clic depuis une fiche produit) : pas de délai minimal", () => {
  const result = validateQuoteInput({ productSlug: "pompe-x", quantity: 2 }, NOW);
  assert.equal(result.ok, true);
});

test("demande entièrement vide : refusée", () => {
  assert.deepEqual(validateQuoteInput({ name: "  ", phone: "" }, NOW), { ok: false, reason: "empty" });
});

test("tronque les textes aux limites de la base", () => {
  const result = validateQuoteInput(
    {
      name: "n".repeat(200),
      phone: "1".repeat(60),
      email: "e".repeat(300),
      profile: "p".repeat(200),
      productSlug: "s".repeat(300),
      message: "m".repeat(3000),
      source: "x".repeat(80),
    },
    NOW,
  );
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
    const result = validateQuoteInput({ productSlug: "x", quantity }, NOW);
    assert.ok(result.ok);
    assert.equal(result.data.quantity, null, `quantité: ${quantity}`);
  }
  const ok = validateQuoteInput({ productSlug: "x", quantity: 100_000 }, NOW);
  assert.ok(ok.ok);
  assert.equal(ok.data.quantity, 100_000);
});

test("items : au plus 50 lignes valides", () => {
  const item = { slug: "pompe-x", name: "Pompe X", quantity: 2 };
  const valid = validateQuoteInput({ items: [item] }, NOW);
  assert.ok(valid.ok);
  assert.deepEqual(valid.data.items, [item]);

  assert.deepEqual(validateQuoteInput({ items: Array(51).fill(item) }, NOW), { ok: false, reason: "invalid" });
  assert.deepEqual(validateQuoteInput({ items: [{ ...item, quantity: 0 }] }, NOW), {
    ok: false,
    reason: "invalid",
  });
});

test("source par défaut : site", () => {
  const result = validateQuoteInput({ message: "Bonjour" }, NOW);
  assert.ok(result.ok);
  assert.equal(result.data.source, "site");
});
