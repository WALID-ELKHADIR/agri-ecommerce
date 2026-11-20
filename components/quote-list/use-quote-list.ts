"use client";

import { useEffect, useSyncExternalStore } from "react";
import { quoteList, type QuoteLine } from "@/lib/quote-list-store";

const OPEN_EVENT = "saqia:open-devis";
const ADDED_EVENT = "saqia:ajout-devis";

/** Lignes de la liste de devis, synchronisées entre composants et onglets. */
export function useQuoteList(): { lines: QuoteLine[]; count: number } {
  const lines = useSyncExternalStore(quoteList.subscribe, quoteList.getSnapshot, quoteList.getServerSnapshot);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === null || event.key === "saqia:devis:v1") quoteList.syncFromStorage();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return { lines, count: lines.reduce((total, line) => total + line.quantity, 0) };
}

/** Ouvre le tiroir de la liste de devis (écouté par le header). */
export function openQuoteDrawer(): void {
  window.dispatchEvent(new Event(OPEN_EVENT));
}

export function onOpenQuoteDrawer(listener: () => void): () => void {
  window.addEventListener(OPEN_EVENT, listener);
  return () => window.removeEventListener(OPEN_EVENT, listener);
}

/** Signale un ajout (le compteur du header rebondit). */
export function announceQuoteAdded(): void {
  window.dispatchEvent(new Event(ADDED_EVENT));
}

export function onQuoteAdded(listener: () => void): () => void {
  window.addEventListener(ADDED_EVENT, listener);
  return () => window.removeEventListener(ADDED_EVENT, listener);
}
