import assert from "node:assert/strict";
import { test } from "node:test";
import { absoluteUrl, pageMetadata } from "../lib/seo.ts";

test("URL absolue : barre finale et protocole manquant", () => {
  assert.equal(absoluteUrl("/produits", "https://saqia.site/"), "https://saqia.site/produits");
  assert.equal(absoluteUrl("/", "saqia.site"), "https://saqia.site/");
  assert.equal(absoluteUrl("produits/a", "https://saqia.site"), "https://saqia.site/produits/a");
  assert.equal(absoluteUrl("https://cdn.example/x.webp", "https://saqia.site"), "https://cdn.example/x.webp");
});

test("métadonnées de page : canonique, Open Graph marocain, indexation", () => {
  const meta = pageMetadata({ title: "Catalogue", description: "Pompes", path: "/produits", siteUrl: "https://saqia.site" });
  assert.equal(meta.alternates?.canonical, "https://saqia.site/produits");
  const og = meta.openGraph as { locale?: string; siteName?: string; url?: string };
  assert.equal(og.locale, "fr_MA");
  assert.equal(og.siteName, "Saqia");
  assert.equal(og.url, "https://saqia.site/produits");
  assert.equal(meta.robots, undefined);
  const hidden = pageMetadata({ title: "x", description: "y", path: "/produits", siteUrl: "https://saqia.site", noindex: true });
  assert.deepEqual(hidden.robots, { index: false, follow: true });
});

test("plan du site : pages publiques et produits, jamais les pages internes", async () => {
  const { sitemapEntries } = await import("../lib/seo.ts");
  const urls = sitemapEntries([{ slug: "pompe-a" }, { slug: "te-pvc" }], "https://saqia.site").map((e) => e.url);
  for (const expected of ["https://saqia.site/", "https://saqia.site/produits", "https://saqia.site/contact", "https://saqia.site/produits/pompe-a", "https://saqia.site/produits/te-pvc"]) {
    assert.ok(urls.includes(expected), expected);
  }
  assert.ok(urls.every((url) => !/\/(brand|design|admin)/.test(url)));
});
