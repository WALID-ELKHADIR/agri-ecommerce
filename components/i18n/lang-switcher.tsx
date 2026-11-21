"use client";

import { direction, type Locale } from "@/lib/i18n";
import { localeCookie } from "@/lib/i18n/cookie";
import { cn } from "@/lib/cn";
import { useLocale } from "./use-locale";

const OPTIONS: { locale: Locale; label: string; name: string }[] = [
  { locale: "ar", label: "AR", name: "العربية" },
  { locale: "fr", label: "FR", name: "Français" },
];

/** Retient la langue et l'applique tout de suite (`<html lang dir>`, lu par le CSS et useLocale). */
function applyLocale(next: Locale): void {
  document.cookie = localeCookie(next);
  document.documentElement.setAttribute("lang", next);
  document.documentElement.setAttribute("dir", direction(next));
}

/** Bascule AR | FR : retenue un an (cookie), appliquée sans recharger la page. */
export function LangSwitcher({ className }: { className?: string }) {
  const { locale, t } = useLocale();

  return (
    <div
      role="group"
      aria-label={t.languageSwitch}
      dir="ltr"
      className={cn("flex h-11 items-center rounded-full border border-soil-300/80 bg-white p-1 text-xs font-semibold", className)}
    >
      {OPTIONS.map((option) => (
        <button
          key={option.locale}
          type="button"
          lang={option.locale}
          aria-pressed={locale === option.locale}
          aria-label={option.name}
          onClick={() => applyLocale(option.locale)}
          className={cn(
            "h-9 min-w-9 rounded-full px-2.5 transition",
            locale === option.locale ? "bg-field-900 text-white" : "text-soil-700 hover:bg-soil-100",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
