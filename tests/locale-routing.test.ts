import assert from "node:assert/strict";
import { test } from "node:test";
import { localeRoute, localizedPaths, withoutLocale } from "../lib/i18n/routing.ts";

test("sans préfixe : réécriture interne vers la langue du cookie (français par défaut)", () => {
  assert.deepEqual(localeRoute("/", "ar"), { type: "rewrite", path: "/ar" });
  assert.deepEqual(localeRoute("/produits", "fr"), { type: "rewrite", path: "/fr/produits" });
  assert.deepEqual(localeRoute("/produits/pompe-a", null), { type: "rewrite", path: "/fr/produits/pompe-a" });
  assert.deepEqual(localeRoute("/admin/demandes", "xx"), { type: "rewrite", path: "/fr/admin/demandes" });
});

test("lien avec préfixe (/ar/..., /fr/...) : redirection sans préfixe et langue retenue", () => {
  assert.deepEqual(localeRoute("/ar/produits", "fr"), { type: "redirect", path: "/produits", locale: "ar" });
  assert.deepEqual(localeRoute("/fr", "ar"), { type: "redirect", path: "/", locale: "fr" });
  assert.deepEqual(localeRoute("/ar", null), { type: "redirect", path: "/", locale: "ar" });
});

test("un segment qui ressemble à une langue n'en est pas une", () => {
  assert.deepEqual(localeRoute("/arrosage", "fr"), { type: "rewrite", path: "/fr/arrosage" });
  assert.deepEqual(localeRoute("/frites", "ar"), { type: "rewrite", path: "/ar/frites" });
});

test("chemins réels d'une page dans chaque langue (pour revalidatePath)", () => {
  assert.deepEqual(localizedPaths("/produits"), ["/fr/produits", "/ar/produits"]);
  assert.deepEqual(localizedPaths("/"), ["/fr", "/ar"]);
});

test("redirection d'un lien préfixé : jamais vers un autre site (//domaine)", () => {
  for (const path of ["/ar//evil.com", "/fr///evil.com/x", "/ar/\\evil.com"]) {
    const route = localeRoute(path, null);
    assert.equal(route.type, "redirect");
    assert.ok(!/^\/[/\\]/.test(route.path), `${path} → ${route.path}`);
    assert.equal(new URL(route.path, "https://saqia.site").host, "saqia.site", path);
  }
});

test("chemin sans langue : identique côté serveur (/fr/produits) et navigateur (/produits)", () => {
  assert.equal(withoutLocale("/fr/produits"), "/produits");
  assert.equal(withoutLocale("/produits"), "/produits");
  assert.equal(withoutLocale("/ar"), "/");
  assert.equal(withoutLocale("/fr"), "/");
  assert.equal(withoutLocale("/"), "/");
  assert.equal(withoutLocale("/ar/admin/produits/1"), "/admin/produits/1");
  assert.equal(withoutLocale("/arrosage"), "/arrosage");
});
