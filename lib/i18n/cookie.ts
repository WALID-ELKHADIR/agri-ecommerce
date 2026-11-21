/**
 * Langue choisie par le visiteur, gardée dans un cookie (mêmes URL en FR et AR).
 * Module pur, testé dans tests/locale-cookie.test.ts.
 */
import { DEFAULT_LOCALE, isLocale, type Locale } from "./index.ts";

export const LOCALE_COOKIE = "saqia-lang";
const ONE_YEAR = 60 * 60 * 24 * 365;

/** Langue lue dans `document.cookie` ; valeur absente ou inconnue → français. */
export function localeFromCookie(cookie: string): Locale {
  for (const part of cookie.split(";")) {
    const [name, value] = part.trim().split("=");
    if (name === LOCALE_COOKIE && value && isLocale(value)) return value;
  }
  return DEFAULT_LOCALE;
}

/** Chaîne à affecter à `document.cookie` pour retenir la langue un an. */
export function localeCookie(locale: Locale): string {
  return `${LOCALE_COOKIE}=${locale}; Path=/; Max-Age=${ONE_YEAR}; SameSite=Lax`;
}
