import assert from "node:assert/strict";
import { existsSync, statSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { AMBIANCE_IMAGES } from "../lib/ambiance-images.ts";

test("chaque image d'ambiance existe, au bon format, avec son crédit et sa licence", () => {
  for (const [key, image] of Object.entries(AMBIANCE_IMAGES)) {
    const file = join("public", image.src);
    assert.ok(existsSync(file), `${key} : ${file} manquant`);
    assert.equal(statSync(file).size, image.bytes, `${key} : manifest périmé`);
    assert.ok(image.bytes <= 300 * 1024, `${key} : plus de 300 Ko`);
    assert.match(image.credit.url, /^https:\/\/unsplash\.com\/photos\//, key);
    assert.ok(image.credit.author.length > 0, key);
    assert.equal(image.credit.license, "Unsplash License");
    assert.ok(image.alt.length > 0, key);
  }
});

test("hero : 16:9 sur desktop, 4:5 sur mobile", () => {
  const { heroDesktop, heroMobile } = AMBIANCE_IMAGES;
  assert.equal(heroDesktop.width / heroDesktop.height, 16 / 9);
  assert.equal(heroMobile.width / heroMobile.height, 4 / 5);
});
