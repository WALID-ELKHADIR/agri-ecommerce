/**
 * Langue de la page côté serveur (paramètre racine [lang], voir app/[lang]/layout.tsx).
 * Utilisable dans les composants serveur et les fonctions serveur, pas dans les
 * Server Actions ni les Route Handlers (Next.js) : ceux-ci lisent le cookie.
 */
import { lang } from "next/root-params";
import { notFound } from "next/navigation";
import { adminAr } from "./admin-ar.ts";
import { adminFr, type AdminDictionary } from "./admin-fr.ts";
import { ar } from "./ar.ts";
import { fr, type Dictionary } from "./fr.ts";
import { isLocale, type Locale } from "./index.ts";

export async function getLocale(): Promise<Locale> {
  const value = await lang();
  if (!isLocale(value)) notFound();
  return value;
}

/** Textes de la vitrine dans la langue de la page. */
export async function getDictionary(): Promise<Dictionary> {
  return (await getLocale()) === "ar" ? ar : fr;
}

/** Textes de l'administration dans la langue de la page. */
export async function getAdminDictionary(): Promise<AdminDictionary> {
  return (await getLocale()) === "ar" ? adminAr : adminFr;
}
