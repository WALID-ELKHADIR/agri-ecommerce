import assert from "node:assert/strict";
import { test } from "node:test";
import { toCsv } from "../lib/admin/csv.ts";
import { filterProducts, type FilterableProduct } from "../lib/admin/product-filters.ts";
import { computeQuoteStats, type StatsQuote } from "../lib/admin/quote-stats.ts";
import { whatsappReplyUrl } from "../lib/admin/whatsapp-reply.ts";
import { slugify } from "../lib/slugify.ts";

test("slugify : minuscules, sans accents ni ponctuation", () => {
  assert.equal(slugify("Pompe immergée 4\" — Inox"), "pompe-immergee-4-inox");
  assert.equal(slugify("  Arrosage & goutte-à-goutte  "), "arrosage-goutte-a-goutte");
  assert.equal(slugify("***"), "");
});

const P = (over: Partial<FilterableProduct>): FilterableProduct => ({
  name: "Produit",
  slug: "produit",
  category: "pompes",
  published: true,
  featured: false,
  position: 0,
  createdAt: "2026-11-01T00:00:00Z",
  ...over,
});

test("filtres produits : recherche sans accents, gamme, statut", () => {
  const list = [
    P({ name: "Pompe immergée", slug: "pompe-immergee" }),
    P({ name: "Coude PE", slug: "coude-pe", category: "raccords" }),
    P({ name: "Colle PVC", slug: "colle-pvc", category: "raccords", published: false }),
  ];
  assert.deepEqual(filterProducts(list, { q: "immergee" }).map((p) => p.slug), ["pompe-immergee"]);
  assert.deepEqual(filterProducts(list, { category: "raccords" }).map((p) => p.slug), ["coude-pe", "colle-pvc"]);
  assert.deepEqual(filterProducts(list, { status: "draft" }).map((p) => p.slug), ["colle-pvc"]);
  assert.deepEqual(filterProducts(list, { status: "published", category: "raccords" }).map((p) => p.slug), ["coude-pe"]);
});

test("tri produits : position, nom, plus récents, mis en avant d'abord", () => {
  const list = [
    P({ name: "Bravo", slug: "b", position: 2, createdAt: "2026-11-03T00:00:00Z" }),
    P({ name: "alpha", slug: "a", position: 3, featured: true, createdAt: "2026-11-01T00:00:00Z" }),
    P({ name: "Charlie", slug: "c", position: 1, createdAt: "2026-11-02T00:00:00Z" }),
  ];
  assert.deepEqual(filterProducts(list, {}).map((p) => p.slug), ["c", "b", "a"]);
  assert.deepEqual(filterProducts(list, { sort: "name" }).map((p) => p.slug), ["a", "b", "c"]);
  assert.deepEqual(filterProducts(list, { sort: "recent" }).map((p) => p.slug), ["b", "c", "a"]);
  assert.deepEqual(filterProducts(list, { sort: "featured" }).map((p) => p.slug), ["a", "c", "b"]);
});

const NOW = new Date("2026-11-21T12:00:00Z");
const Q = (daysAgo: number, over: Partial<StatsQuote> = {}): StatsQuote => ({
  createdAt: new Date(NOW.getTime() - daysAgo * 86_400_000).toISOString(),
  status: "new",
  source: "site",
  productSlug: null,
  items: null,
  ...over,
});

test("statistiques des demandes : périodes, taux de gain, top produits, sources", () => {
  const stats = computeQuoteStats(
    [
      Q(1, { status: "won", source: "fiche-produit", productSlug: "pompe-a" }),
      Q(2, { status: "lost", source: "contact" }),
      Q(3, { status: "won", items: [{ slug: "pompe-a", name: "Pompe A", quantity: 3 }, { slug: "coude", name: "Coude", quantity: 1 }] }),
      Q(10, { status: "contacted", productSlug: "coude" }),
      Q(40, { status: "won", productSlug: "pompe-a" }),
    ],
    NOW,
  );
  assert.equal(stats.last7, 3);
  assert.equal(stats.last30, 4);
  assert.equal(stats.winRate, 2 / 3, "sur 30 jours : 2 gagnées, 1 perdue");
  assert.deepEqual(stats.topProducts[0], { slug: "pompe-a", count: 2 });
  assert.deepEqual(stats.topProducts[1], { slug: "coude", count: 2 });
  assert.deepEqual(stats.sources[0], { source: "site", count: 2 });
  assert.equal(stats.daily.length, 14);
  assert.equal(stats.daily.at(-1)?.count, 0, "aujourd'hui");
  assert.equal(stats.daily.at(-2)?.count, 1, "hier");
});

test("statistiques : taux de gain nul s'il n'y a rien de conclu", () => {
  assert.equal(computeQuoteStats([Q(1)], NOW).winRate, null);
  assert.equal(computeQuoteStats([], NOW).last30, 0);
});

test("CSV : BOM, point-virgule, échappement et protection contre les formules", () => {
  const csv = toCsv(["Nom", "Message"], [
    ["Ali; Ben", 'Il a dit "oui"\nEnvoyez'],
    ["=HYPERLINK(\"x\")", "+212 6"],
  ]);
  assert.ok(csv.startsWith("﻿"));
  const lines = csv.slice(1).split("\r\n");
  assert.equal(lines[0], "Nom;Message");
  assert.equal(lines[1], '"Ali; Ben";"Il a dit ""oui""\nEnvoyez"');
  assert.equal(lines[2], `"'=HYPERLINK(""x"")";'+212 6`);
});

test("réponse WhatsApp : numéro du client normalisé et message prérempli", () => {
  const url = whatsappReplyUrl({ phone: "06 12 34 56 78", name: "Ali", product: "Pompe immergée" });
  assert.ok(url);
  const parsed = new URL(url);
  assert.equal(parsed.pathname, "/212612345678");
  assert.match(parsed.searchParams.get("text") ?? "", /Bonjour Ali/);
  assert.match(parsed.searchParams.get("text") ?? "", /Pompe immergée/);
  assert.equal(whatsappReplyUrl({ phone: "abc", name: null, product: null }), null);
  assert.equal(whatsappReplyUrl({ phone: null, name: "Ali", product: null }), null);
});
