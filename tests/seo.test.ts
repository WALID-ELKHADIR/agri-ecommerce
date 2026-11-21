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

const SETTINGS = { name: "Saqia", phoneRaw: "+212600000000", email: "contact@saqia.site", address: "Casablanca, Maroc" };
const PRODUCT = {
  slug: "pompe-a",
  name: "Pompe A",
  description: "Pompe immergée inox.",
  categoryLabel: "Pompes & motopompes",
  image: "/images/products/pompe-a/main.webp",
  imagePlaceholder: false,
};

test("JSON-LD entreprise : identité et contact, aucune note ni offre", async () => {
  const { organizationJsonLd } = await import("../lib/seo.ts");
  const data = organizationJsonLd(SETTINGS, "https://saqia.site") as Record<string, unknown>;
  assert.equal(data["@type"], "Organization");
  assert.equal(data.url, "https://saqia.site/");
  assert.match(String(data.logo), /^https:\/\/saqia\.site\//);
  assert.equal(data.telephone, "+212600000000");
  assert.equal(data.areaServed, "MA");
  for (const key of ["aggregateRating", "review", "offers"]) assert.equal(key in data, false, key);
});

test("JSON-LD produit : faits connus seulement, pas de photo provisoire", async () => {
  const { productJsonLd } = await import("../lib/seo.ts");
  const data = productJsonLd(PRODUCT, "https://saqia.site") as Record<string, unknown>;
  assert.equal(data["@type"], "Product");
  assert.equal(data.name, "Pompe A");
  assert.equal(data.category, "Pompes & motopompes");
  assert.equal(data.url, "https://saqia.site/produits/pompe-a");
  assert.equal(data.image, "https://saqia.site/images/products/pompe-a/main.webp");
  for (const key of ["offers", "review", "aggregateRating"]) assert.equal(key in data, false, key);
  const placeholder = productJsonLd({ ...PRODUCT, imagePlaceholder: true }, "https://saqia.site") as Record<string, unknown>;
  assert.equal("image" in placeholder, false);
});

test("JSON-LD fil d'Ariane : positions et URL absolues", async () => {
  const { breadcrumbJsonLd } = await import("../lib/seo.ts");
  const data = breadcrumbJsonLd([{ name: "Accueil", path: "/" }, { name: "Produits", path: "/produits" }], "https://saqia.site") as {
    itemListElement: { position: number; item: string; name: string }[];
  };
  assert.deepEqual(data.itemListElement.map((i) => [i.position, i.item]), [[1, "https://saqia.site/"], [2, "https://saqia.site/produits"]]);
});

test("JSON-LD : un texte avec </script> ne ferme pas la balise", async () => {
  const { jsonLdScript, productJsonLd } = await import("../lib/seo.ts");
  const out = jsonLdScript(productJsonLd({ ...PRODUCT, name: 'Pompe "A" </script><script>alert(1)</script>' }, "https://saqia.site"));
  assert.equal(out.includes("</script"), false);
  assert.equal(JSON.parse(out).name, 'Pompe "A" </script><script>alert(1)</script>');
});

test("JSON-LD entreprise : logo hors des chemins bloqués par robots.txt", async () => {
  const { organizationJsonLd } = await import("../lib/seo.ts");
  const data = organizationJsonLd(SETTINGS, "https://saqia.site") as Record<string, unknown>;
  for (const blocked of ["/admin", "/brand", "/design"]) {
    assert.equal(new URL(String(data.logo)).pathname.startsWith(blocked), false, String(data.logo));
  }
});

test("JSON-LD entreprise : coordonnées provisoires jamais publiées comme des faits", async () => {
  const { organizationJsonLd } = await import("../lib/seo.ts");
  const fallback = { phoneRaw: "+212600000000", email: "contact@saqia.com", address: "Casablanca, Maroc — livraison nationale" };
  const data = organizationJsonLd({ name: "Saqia", ...fallback }, "https://saqia.site", fallback) as Record<string, unknown>;
  for (const key of ["telephone", "email", "address", "contactPoint"]) assert.equal(key in data, false, key);
  const real = organizationJsonLd({ name: "Saqia", phoneRaw: "+212661234567", email: "ventes@saqia.site", address: "Agadir" }, "https://saqia.site", fallback) as Record<string, unknown>;
  assert.equal(real.telephone, "+212661234567");
  assert.equal(real.email, "ventes@saqia.site");
});

test("chemin d'image locale : jamais en dehors de public/", async () => {
  const { publicFilePath } = await import("../lib/seo.ts");
  const root = "/srv/app/public";
  assert.equal(publicFilePath("/images/products/a/main.webp", root), "/srv/app/public/images/products/a/main.webp");
  assert.equal(publicFilePath("/../../etc/passwd", root), null);
  assert.equal(publicFilePath("/images/../../.env.local", root), null);
});
