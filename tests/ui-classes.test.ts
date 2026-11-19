import assert from "node:assert/strict";
import { test } from "node:test";
import { buttonClasses } from "../components/ui/button-classes.ts";
import { cn } from "../lib/cn.ts";

test("cn assemble les classes et ignore les valeurs vides", () => {
  assert.equal(cn("a", false, null, undefined, "", "b"), "a b");
  assert.equal(cn(), "");
});

test("le bouton WhatsApp utilise le vert réservé à la conversion", () => {
  const classes = buttonClasses({ variant: "whatsapp" });
  assert.match(classes, /\bbg-whatsapp\b/);
  assert.match(classes, /\bhover:bg-whatsapp-hover\b/);
});

test("seul le bouton WhatsApp utilise le vert WhatsApp", () => {
  for (const variant of ["primary", "secondary", "ghost"] as const) {
    assert.doesNotMatch(buttonClasses({ variant }), /whatsapp/, variant);
  }
});

test("toutes les tailles offrent une cible tactile d'au moins 44 px sur mobile", () => {
  for (const size of ["sm", "md", "lg"] as const) {
    assert.match(buttonClasses({ size }), /\bmin-h-11\b|\bmin-h-12\b/, size);
  }
});

test("pleine largeur et classes supplémentaires", () => {
  const classes = buttonClasses({ fullWidth: true, className: "mt-4" });
  assert.match(classes, /\bw-full\b/);
  assert.match(classes, /\bmt-4\b/);
});
