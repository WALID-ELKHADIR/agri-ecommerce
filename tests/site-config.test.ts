import assert from "node:assert/strict";
import { test } from "node:test";
import { FALLBACK_SITE_CONFIG, readSiteConfig, whatsappUrl } from "../lib/site-config.ts";

test("normalise un numéro WhatsApp saisi avec +, espaces et tirets", () => {
  const config = readSiteConfig({ NEXT_PUBLIC_WHATSAPP_NUMBER: "+212 6 12-34-56-78" });
  assert.equal(config.whatsappNumber, "212612345678");
});

test("revient au numéro de repli si la valeur est vide, invalide ou de mauvaise longueur", () => {
  for (const value of [undefined, "", "abc", "1234567", "1234567890123456"]) {
    const config = readSiteConfig({ NEXT_PUBLIC_WHATSAPP_NUMBER: value });
    assert.equal(config.whatsappNumber, FALLBACK_SITE_CONFIG.whatsappNumber, `valeur: ${value}`);
  }
});

test("retire le slash final de l'URL du site et ignore une URL invalide", () => {
  assert.equal(readSiteConfig({ NEXT_PUBLIC_SITE_URL: "https://x.ma/" }).siteUrl, "https://x.ma");
  assert.equal(
    readSiteConfig({ NEXT_PUBLIC_SITE_URL: "pas une url" }).siteUrl,
    FALLBACK_SITE_CONFIG.siteUrl,
  );
});

test("dérive le téléphone affiché et le lien tel: de NEXT_PUBLIC_PHONE", () => {
  const config = readSiteConfig({ NEXT_PUBLIC_PHONE: "+212 6 12 34 56 78" });
  assert.equal(config.phoneDisplay, "+212 6 12 34 56 78");
  assert.equal(config.phoneRaw, "+212612345678");
});

test("utilise les valeurs fournies pour e-mail, adresse et horaires", () => {
  const config = readSiteConfig({
    NEXT_PUBLIC_CONTACT_EMAIL: "  ventes@exemple.ma ",
    NEXT_PUBLIC_ADDRESS: "Agadir, Maroc",
    NEXT_PUBLIC_HOURS: "Lun – Ven",
  });
  assert.equal(config.email, "ventes@exemple.ma");
  assert.equal(config.address, "Agadir, Maroc");
  assert.equal(config.hours, "Lun – Ven");
});

test("encode correctement accents, guillemets et symboles dans le message WhatsApp", () => {
  const message = 'Pompe immergée 4" — 90° « test » 👋';
  const url = new URL(whatsappUrl(message, "212612345678"));
  assert.equal(url.origin + url.pathname, "https://wa.me/212612345678");
  assert.equal(url.searchParams.get("text"), message);
});
