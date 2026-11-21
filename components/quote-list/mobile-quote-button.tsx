"use client";

import { List } from "@/components/icons";
import { useLocale } from "@/components/i18n/locale-provider";
import { openQuoteDrawer, useQuoteList } from "./use-quote-list";

/** « Ma liste (n) » dans la barre mobile, affiché seulement si la liste n'est pas vide. */
export function MobileQuoteButton() {
  const { count } = useQuoteList();
  const { t } = useLocale();
  if (count === 0) return null;

  return (
    <button
      type="button"
      data-quote-target=""
      onClick={openQuoteDrawer}
      className="flex min-h-12 shrink-0 items-center gap-2 rounded-xl border border-field-900/15 bg-white px-4 text-sm font-semibold text-soil-900"
    >
      <List className="h-4 w-4" />
      {t.ui.myListButton(count > 99 ? 99 : count)}
    </button>
  );
}
