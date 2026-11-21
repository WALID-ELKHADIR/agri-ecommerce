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

export type QuoteAddedDetail = { name: string; from: { x: number; y: number } | null };

/** Signale un ajout : le compteur rebondit, la pastille vole, le toast s'affiche. */
export function announceQuoteAdded(detail: QuoteAddedDetail = { name: "", from: null }): void {
  window.dispatchEvent(new CustomEvent<QuoteAddedDetail>(ADDED_EVENT, { detail }));
}

export function onQuoteAdded(listener: (detail: QuoteAddedDetail) => void): () => void {
  const handler = (event: Event) => listener((event as CustomEvent<QuoteAddedDetail>).detail ?? { name: "", from: null });
  window.addEventListener(ADDED_EVENT, handler);
  return () => window.removeEventListener(ADDED_EVENT, handler);
}
