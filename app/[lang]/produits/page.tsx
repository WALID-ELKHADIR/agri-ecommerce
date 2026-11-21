import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { CategoryChips, FilterForm } from "@/components/catalog/catalog-filters";
import { FiltersSheet } from "@/components/catalog/filters-sheet";
import { Clock, Headset, Search, Truck } from "@/components/icons";
import { CARD_SIZES, ProductCard } from "@/components/product-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { MobileCta } from "@/components/mobile-cta";
import { SiteFooterWithSettings } from "@/components/site-footer-server";
import { SiteHeader } from "@/components/site-header";
import { getCatalog } from "@/lib/catalog-data";
import { JsonLd } from "@/components/json-ld";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site-config";
import { getDictionary, getLocale } from "@/lib/i18n/server";
import { catalogHref, parseCatalogQuery, queryCatalog, stockOptions } from "@/lib/catalog-query";

type SearchParams = Record<string, string | string[] | undefined>;

/**
 * Métadonnées statiques (dans <head>, lisibles par tous les robots) : toutes
 * les vues filtrées pointent vers /produits (canonique). Les recherches (?q=)
 * sont exclues de l'exploration dans app/robots.ts.
 */
export async function generateMetadata(): Promise<Metadata> {
  const t = await getDictionary();
  return pageMetadata({
    title: t.catalogPage.metaTitle,
    description: t.catalogPage.metaDescription,
    path: "/produits",
    siteUrl: siteConfig.siteUrl,
    ogLocale: t.meta.ogLocale,
  });
}

const TRUST_ICONS = [Truck, Headset, Clock];

export default async function ProduitsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const { products } = await getCatalog(await getLocale());
  const t = await getDictionary();
  const page = t.catalogPage;

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd(
          [
            { name: t.navHome, path: "/" },
            { name: t.navProducts, path: "/produits" },
          ],
          siteConfig.siteUrl,
        )}
      />
      <SiteHeader />

      <main className="pb-24 md:pb-0">
        <section className="relative overflow-hidden bg-field-900">
          <div className="blueprint-grid pointer-events-none absolute inset-0 opacity-70" />
          <div className="pointer-events-none absolute -end-20 -top-20 h-72 w-72 rounded-full bg-water-500/20 blur-3xl" />

          <div className="relative mx-auto max-w-7xl px-4 pb-10 pt-8 sm:pb-12 sm:pt-10">
            <nav aria-label={t.ui.breadcrumb} className="text-xs text-soil-300">
              <Link href="/" className="relative after:absolute after:-inset-x-2 after:-inset-y-4 after:content-[''] transition hover:text-water-300">
                {t.navHome}
              </Link>
              <span aria-hidden="true" className="mx-2 text-soil-400">/</span>
              <span className="text-soil-200">{t.navProducts}</span>
            </nav>

            <div className="mt-4 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
              <div className="max-w-2xl">
                <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                  {page.title}
                </h1>
                <p className="mt-2 text-sm leading-relaxed text-soil-300/80 sm:text-base">
                  {page.intro}
                </p>
              </div>

              <div className="flex flex-wrap gap-2 text-[11px] font-medium">
                <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-water-200">
                  {page.references(products.length)}
                </span>
                <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-soil-200">
                  {page.badgeQuote}
                </span>
                <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-soil-200">
                  {page.badgeAdvice}
                </span>
              </div>
            </div>
          </div>
        </section>

        <Suspense fallback={<CatalogSkeleton />}>
          {searchParams.then((params) => (
            <CatalogResults params={params} />
          ))}
        </Suspense>

        <section className="border-t border-soil-200 bg-white">
          <div className="mx-auto grid max-w-7xl gap-4 px-4 py-10 sm:grid-cols-3">
            {page.trust.map((item, index) => {
              const Icon = TRUST_ICONS[index];
              return (
                <div key={item.title} className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-water-50 text-water-700">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-soil-900">
                      {item.title}
                    </p>
                    <p className="text-xs text-soil-500">{item.text}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      <SiteFooterWithSettings />
      <MobileCta />
    </>
  );
}

async function CatalogResults({ params }: { params: SearchParams }) {
  const { products, categories } = await getCatalog(await getLocale());
  const t = await getDictionary();
  const stocks = stockOptions(products);
  const ranges = categories
    .filter((category) => category.id !== "all")
    .map((category) => ({
      id: category.id,
      label: category.label,
      count: products.filter((product) => product.category === category.id).length,
    }))
    .filter((category) => category.count > 0);
  const query = parseCatalogQuery(params, {
    categories: ranges.map((category) => category.id),
    stocks: stocks.map((stock) => stock.value),
  });
  const visible = queryCatalog(products, query);
  const active = Number(Boolean(query.q)) + Number(Boolean(query.dispo)) + Number(query.tri !== "featured");

  return (
    <section className="mx-auto max-w-7xl px-4 py-6 sm:py-8" aria-label={t.catalogPage.results}>
      <div className="flex items-center gap-2">
        <div className="min-w-0 flex-1">
          <CategoryChips query={query} categories={ranges} />
        </div>
        <FiltersSheet active={active}>
          <FilterForm query={query} stocks={stocks} layout="sheet" />
        </FiltersSheet>
      </div>

      <div className="mt-4 hidden rounded-2xl border border-soil-200 bg-white p-4 md:block">
        <FilterForm query={query} stocks={stocks} layout="bar" />
      </div>

      <p className="mt-5 text-sm text-soil-600" aria-live="polite">
        {query.q ? t.catalogPage.countFor(visible.length, query.q) : t.catalogPage.count(visible.length)}
      </p>

      {visible.length > 0 ? (
        <div className="mt-3 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
          {visible.map((product, index) => (
            <ProductCard
              key={product.slug}
              product={product}
              sizes={CARD_SIZES.grid}
              priority={index < 2}
              reveal={index >= 4 ? index % 4 : undefined}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          className="mt-6"
          icon={<Search className="h-6 w-6" />}
          title={t.catalogPage.emptyTitle}
          description={t.catalogPage.emptyText}
          action={
            <Link
              href={catalogHref({})}
              className="inline-flex min-h-11 items-center rounded-full bg-field-900 px-5 text-sm font-semibold text-white"
            >
              {t.catalogPage.clearFilters}
            </Link>
          }
        />
      )}
    </section>
  );
}

function CatalogSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:py-8" aria-busy="true">
      <div className="flex gap-2 overflow-hidden">
        {Array.from({ length: 5 }, (_, i) => (
          <Skeleton key={i} className="h-11 w-28 shrink-0 rounded-full" />
        ))}
      </div>
      <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }, (_, i) => (
          <Skeleton key={i} className="aspect-[3/4] w-full rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
