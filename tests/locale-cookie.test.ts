import assert from "node:assert/strict";
import { test } from "node:test";
import { LOCALE_COOKIE, localeCookie, localeFromCookie } from "../lib/i18n/cookie.ts";
import { slideIndex } from "../lib/slider.ts";

test("cookie de langue : lecture tolérante, français par défaut", () => {
  assert.equal(localeFromCookie(`${LOCALE_COOKIE}=ar`), "ar");
  assert.equal(localeFromCookie(`a=1; ${LOCALE_COOKIE}=fr; b=2`), "fr");
  assert.equal(localeFromCookie(`${LOCALE_COOKIE}=xx`), "fr");
  assert.equal(localeFromCookie(""), "fr");
  assert.equal(localeFromCookie(`other_${LOCALE_COOKIE}=ar`), "fr");
});

test("cookie de langue : écriture d'un an, tout le site", () => {
  const value = localeCookie("ar");
  assert.match(value, new RegExp(`^${LOCALE_COOKIE}=ar;`));
  assert.match(value, /Path=\//);
  assert.match(value, /Max-Age=31536000/);
  assert.match(value, /SameSite=Lax/);
});

test("carrousel : index circulaire dans les deux sens", () => {
  assert.equal(slideIndex(0, 3, 1), 1);
  assert.equal(slideIndex(2, 3, 1), 0);
  assert.equal(slideIndex(0, 3, -1), 2);
  assert.equal(slideIndex(5, 3, 0), 2);
  assert.equal(slideIndex(0, 0, 1), 0);
});
