import assert from "node:assert/strict";
import { test } from "node:test";
import {
  generalMessage,
  productMessage,
  quoteListMessage,
  WHATSAPP_MESSAGE_MAX,
  whatsappLink,
} from "../lib/whatsapp.ts";

test("message produit : quantité, nom et lien de la fiche", () => {
  const message = productMessage(
    { name: 'Pompe immergée inox 4"', slug: "pompe-immergee-inox-4-pouces" },
    2,
    "https://saqia.ma",
  );
  assert.match(message, /2 × Pompe immergée inox 4"/);
  assert.match(message, /https:\/\/saqia\.ma\/produits\/pompe-immergee-inox-4-pouces/);
});

test("message général : nomme la marque", () => {
  assert.match(generalMessage("Saqia"), /Saqia/);
});

test("liste de devis : une ligne par produit, nom et ville", () => {
  const message = quoteListMessage(
    [
      { name: "A", quantity: 1 },
      { name: "B", quantity: 3 },
    ],
    { name: "Ali", city: "Agadir" },
    "Saqia",
  );
  assert.match(message, /• 1 × A/);
  assert.match(message, /• 3 × B/);
  assert.match(message, /Nom : Ali/);
  assert.match(message, /Ville : Agadir/);
});

test("liste de devis : sans nom ni ville, aucune ligne vide de contact", () => {
  const message = quoteListMessage([{ name: "A", quantity: 1 }], {}, "Saqia");
  assert.doesNotMatch(message, /Nom :/);
  assert.doesNotMatch(message, /Ville :/);
});

test("liste de devis trop longue : tronquée par lignes entières, avec le compte exact", () => {
  const lines = Array.from({ length: 50 }, (_, i) => ({ name: `${"x".repeat(140)}-${i}`, quantity: 1 }));
  const message = quoteListMessage(lines, { name: "Ali" }, "Saqia");
  assert.ok(message.length <= WHATSAPP_MESSAGE_MAX, `longueur ${message.length}`);
  const shown = message.split("\n").filter((line) => line.startsWith("• ")).length;
  assert.match(message, new RegExp(`… et ${50 - shown} autres produits`));
  assert.ok(shown > 0 && shown < 50);
  for (const line of message.split("\n").filter((l) => l.startsWith("• "))) {
    assert.match(line, /-\d+$/, "aucun nom coupé au milieu");
  }
});

test("lien : numéro et texte encodé", () => {
  assert.equal(whatsappLink("a b&c", "212600000000"), "https://wa.me/212600000000?text=a%20b%26c");
});

test("lien : la région est acceptée mais pas encore routée", () => {
  assert.equal(whatsappLink("m", "212600000000", "souss"), whatsappLink("m", "212600000000"));
});

test("messages en arabe avec le dictionnaire arabe", async () => {
  const { ar } = await import("../lib/i18n/ar.ts");
  const message = quoteListMessage([{ name: "A", quantity: 2 }], { name: "علي", city: "أكادير" }, "Saqia", ar);
  assert.match(message, /مرحبًا Saqia/);
  assert.match(message, /• 2 × A/);
  assert.match(message, /المدينة: أكادير/);
  assert.match(productMessage({ name: "Pompe", slug: "p" }, 1, "https://saqia.site", ar), /أرغب في عرض سعر/);
});

test("un seul produit en trop : accord au singulier", () => {
  const lines = Array.from({ length: 13 }, (_, i) => ({ name: `${"x".repeat(140)}-${i}`, quantity: 1 }));
  const message = quoteListMessage(lines, {}, "Saqia");
  const shown = message.split("\n").filter((l) => l.startsWith("• ")).length;
  if (13 - shown === 1) assert.match(message, /… et 1 autre produit$/m);
  else assert.match(message, new RegExp(`… et ${13 - shown} autres produits`));
});
