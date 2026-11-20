/** Filtres des demandes de devis, partagés par la page et l'export CSV (module pur). */
import { slugify } from "../slugify.ts";

export type QuoteFilters = {
  status?: string;
  source?: string;
  /** « 7 », « 30 » (jours) ou vide pour tout l'historique. */
  period?: string;
  q?: string;
};

type FilterableQuote = {
  name: string | null;
  phone: string | null;
  email: string | null;
  message: string | null;
  productSlug: string | null;
  items: { slug: string; name: string }[] | null;
  status: string;
  source: string;
  createdAt: string;
};

const DAY = 86_400_000;

export function filterQuotes<T extends FilterableQuote>(quotes: T[], filters: QuoteFilters, now: Date = new Date()): T[] {
  const days = filters.period === "7" || filters.period === "30" ? Number(filters.period) : null;
  const words = slugify(filters.q ?? "").split("-").filter(Boolean);
  const digits = (filters.q ?? "").replace(/\D/g, "");

  return quotes.filter((quote) => {
    if (filters.status && quote.status !== filters.status) return false;
    if (filters.source && quote.source !== filters.source) return false;
    if (days !== null && now.getTime() - new Date(quote.createdAt).getTime() > days * DAY) return false;
    if (words.length || digits.length >= 3) {
      const text = slugify(
        [quote.name, quote.email, quote.message, quote.productSlug, ...(quote.items ?? []).flatMap((i) => [i.name, i.slug])]
          .filter(Boolean)
          .join(" "),
      );
      const phone = (quote.phone ?? "").replace(/\D/g, "");
      const byText = words.length > 0 && words.every((word) => text.includes(word));
      const byPhone = digits.length >= 3 && phone.includes(digits);
      if (!byText && !byPhone) return false;
    }
    return true;
  });
}
