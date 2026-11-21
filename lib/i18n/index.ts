/**
 * Structure i18n (français par défaut, arabe préparé). Aucune route /ar n'est
 * publiée : voir docs/evolutions.md pour l'activation.
 */
import { ar } from "./ar.ts";
import { fr, type Dictionary } from "./fr.ts";

export const LOCALES = ["fr", "ar"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "fr";

const DICTIONARIES: Record<Locale, Dictionary> = { fr, ar };

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

/** Dictionnaire d'une langue ; langue inconnue → français. */
export function getDictionary(locale: string): Dictionary {
  return DICTIONARIES[isLocale(locale) ? locale : DEFAULT_LOCALE];
}

/** Sens de lecture pour l'attribut `dir` de <html>. */
export function direction(locale: Locale): "ltr" | "rtl" {
  return locale === "ar" ? "rtl" : "ltr";
}
