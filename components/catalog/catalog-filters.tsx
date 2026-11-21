import Link from "next/link";
import { Search } from "@/components/icons";
import { catalogHref, type CatalogQuery, type CatalogSort } from "@/lib/catalog-query";
import { cn } from "@/lib/cn";
import { getDictionary } from "@/lib/i18n/server";

const SORTS: CatalogSort[] = ["featured", "name", "category"];

const control =
  "min-h-11 w-full rounded-xl border border-soil-300 bg-white px-3.5 text-sm text-soil-900 focus:border-water-500";

/** Chips de gammes défilables : de simples liens, sans JavaScript. */
export async function CategoryChips({
  query,
  categories,
}: {
  query: CatalogQuery;
  categories: { id: string; label: string; count: number }[];
}) {
  const t = await getDictionary();
  const chip = (active: boolean) =>
    cn(
      "inline-flex min-h-11 shrink-0 snap-start items-center gap-1.5 rounded-full border px-4 text-sm font-semibold transition",
      active
        ? "border-field-900 bg-field-900 text-white"
        : "border-soil-300 bg-white text-soil-800 hover:border-water-300",
    );

  return (
    <nav aria-label={t.catalogPage.ranges} className="-mx-4 flex snap-x gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
      <Link href={catalogHref({ ...query, gamme: null })} className={chip(!query.gamme)} aria-current={!query.gamme ? "page" : undefined}>
        {t.catalogPage.all}
      </Link>
      {categories.map((category) => (
        <Link
          key={category.id}
          href={catalogHref({ ...query, gamme: category.id })}
          className={chip(query.gamme === category.id)}
          aria-current={query.gamme === category.id ? "page" : undefined}
        >
          <bdi>{category.label}</bdi>
          <span className="text-xs font-medium opacity-70">{category.count}</span>
        </Link>
      ))}
    </nav>
  );
}

/** Formulaire GET : recherche, disponibilité et tri. Fonctionne sans JavaScript. */
export async function FilterForm({
  query,
  stocks,
  layout,
}: {
  query: CatalogQuery;
  stocks: { value: string; label: string; count: number }[];
  layout: "bar" | "sheet";
}) {
  const t = await getDictionary();
  return (
    <form
      action="/produits"
      method="get"
      role="search"
      className={cn("grid gap-3", layout === "bar" && "md:grid-cols-[1fr_200px_200px_auto] md:items-end")}
    >
      {query.gamme ? <input type="hidden" name="gamme" value={query.gamme} /> : null}
      <label className="grid gap-1.5 text-xs font-semibold text-soil-600">
        {t.catalogPage.search}
        <span className="relative">
          <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-soil-500" />
          <input
            name="q"
            type="search"
            defaultValue={query.q}
            maxLength={80}
            placeholder={t.searchPlaceholder}
            className={cn(control, "ps-9")}
          />
        </span>
      </label>
      <label className="grid gap-1.5 text-xs font-semibold text-soil-600">
        {t.catalogPage.availability}
        <select name="dispo" defaultValue={query.dispo ?? ""} className={control}>
          <option value="">{t.catalogPage.allAvailability}</option>
          {stocks.map((stock) => (
            <option key={stock.value} value={stock.value}>
              {Object.hasOwn(t.stock, stock.value) ? t.stock[stock.value] : stock.label} ({stock.count})
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-1.5 text-xs font-semibold text-soil-600">
        {t.catalogPage.sortBy}
        <select name="tri" defaultValue={query.tri} className={control}>
          {SORTS.map((sort) => (
            <option key={sort} value={sort}>
              {t.catalogPage.sorts[sort]}
            </option>
          ))}
        </select>
      </label>
      <button
        type="submit"
        className="min-h-11 rounded-xl bg-field-900 px-5 text-sm font-semibold text-white transition hover:bg-field-800"
      >
        {t.catalogPage.apply}
      </button>
    </form>
  );
}
