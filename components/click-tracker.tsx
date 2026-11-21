"use client";

import { useEffect } from "react";
import { announceQuoteAdded } from "@/components/quote-list/use-quote-list";
import { saveQuoteRequest } from "@/lib/actions/quotes";
import { quoteAddFromAttributes, waClickRecord } from "@/lib/click-tracking";
import { flightPath } from "@/lib/motion";
import { quoteList } from "@/lib/quote-list-store";
import { QuoteToast } from "@/components/quote-list/quote-toast";

const ADDED_MS = 1500;

/** Pastille qui vole du bouton vers l'icône « Ma liste » visible (transform et opacity). */
function flyToQuoteTarget(from: { x: number; y: number }) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const target = [...document.querySelectorAll<HTMLElement>("[data-quote-target]")].find(
    (element) => element.offsetParent !== null,
  );
  const box = target?.getBoundingClientRect();
  const path = flightPath(from, box ? { x: box.left + box.width / 2, y: box.top + box.height / 2, visible: true } : null);
  if (!path) return;
  const dot = document.createElement("span");
  dot.className = "quote-flight";
  dot.setAttribute("aria-hidden", "true");
  dot.style.left = `${from.x}px`;
  dot.style.top = `${from.y}px`;
  document.body.append(dot);
  dot
    .animate(
      [
        { transform: "translate(0, 0) scale(1)", opacity: 1 },
        { transform: `translate(${path.dx}px, ${path.dy}px) scale(0.4)`, opacity: 0.2 },
      ],
      { duration: 550, easing: "cubic-bezier(0.2, 0.7, 0.3, 1)" },
    )
    .finished.catch(() => {})
    .finally(() => dot.remove());
}

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
        const box = button.getBoundingClientRect();
        const from = { x: box.left + box.width / 2, y: box.top + box.height / 2 };
        announceQuoteAdded({ name: add.product.name, from });
        flyToQuoteTarget(from);
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

  return <QuoteToast />;
}
