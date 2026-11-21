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
import { catalogHref, parseCatalogQuery, queryCatalog, stockOptions } from "@/lib/catalog-query";

type SearchParams = Record<string, string | string[] | undefined>;

export const metadata: Metadata = {
  title: "Catalogue — Pompes, raccords et kits d'irrigation | Saqia",
  description:
    "Découvrez notre catalogue de pompes centrifuges et immergées, raccords PE/PVC et kits de pompage. Devis technique sous 24h.",
};

const trust = [
  {
    icon: Truck,
    title: "Livraison nationale",
    text: "Expédition partout au Maroc",
  },
  {
    icon: Headset,
    title: "Conseil technique",
    text: "Aide au choix de votre matériel",
  },
  {
    icon: Clock,
    title: "Devis sous 24h",
    text: "Prix et disponibilité sur WhatsApp",
  },
];

export default async function ProduitsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const { products } = await getCatalog();

  return (
    <>
      <SiteHeader />

      <main className="pb-24 md:pb-0">
        <section className="relative overflow-hidden bg-field-900">
          <div className="blueprint-grid pointer-events-none absolute inset-0 opacity-70" />
          <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-water-500/20 blur-3xl" />

          <div className="relative mx-auto max-w-7xl px-4 pb-10 pt-8 sm:pb-12 sm:pt-10">
            <nav aria-label="Fil d'Ariane" className="text-xs text-soil-300">
              <Link href="/" className="relative after:absolute after:-inset-x-2 after:-inset-y-4 after:content-[''] transition hover:text-water-300">
                Accueil
              </Link>
              <span aria-hidden="true" className="mx-2 text-soil-400">/</span>
              <span className="text-soil-200">Produits</span>
            </nav>

            <div className="mt-4 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
              <div className="max-w-2xl">
                <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                  Catalogue irrigation &amp; pompage
                </h1>
                <p className="mt-2 text-sm leading-relaxed text-soil-300/80 sm:text-base">
                  Pompes, raccords et kits complets. Filtrez par gamme, comparez
                  les caractéristiques et demandez un devis en un clic.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 text-[11px] font-medium">
                <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-water-200">
                  {products.length} références
                </span>
                <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-soil-200">
                  Devis sous 24h
                </span>
                <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-soil-200">
                  Conseil technique
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
            {trust.map((item) => {
              const Icon = item.icon;
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
  const { products, categories } = await getCatalog();
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
    <section className="mx-auto max-w-7xl px-4 py-6 sm:py-8" aria-label="Résultats du catalogue">
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
        {visible.length} produit{visible.length > 1 ? "s" : ""}
        {query.q ? <> pour « {query.q} »</> : null}
      </p>

      {visible.length > 0 ? (
        <div className="mt-3 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
          {visible.map((product, index) => (
            <ProductCard key={product.slug} product={product} sizes={CARD_SIZES.grid} priority={index < 2} />
          ))}
        </div>
      ) : (
        <EmptyState
          className="mt-6"
          icon={<Search className="h-6 w-6" />}
          title="Aucun produit ne correspond"
          description="Essayez un autre mot ou retirez des filtres. Vous pouvez aussi nous décrire votre besoin sur WhatsApp."
          action={
            <Link
              href={catalogHref({})}
              className="inline-flex min-h-11 items-center rounded-full bg-field-900 px-5 text-sm font-semibold text-white"
            >
              Effacer les filtres
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
