"use client";

import { useSyncExternalStore } from "react";
import { ar } from "@/lib/i18n/ar";
import { fr, type Dictionary } from "@/lib/i18n/fr";
import type { Locale } from "@/lib/i18n";

function subscribe(listener: () => void): () => void {
  const observer = new MutationObserver(listener);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
  return () => observer.disconnect();
}

function snapshot(): Locale {
  return document.documentElement.lang === "ar" ? "ar" : "fr";
}

/**
 * Langue affichée (lue sur `<html lang>`), pour les attributs qui ne peuvent
 * pas contenir deux langues (aria-label, placeholder). Le serveur rend le
 * français ; la valeur se met à jour après l'hydratation.
 */
export function useLocale(): { locale: Locale; t: Dictionary } {
  const locale = useSyncExternalStore(subscribe, snapshot, () => "fr" as Locale);
  return { locale, t: locale === "ar" ? ar : fr };
}
