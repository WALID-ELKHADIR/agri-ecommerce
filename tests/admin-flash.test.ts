import assert from "node:assert/strict";
import test from "node:test";
import { adminAr } from "../lib/i18n/admin-ar.ts";
import { adminFr } from "../lib/i18n/admin-fr.ts";
import { flashCode, flashText } from "../lib/i18n/flash.ts";

test("une clé simple est traduite dans la langue de l'admin", () => {
  assert.equal(flashText(adminFr.flash, "productSaved"), "Produit enregistré.");
  assert.equal(flashText(adminAr.flash, "productSaved"), "تم حفظ المنتج.");
});

test("une clé avec argument passe l'argument au message", () => {
  const code = flashCode("idExists", "pompes");
  assert.equal(code, "idExists~pompes");
  assert.equal(flashText(adminFr.flash, code), "L'identifiant « pompes » existe déjà.");
  assert.match(flashText(adminAr.flash, code), /pompes/);
});

test("l'argument peut contenir le séparateur", () => {
  assert.equal(flashText(adminFr.flash, flashCode("orderNotSaved", "a~b")), "Ordre non enregistré : a~b");
});

test("« 1 » signifie modifications enregistrées", () => {
  assert.equal(flashText(adminFr.flash, "1"), "Modifications enregistrées.");
});

test("un message inconnu (erreur de la base) s'affiche tel quel", () => {
  assert.equal(flashText(adminFr.flash, "duplicate key value"), "duplicate key value");
  assert.equal(flashText(adminFr.flash, "constructor"), "constructor");
});

test("le dictionnaire arabe a exactement les clés du français", () => {
  const keys = (value: unknown, prefix = ""): string[] =>
    value && typeof value === "object" && !Array.isArray(value)
      ? Object.entries(value).flatMap(([key, child]) => keys(child, `${prefix}${key}.`))
      : [prefix];
  assert.deepEqual(keys(adminAr).sort(), keys(adminFr).sort());
});
