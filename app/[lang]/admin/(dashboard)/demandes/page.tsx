import Link from "next/link";
import { Suspense } from "react";
import { AdminHeader, SetupNotice } from "@/components/admin/dashboard";
import { QuoteCard, STATUS_ORDER } from "@/components/admin/quote-card";
import { TableSkeleton } from "@/components/admin/skeletons";
import { Columns, Download, Headset, List, Search } from "@/components/icons";
import { buttonClasses } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { listAdminProducts, listQuoteRequests } from "@/lib/admin-data";
import { filterQuotes, type QuoteFilters } from "@/lib/admin/quote-filters";
import { requireAdmin } from "@/lib/auth";
import { cn } from "@/lib/cn";
import { getAdminDictionary } from "@/lib/i18n/server";

type Query = { vue?: string; statut?: string; source?: string; periode?: string; q?: string };

export default function DemandesPage({ searchParams }: { searchParams: Promise<Query> }) {
  return (
    <Suspense fallback={<TableSkeleton />}>
      {searchParams.then((query) => (
        <DemandesContent query={query} />
      ))}
    </Suspense>
  );
}

/** Filtres lus dans l'URL (partagés avec l'export CSV). */
function readQuoteFilters(query: Query): QuoteFilters {
  return {
    status: STATUS_ORDER.includes(query.statut as never) ? query.statut : undefined,
    source: query.source?.slice(0, 40) || undefined,
    period: query.periode === "7" || query.periode === "30" ? query.periode : undefined,
    q: query.q?.slice(0, 80) || undefined,
  };
}

async function DemandesContent({ query }: { query: Query }) {
  await requireAdmin();
  const [{ quotes, error }, { products }] = await Promise.all([listQuoteRequests(), listAdminProducts()]);
  const productNames = new Map(products.map((product) => [product.slug, product.name]));
  const t = await getAdminDictionary();
  const q = t.quotes;

  const kanban = query.vue === "kanban";
  const filters = readQuoteFilters(query);
  const visible = filterQuotes(quotes, kanban ? { ...filters, status: undefined } : filters);
  const sources = [...new Set(quotes.map((quote) => quote.source))].sort();
  const filtered = Boolean(filters.status || filters.source || filters.period || filters.q);

  const params = (extra: Record<string, string | undefined>) =>
    new URLSearchParams(
      Object.entries({
        statut: filters.status,
        source: filters.source,
        periode: filters.period,
        q: filters.q,
        ...extra,
      }).filter((entry): entry is [string, string] => Boolean(entry[1])),
    ).toString();

  return (
    <div className="space-y-4">
      <SetupNotice error={error} />
      <AdminHeader
        title={q.title}
        description={q.description(quotes.length, quotes.filter((quote) => quote.status === "new").length)}
      />

      <div className="flex flex-wrap items-center justify-between gap-2">
        <nav aria-label={q.display} className="inline-flex rounded-control border border-soil-300 bg-white p-1">
          <Link
            href={`/admin/demandes?${params({})}`}
            aria-current={!kanban ? "page" : undefined}
            className={cn(viewTab, !kanban && "bg-field-900 text-white")}
          >
            <List className="h-4 w-4" />
            {q.list}
          </Link>
          <Link
            href={`/admin/demandes?${params({ vue: "kanban" })}`}
            aria-current={kanban ? "page" : undefined}
            className={cn(viewTab, kanban && "bg-field-900 text-white")}
          >
            <Columns className="h-4 w-4" />
            {q.kanban}
          </Link>
        </nav>
        <a href={`/admin/demandes/export?${params({})}`} className={buttonClasses({ variant: "secondary", size: "sm" })}>
          <Download className="h-4 w-4" />
          {q.export}
        </a>
      </div>

      <form role="search" className="grid gap-3 rounded-card border border-soil-200 bg-white p-3 shadow-soft sm:grid-cols-[1fr_auto_auto_auto_auto] sm:items-end">
        {kanban ? <input type="hidden" name="vue" value="kanban" /> : null}
        <label className="grid gap-1 text-xs font-semibold text-soil-700">
          {t.common.search}
          <span className="flex min-h-11 items-center gap-2 rounded-control border border-soil-300 px-3 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-water-600">
            <Search className="h-4 w-4 text-soil-500" />
            <input name="q" defaultValue={filters.q} placeholder={q.searchPlaceholder} className="w-full bg-transparent text-sm font-normal focus:outline-none" />
          </span>
        </label>
        {!kanban ? (
          <FilterSelect name="statut" label={t.common.status} allLabel={t.common.all} value={filters.status} options={STATUS_ORDER.map((s) => ({ value: s, label: q.statuses[s] }))} />
        ) : null}
        <FilterSelect name="source" label={q.source} allLabel={t.common.all} value={filters.source} options={sources.map((s) => ({ value: s, label: q.sources[s] ?? s }))} />
        <FilterSelect name="periode" label={q.period} allLabel={t.common.all} value={filters.period} options={[{ value: "7", label: q.last7 }, { value: "30", label: q.last30 }]} />
        <div className="flex gap-2">
          <button type="submit" className={buttonClasses({ size: "sm" })}>
            {t.common.filter}
          </button>
          {filtered ? (
            <Link href={kanban ? "/admin/demandes?vue=kanban" : "/admin/demandes"} className={buttonClasses({ variant: "ghost", size: "sm" })}>
              {t.common.clear}
            </Link>
          ) : null}
        </div>
      </form>

      {quotes.length === 0 ? (
        <EmptyState
          icon={<Headset className="h-5 w-5" />}
          title={q.empty}
          description={q.emptyText}
          action={
            <Link href="/contact" target="_blank" className={buttonClasses({ variant: "secondary" })}>
              {q.publicForm}
            </Link>
          }
        />
      ) : visible.length === 0 ? (
        <EmptyState
          icon={<Search className="h-5 w-5" />}
          title={q.emptyFiltered}
          description={q.emptyFilteredText}
        />
      ) : kanban ? (
        <div className="grid gap-4 lg:grid-cols-4">
          {STATUS_ORDER.map((status) => {
            const column = visible.filter((quote) => quote.status === status);
            return (
              <section key={status} aria-labelledby={`col-${status}`} className="grid content-start gap-3 rounded-card bg-soil-100 p-3">
                <h2 id={`col-${status}`} className="flex items-center justify-between text-sm font-semibold text-soil-800">
                  {q.statuses[status]}
                  <span className="rounded-full bg-white px-2 text-xs tabular-nums text-soil-600">{column.length}</span>
                </h2>
                {column.length === 0 ? <p className="text-xs text-soil-500">{q.columnEmpty}</p> : null}
                {column.map((quote) => (
                  <QuoteCard key={quote.id} quote={quote} productNames={productNames} compact />
                ))}
              </section>
            );
          })}
        </div>
      ) : (
        <div className="grid gap-3">
          {visible.map((quote) => (
            <QuoteCard key={quote.id} quote={quote} productNames={productNames} />
          ))}
        </div>
      )}
    </div>
  );
}

const viewTab =
  "inline-flex min-h-11 items-center gap-1.5 rounded-[0.6rem] px-3 text-sm font-medium text-soil-700 transition-colors hover:bg-soil-100 sm:min-h-9";

function FilterSelect({
  name,
  label,
  allLabel,
  value,
  options,
}: {
  name: string;
  label: string;
  allLabel: string;
  value?: string;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="grid gap-1 text-xs font-semibold text-soil-700">
      {label}
      <select name={name} defaultValue={value ?? ""} className="min-h-11 rounded-control border border-soil-300 bg-white px-3 text-sm font-normal">
        <option value="">{allLabel}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
