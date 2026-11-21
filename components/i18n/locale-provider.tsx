"use client";

import { createContext, useContext, type ReactNode } from "react";
import { ar } from "@/lib/i18n/ar";
import { fr, type Dictionary } from "@/lib/i18n/fr";
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n";

const LocaleContext = createContext<Locale>(DEFAULT_LOCALE);

/** Langue de la page, fournie par le layout racine aux composants client. */
export function LocaleProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>;
}

/** Langue et textes de la vitrine, pour les composants client. */
export function useLocale(): { locale: Locale; t: Dictionary } {
  const locale = useContext(LocaleContext);
  return { locale, t: locale === "ar" ? ar : fr };
}
