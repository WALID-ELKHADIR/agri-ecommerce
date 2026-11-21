import assert from "node:assert/strict";
import { test } from "node:test";
import { resolveWhatsappNumber } from "../lib/whatsapp-region.ts";

const settings = {
  whatsappNumber: "212600000000",
  whatsappRegions: [
    { region: "Souss-Massa", number: "212611111111" },
    { region: "Oriental", number: "pas un numéro" },
  ],
};

test("région connue : son numéro, sans casse ni accents", () => {
  assert.equal(resolveWhatsappNumber(settings, "souss massa"), "212611111111");
  assert.equal(resolveWhatsappNumber(settings, "SOUSS-MASSA"), "212611111111");
});

test("région inconnue, vide ou numéro invalide : numéro par défaut", () => {
  assert.equal(resolveWhatsappNumber(settings, "Fès-Meknès"), "212600000000");
  assert.equal(resolveWhatsappNumber(settings, ""), "212600000000");
  assert.equal(resolveWhatsappNumber(settings, undefined), "212600000000");
  assert.equal(resolveWhatsappNumber(settings, "Oriental"), "212600000000");
});
