import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, Database, Plus } from "@/components/icons";
import { DailyBars, RankBars } from "@/components/admin/dashboard-charts";
import { computeQuoteStats } from "@/lib/admin/quote-stats";
import { requireAdmin } from "@/lib/auth";
import { getAdminStats, listAdminProducts, listQuoteRequests } from "@/lib/admin-data";
import { isSupabaseConfigured } from "@/lib/supabase/public";
import { getAdminDictionary } from "@/lib/i18n/server";

export async function SetupNotice({ error }: { error?: string | null }) {
  if (isSupabaseConfigured() && !error) {
    return null;
  }
  const t = (await getAdminDictionary()).setup;

  return (
    <div className="rounded-2xl border border-harvest-200 bg-harvest-50 p-4 text-sm text-harvest-900">
      <p className="flex items-center gap-2 font-semibold">
        <Database className="h-4 w-4" />
        {t.title}
      </p>
      <ol className="mt-2 list-decimal space-y-1 ps-5 text-xs leading-relaxed">
        <li>
          {t.step1Before}<strong>SQL Editor</strong>.
        </li>
        <li>
          {t.step2Before}
          <code className="rounded bg-harvest-100 px-1">supabase/migrations/</code>{t.step2After}
        </li>
        <li>
          {t.step3Before}<strong dir="ltr">Authentication → Users</strong>{t.step3Middle}
          <code className="rounded bg-harvest-100 px-1">admin_users</code>.
        </li>
      </ol>
      {error ? (
        <p className="mt-2 text-[11px] text-harvest-800">{t.detail(error)}</p>
      ) : null}
    </div>
  );
}

export function AdminHeader({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: { href: string; label: string };
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-soil-900">
          {title}
        </h1>
        <p className="mt-1 text-sm text-soil-500">{description}</p>
      </div>

      {action ? (
        <Link
          href={action.href}
          className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-field-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-field-800"
        >
          <Plus className="h-4 w-4" />
          {action.label}
        </Link>
      ) : null}
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  href,
}: {
  label: string;
  value: number | string;
  hint: string;
  href?: string;
}) {
  const content = (
    <>
      <p className="text-sm font-medium text-soil-600">{label}</p>
      <p className="mt-1 font-display text-h2 font-bold tabular-nums text-soil-900">{value}</p>
      <p className="mt-1 text-xs text-soil-500">{hint}</p>
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="group rounded-card border border-soil-200 bg-white p-5 shadow-soft transition hover:border-field-300 hover:shadow-lifted"
      >
        {content}
      </Link>
    );
  }
  return <div className="rounded-card border border-soil-200 bg-white p-5 shadow-soft">{content}</div>;
}

function Panel({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="rounded-card border border-soil-200 bg-white p-5 shadow-soft">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="font-semibold text-soil-900">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}


export async function DashboardContent() {
  await requireAdmin();
  const t = await getAdminDictionary();
  const d = t.dashboard;
  const percent = new Intl.NumberFormat(t.dateLocale, { style: "percent", maximumFractionDigits: 0 });
  const dateTime = new Intl.DateTimeFormat(t.dateLocale, { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Africa/Casablanca" });

  const [stats, { quotes, error }, { products }] = await Promise.all([
    getAdminStats(),
    listQuoteRequests(),
    listAdminProducts(),
  ]);
  const kpis = computeQuoteStats(quotes);
  const names = new Map(products.map((product) => [product.slug, product.name]));
  const toComplete = products.filter((product) => product.specs.length === 0).length;

  return (
    <div className="space-y-5">
      <SetupNotice error={error} />

      <AdminHeader
        title={d.title}
        description={d.description}
        action={{ href: "/admin/produits/nouveau", label: d.newProduct }}
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label={d.pending} value={stats.pending} hint={d.pendingHint} href="/admin/demandes?statut=new" />
        <StatCard label={d.last7} value={kpis.last7} hint={d.last30Hint(kpis.last30)} href="/admin/demandes?periode=7" />
        <StatCard
          label={d.winRate}
          value={kpis.winRate === null ? "—" : percent.format(kpis.winRate)}
          hint={d.winRateHint}
        />
        <StatCard
          label={d.online}
          value={`${stats.published} / ${stats.products}`}
          hint={toComplete > 0 ? d.toComplete(toComplete) : d.allComplete}
          href="/admin/produits"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title={d.daily}>
          <DailyBars data={kpis.daily} labels={{ chart: d.chartLabel, start: d.daysAgo, end: d.today, locale: t.dateLocale }} />
        </Panel>
        <Panel title={d.topProducts}>
          <RankBars
            data={kpis.topProducts.map((item) => ({ label: names.get(item.slug) ?? item.slug, count: item.count }))}
            empty={d.noTopProduct}
          />
        </Panel>
        <Panel title={d.sources}>
          <RankBars data={kpis.sources.map((item) => ({ label: t.quotes.sources[item.source] ?? item.source, count: item.count }))} empty={d.noSource} />
        </Panel>
      </div>

      <Panel
        title={d.latest}
        action={
          <Link href="/admin/demandes" className="inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-water-700 hover:text-water-800 sm:min-h-0">
            {d.seeAll}
            <ArrowRight className="h-4 w-4 rtl:rotate-180" />
          </Link>
        }
      >
        {quotes.length === 0 ? (
          <p className="py-6 text-center text-sm text-soil-500">{d.noQuote}</p>
        ) : (
          <ul className="-mx-5 divide-y divide-soil-100">
            {quotes.slice(0, 5).map((quote) => (
              <li key={quote.id} className="flex flex-col gap-1 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-soil-900">{quote.name || quote.phone || quote.email || t.common.visitor}</p>
                  <p className="truncate text-xs text-soil-500">
                    {quote.items?.length
                      ? quote.items.map((item) => item.name).join(", ")
                      : quote.productSlug
                        ? (names.get(quote.productSlug) ?? quote.productSlug)
                        : (t.quotes.sources[quote.source] ?? quote.source)}
                  </p>
                </div>
                <span className="shrink-0 text-xs text-soil-500">{dateTime.format(new Date(quote.createdAt))}</span>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
