/**
 * Routage par langue (module pur, testé dans tests/locale-routing.test.ts).
 * Les adresses visibles n'ont pas de préfixe ; le proxy sert en interne la
 * version /fr/... ou /ar/... selon le cookie. Un lien préfixé (/ar/produits)
 * redirige vers l'adresse sans préfixe et retient la langue.
 */
import { DEFAULT_LOCALE, isLocale, LOCALES, type Locale } from "./index.ts";

export type LocaleRoute =
  | { type: "rewrite"; path: string }
  | { type: "redirect"; path: string; locale: Locale };

export function localeRoute(pathname: string, cookieLocale: string | null): LocaleRoute {
  const [, first = "", ...rest] = pathname.split("/");
  if (isLocale(first)) {
    // Barres en tête retirées : « /ar//site.com » ne doit jamais rediriger vers un autre site.
    return { type: "redirect", path: `/${rest.join("/").replace(/^[/\\]+/, "")}`, locale: first };
  }
  const locale = cookieLocale && isLocale(cookieLocale) ? cookieLocale : DEFAULT_LOCALE;
  return { type: "rewrite", path: pathname === "/" ? `/${locale}` : `/${locale}${pathname}` };
}

/**
 * Adresse visible d'un chemin, sans la langue. usePathname() donne « /fr/produits »
 * au rendu serveur (destination de la réécriture) et « /produits » dans le
 * navigateur : comparer ce résultat évite un écart d'hydratation.
 */
export function withoutLocale(pathname: string): string {
  const [, first = "", ...rest] = pathname.split("/");
  return isLocale(first) ? `/${rest.join("/")}` : pathname;
}

/** Chemins réels (avec langue) d'une adresse visible, pour revalidatePath. */
export function localizedPaths(path: string): string[] {
  return LOCALES.map((locale) => (path === "/" ? `/${locale}` : `/${locale}${path}`));
}
