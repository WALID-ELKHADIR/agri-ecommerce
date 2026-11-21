"use client";

import { useLocale } from "@/components/i18n/locale-provider";
import { adminAr } from "@/lib/i18n/admin-ar";
import { adminFr, type AdminDictionary } from "@/lib/i18n/admin-fr";

/** Textes de l'administration dans la langue de la page (composants client). */
export function useAdminDictionary(): AdminDictionary {
  return useLocale().locale === "ar" ? adminAr : adminFr;
}
