import { listAdminProducts, listQuoteRequests } from "@/lib/admin-data";
import { toCsv } from "@/lib/admin/csv";
import { filterQuotes } from "@/lib/admin/quote-filters";
import { requireAdmin } from "@/lib/auth";
import { adminAr } from "@/lib/i18n/admin-ar";
import { adminFr } from "@/lib/i18n/admin-fr";


/** Export CSV des demandes de devis (mêmes filtres que la page), réservé aux administrateurs. */
export async function GET(request: Request, { params }: { params: Promise<{ lang: string }> }) {
  await requireAdmin();
  const t = (await params).lang === "ar" ? adminAr : adminFr;
  const q = t.quotes;

  const query = new URL(request.url).searchParams;
  const status = query.get("statut") ?? undefined;
  const period = query.get("periode") ?? undefined;
  const [{ quotes }, { products }] = await Promise.all([listQuoteRequests(5000), listAdminProducts()]);
  const names = new Map(products.map((product) => [product.slug, product.name]));

  const rows = filterQuotes(quotes, {
    status: status && Object.hasOwn(q.statuses, status) ? status : undefined,
    source: query.get("source")?.slice(0, 40) || undefined,
    period: period === "7" || period === "30" ? period : undefined,
    q: query.get("q")?.slice(0, 80) || undefined,
  }).map((quote) => [
    new Date(quote.createdAt).toLocaleString(t.dateLocale, { timeZone: "Africa/Casablanca" }),
    q.statuses[quote.status] ?? quote.status,
    quote.name,
    quote.phone,
    quote.email,
    quote.profile,
    quote.items?.length
      ? quote.items.map((item) => `${item.name} × ${item.quantity}`).join(" | ")
      : quote.productSlug
        ? `${names.get(quote.productSlug) ?? quote.productSlug}${quote.quantity ? ` × ${quote.quantity}` : ""}`
        : "",
    quote.message,
    q.sources[quote.source] ?? quote.source,
  ]);

  const csv = toCsv(q.csvHeaders, rows);
  const date = new Date().toISOString().slice(0, 10);
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${q.csvFile}-${date}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
