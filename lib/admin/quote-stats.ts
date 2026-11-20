/** Indicateurs du tableau de bord à partir des demandes de devis (module pur). */

export type StatsQuote = {
  createdAt: string;
  status: string;
  source: string;
  productSlug: string | null;
  items: { slug: string; name: string; quantity: number }[] | null;
};

export type QuoteStats = {
  last7: number;
  last30: number;
  /** Demandes gagnées / (gagnées + perdues) sur 30 jours ; null si aucune n'est conclue. */
  winRate: number | null;
  /** Produits les plus demandés sur 30 jours (nombre de demandes qui les citent). */
  topProducts: { slug: string; count: number }[];
  /** Origine des demandes sur 30 jours. */
  sources: { source: string; count: number }[];
  /** Demandes par jour, des 14 derniers jours (dernier = aujourd'hui, UTC). */
  daily: { date: string; count: number }[];
};

const DAY = 86_400_000;

function dayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function ranked(counts: Map<string, number>): [string, number][] {
  // Tri stable : à égalité, l'ordre de première apparition est conservé.
  return [...counts.entries()].sort((a, b) => b[1] - a[1]);
}

export function computeQuoteStats(quotes: StatsQuote[], now: Date = new Date()): QuoteStats {
  const time = now.getTime();
  const recent = quotes
    .map((quote) => ({ quote, age: time - new Date(quote.createdAt).getTime() }))
    .filter(({ age }) => age >= 0);
  const last30 = recent.filter(({ age }) => age < 30 * DAY).map(({ quote }) => quote);

  const won = last30.filter((quote) => quote.status === "won").length;
  const lost = last30.filter((quote) => quote.status === "lost").length;

  const products = new Map<string, number>();
  const sources = new Map<string, number>();
  for (const quote of last30) {
    const slugs = new Set([quote.productSlug, ...(quote.items ?? []).map((item) => item.slug)].filter(Boolean) as string[]);
    for (const slug of slugs) products.set(slug, (products.get(slug) ?? 0) + 1);
    sources.set(quote.source, (sources.get(quote.source) ?? 0) + 1);
  }

  const perDay = new Map<string, number>();
  for (const quote of quotes) {
    const key = dayKey(new Date(quote.createdAt));
    perDay.set(key, (perDay.get(key) ?? 0) + 1);
  }
  const daily = Array.from({ length: 14 }, (_, index) => {
    const date = dayKey(new Date(time - (13 - index) * DAY));
    return { date, count: perDay.get(date) ?? 0 };
  });

  return {
    last7: recent.filter(({ age }) => age < 7 * DAY).length,
    last30: last30.length,
    winRate: won + lost > 0 ? won / (won + lost) : null,
    topProducts: ranked(products).slice(0, 5).map(([slug, count]) => ({ slug, count })),
    sources: ranked(sources).map(([source, count]) => ({ source, count })),
    daily,
  };
}
