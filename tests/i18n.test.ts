import assert from "node:assert/strict";
import { test } from "node:test";
import { DEFAULT_LOCALE, direction, getDictionary } from "../lib/i18n/index.ts";
import { ar } from "../lib/i18n/ar.ts";
import { fr } from "../lib/i18n/fr.ts";

test("sens de lecture : arabe de droite à gauche", () => {
  assert.equal(direction("ar"), "rtl");
  assert.equal(direction("fr"), "ltr");
  assert.equal(DEFAULT_LOCALE, "fr");
});

test("dictionnaires : mêmes clés en français et en arabe", () => {
  assert.deepEqual(Object.keys(ar).sort(), Object.keys(fr).sort());
  for (const value of Object.values(ar)) assert.ok(typeof value === "string" ? value.length > 0 : true);
});

test("langue inconnue : repli sur le français", () => {
  assert.equal(getDictionary("xx"), fr);
  assert.equal(getDictionary("ar"), ar);
});

test("message WhatsApp localisé", () => {
  assert.match(fr.whatsappGeneral("Saqia"), /Saqia/);
  assert.match(ar.whatsappGeneral("Saqia"), /Saqia/);
});
