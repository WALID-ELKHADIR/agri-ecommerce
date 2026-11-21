import assert from "node:assert/strict";
import { test } from "node:test";
import { mergeSiteSettings, parseRegions, regionsToText } from "../lib/settings-merge.ts";
import { FALLBACK_SITE_CONFIG } from "../lib/site-config.ts";

test("réglages vides : les valeurs des variables d'environnement s'appliquent", () => {
  const merged = mergeSiteSettings(FALLBACK_SITE_CONFIG, {}, []);
  assert.equal(merged.whatsappNumber, FALLBACK_SITE_CONFIG.whatsappNumber);
  assert.equal(merged.email, FALLBACK_SITE_CONFIG.email);
  assert.deepEqual(merged.whatsappRegions, []);
});

test("réglages renseignés : ils remplacent l'environnement, numéros normalisés", () => {
  const merged = mergeSiteSettings(
    FALLBACK_SITE_CONFIG,
    { whatsappNumber: "06 61 22 33 44", phone: "05 22 11 22 33", email: " ventes@saqia.com ", address: "Agadir" },
    [{ region: "Souss", number: "+212 6 70 00 00 01" }],
  );
  assert.equal(merged.whatsappNumber, "212661223344");
  assert.equal(merged.phoneDisplay, "+212 5 22 11 22 33");
  assert.equal(merged.phoneRaw, "+212522112233");
  assert.equal(merged.email, "ventes@saqia.com");
  assert.equal(merged.address, "Agadir");
  assert.deepEqual(merged.whatsappRegions, [{ region: "Souss", number: "212670000001" }]);
});

test("un numéro invalide en base est ignoré au profit de l'environnement", () => {
  const merged = mergeSiteSettings(FALLBACK_SITE_CONFIG, { whatsappNumber: "abc" }, [{ region: "X", number: "12" }]);
  assert.equal(merged.whatsappNumber, FALLBACK_SITE_CONFIG.whatsappNumber);
  assert.deepEqual(merged.whatsappRegions, []);
});

test("régions : saisie « Région : numéro » ligne par ligne, aller-retour", () => {
  const regions = parseRegions("Souss-Massa : 06 70 00 00 01\n\n  Oriental: +212 6 70 00 00 02 \nligne sans deux-points");
  assert.deepEqual(regions, [
    { region: "Souss-Massa", number: "06 70 00 00 01" },
    { region: "Oriental", number: "+212 6 70 00 00 02" },
  ]);
  assert.equal(regionsToText(regions), "Souss-Massa : 06 70 00 00 01\nOriental : +212 6 70 00 00 02");
});

test("téléphone marocain affiché au format international, quelle que soit la saisie", () => {
  for (const phone of ["0766922545", "07 66 92 25 45", "+212766922545", "00212 7 66 92 25 45"]) {
    const merged = mergeSiteSettings(FALLBACK_SITE_CONFIG, { phone }, []);
    assert.equal(merged.phoneDisplay, "+212 7 66 92 25 45", phone);
    assert.equal(merged.phoneRaw, "+212766922545", phone);
  }
});

test("numéro étranger : affiché tel que saisi", () => {
  const merged = mergeSiteSettings(FALLBACK_SITE_CONFIG, { phone: "+33 1 23 45 67 89" }, []);
  assert.equal(merged.phoneDisplay, "+33 1 23 45 67 89");
  assert.equal(merged.phoneRaw, "+33123456789");
});
