"use client";

import { useEffect } from "react";
import { announceQuoteAdded } from "@/components/quote-list/use-quote-list";
import { saveQuoteRequest } from "@/lib/actions/quotes";
import { quoteAddFromAttributes, waClickRecord } from "@/lib/click-tracking";
import { quoteList } from "@/lib/quote-list-store";

const ADDED_MS = 1500;

/**
 * Un seul écouteur pour tout le site (délégation) : les cartes et boutons
 * rendus par le serveur n'ont pas besoin d'être hydratés un par un.
 * - `a[data-wa-source]` : le clic WhatsApp est enregistré, sans bloquer le lien ;
 * - `button[data-quote-add]` : le produit est ajouté à la liste de devis.
 */
export function ClickTracker() {
  useEffect(() => {
    const timers = new Map<HTMLElement, number>();

    function onClick(event: MouseEvent) {
      const target = event.target instanceof Element ? event.target : null;

      const link = target?.closest<HTMLAnchorElement>("a[data-wa-source]");
      if (link) {
        const record = waClickRecord(
          { source: link.dataset.waSource, slug: link.dataset.waSlug, qty: link.dataset.waQty },
          link.href,
        );
        if (record) void saveQuoteRequest(record).catch(() => {});
        return;
      }

      const button = target?.closest<HTMLButtonElement>("button[data-quote-add]");
      if (button) {
        const add = quoteAddFromAttributes({ slug: button.dataset.slug, name: button.dataset.name, qty: button.dataset.qty });
        if (!add) return;
        quoteList.add(add.product, add.quantity);
        announceQuoteAdded();
        button.dataset.added = "true";
        window.clearTimeout(timers.get(button));
        timers.set(
          button,
          window.setTimeout(() => {
            delete button.dataset.added;
          }, ADDED_MS),
        );
      }
    }

    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("click", onClick);
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  return null;
}
