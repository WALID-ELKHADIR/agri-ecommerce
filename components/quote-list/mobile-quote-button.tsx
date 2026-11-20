"use client";

import { List } from "@/components/icons";
import { openQuoteDrawer, useQuoteList } from "./use-quote-list";

/** « Ma liste (n) » dans la barre mobile, affiché seulement si la liste n'est pas vide. */
export function MobileQuoteButton() {
  const { count } = useQuoteList();
  if (count === 0) return null;

  return (
    <button
      type="button"
      onClick={openQuoteDrawer}
      className="flex min-h-12 shrink-0 items-center gap-2 rounded-xl border border-field-900/15 bg-white px-4 text-sm font-semibold text-soil-900"
    >
      <List className="h-4 w-4" />
      Ma liste ({count > 99 ? "99+" : count})
    </button>
  );
}
