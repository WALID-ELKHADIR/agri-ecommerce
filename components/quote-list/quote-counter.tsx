"use client";

import { useEffect, useState } from "react";
import { List } from "@/components/icons";
import { cn } from "@/lib/cn";
import { onQuoteAdded, openQuoteDrawer, useQuoteList } from "./use-quote-list";

/** Icône « Ma liste » du header, avec le nombre d'articles. */
export function QuoteCounter({ className }: { className?: string }) {
  const { count } = useQuoteList();
  const [bump, setBump] = useState(0);

  useEffect(() => onQuoteAdded(() => setBump((value) => value + 1)), []);

  return (
    <button
      type="button"
      lang="fr"
      data-quote-target=""
      onClick={openQuoteDrawer}
      aria-label={count > 0 ? `Ma liste de devis : ${count} article${count > 1 ? "s" : ""}` : "Ma liste de devis (vide)"}
      className={cn(
        "relative flex h-11 w-11 items-center justify-center rounded-full border border-soil-200 bg-white text-soil-900 transition hover:border-water-300",
        className,
      )}
    >
      <List className="h-5 w-5" />
      {count > 0 ? (
        <span
          key={bump}
          className="quote-bump absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-whatsapp px-1 text-[11px] font-bold text-white tabular-nums"
        >
          {count > 99 ? "99+" : count}
        </span>
      ) : null}
    </button>
  );
}
