"use client";

import { cn } from "@/lib/cn";
import type { Locale } from "@/lib/i18n";
import { localeCookie } from "@/lib/i18n/cookie";
import { useLocale } from "./locale-provider";

const OPTIONS: { locale: Locale; label: string; name: string }[] = [
  { locale: "ar", label: "AR", name: "العربية" },
  { locale: "fr", label: "FR", name: "Français" },
];

/**
 * Retient la langue (cookie lu par le proxy) puis recharge la page : le serveur
 * renvoie alors la version de cette langue, à la même adresse.
 */
function applyLocale(next: Locale): void {
  document.cookie = localeCookie(next);
  window.location.reload();
}

/** Bascule AR | FR, dans l'en-tête de la vitrine et de l'admin. */
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
          onClick={() => (locale === option.locale ? undefined : applyLocale(option.locale))}
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
