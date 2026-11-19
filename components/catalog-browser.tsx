"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import {
  ChevronDown,
  Headset,
  Search,
  WhatsApp,
  X,
} from "@/components/icons";
import { ProductCard } from "@/components/product-card";
import { QuickView } from "@/components/quick-view";
import { catalogFilters } from "@/lib/catalog-filters";
import {
  generalMessage,
  whatsappLink,
  type Category,
  type Product,
} from "@/lib/catalog";

const sortOptions = [
  { value: "featured", label: "Recommandés" },
  { value: "name", label: "Nom A → Z" },
  { value: "category", label: "Par gamme" },
];

export function CatalogBrowser({
  products,
  categories,
}: {
  products: Product[];
  categories: Category[];
}) {
  const filters = useSyncExternalStore(
    catalogFilters.subscribe,
    catalogFilters.getSnapshot,
    catalogFilters.getServerSnapshot,
  );
  const [sort, setSort] = useState("featured");
  const [selected, setSelected] = useState<Product | null>(null);

  const activeCategory =
    categories.find((category) => category.id === filters.category) ??
    categories[0];

  const counts = useMemo(() => {
    const map: Record<string, number> = { all: products.length };
    for (const product of products) {
      map[product.category] = (map[product.category] ?? 0) + 1;
    }
    return map;
  }, [products]);

  const filtered = useMemo(() => {
    const term = filters.query.trim().toLowerCase();
    const items = products.filter((product) => {
      const matchesCategory =
        filters.category === "all" || product.category === filters.category;
      const haystack = [
        product.name,
        product.description,
        product.categoryLabel,
        ...product.specs.map((spec) => `${spec.label} ${spec.value}`),
      ]
        .join(" ")
        .toLowerCase();
      return matchesCategory && (term.length === 0 || haystack.includes(term));
    });

    if (sort === "name") {
      return [...items].sort((a, b) => a.name.localeCompare(b.name, "fr"));
    }
    if (sort === "category") {
      return [...items].sort((a, b) =>
        a.categoryLabel.localeCompare(b.categoryLabel, "fr"),
      );
    }
    return [...items].sort(
      (a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)),
    );
  }, [filters, sort, products]);

  return (
    <div className="mx-auto grid max-w-7xl gap-8 px-4 pb-16 pt-8 lg:grid-cols-[280px_1fr] lg:pb-20">
      {/* Sidebar */}
      <aside className="hidden lg:block">
        <div className="sticky top-28 space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
              Filtrer par gamme
            </h2>
            <div className="mt-3 grid gap-1">
              {categories.map((category) => {
                const active = filters.category === category.id;
                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => catalogFilters.setCategory(category.id)}
                    aria-pressed={active}
                    className={`flex items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition ${
                      active
                        ? "bg-[#0A2540] text-white"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <span>{category.label}</span>
                    <span
                      className={`rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${
                        active ? "bg-white/15 text-white" : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {counts[category.id] ?? 0}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-[#0A2540] to-[#0E7490] p-5 text-white">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
              <Headset className="h-5 w-5 text-cyan-300" />
            </span>
            <p className="mt-3 text-sm font-semibold">
              Un doute sur le dimensionnement ?
            </p>
            <p className="mt-1 text-xs leading-relaxed text-white/65">
              Débit, hauteur manométrique, diamètre de raccord : un technicien
              vous répond directement.
            </p>
            <a
              href={whatsappLink(generalMessage())}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-2 text-xs font-semibold text-[#0A2540] transition hover:bg-cyan-50"
            >
              <WhatsApp className="h-3.5 w-3.5 text-[#1FA855]" />
              Parler à un technicien
            </a>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <label className="flex flex-1 items-center gap-2 rounded-xl border border-slate-300/80 bg-white px-3.5 py-2.5">
            <Search className="h-4 w-4 text-slate-400" />
            <span className="sr-only">Rechercher un produit</span>
            <input
              value={filters.query}
              onChange={(event) => catalogFilters.setQuery(event.target.value)}
              placeholder='Rechercher : pompe 4", raccord PE, PVC…'
              className="w-full bg-transparent text-sm text-[#0A2540] placeholder:text-slate-400 focus:outline-none"
            />
            {filters.query ? (
              <button
                type="button"
                onClick={() => catalogFilters.setQuery("")}
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                aria-label="Effacer la recherche"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            ) : null}
          </label>

          <div className="relative">
            <label htmlFor="sort" className="sr-only">
              Trier les produits
            </label>
            <select
              id="sort"
              value={sort}
              onChange={(event) => setSort(event.target.value)}
              className="w-full appearance-none rounded-xl border border-slate-300/80 bg-white py-2.5 pl-3.5 pr-9 text-sm font-medium text-[#0A2540] focus:outline-none sm:w-44"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          </div>
        </div>

        {/* Mobile category pills */}
        <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1 lg:hidden">
          {categories.map((category) => {
            const active = filters.category === category.id;
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => catalogFilters.setCategory(category.id)}
                aria-pressed={active}
                className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-medium transition ${
                  active
                    ? "border-[#0A2540] bg-[#0A2540] text-white"
                    : "border-slate-300/80 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                {category.short}
                <span
                  className={`text-[10px] font-semibold ${
                    active ? "text-white/60" : "text-slate-400"
                  }`}
                >
                  {counts[category.id] ?? 0}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-5 flex items-baseline justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-[#0A2540]">
              {activeCategory.label}
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              {activeCategory.description}
            </p>
          </div>
          <p className="shrink-0 text-xs text-slate-500">
            {filtered.length} référence{filtered.length > 1 ? "s" : ""}
          </p>
        </div>

        {filtered.length > 0 ? (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((product) => (
              <ProductCard
                key={product.slug}
                product={product}
                onDetails={setSelected}
              />
            ))}
          </div>
        ) : (
          <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <p className="text-sm font-semibold text-[#0A2540]">
              Aucune référence ne correspond à votre recherche.
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Essayez un autre terme ou affichez toutes les gammes.
            </p>
            <button
              type="button"
              onClick={() => catalogFilters.reset()}
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#0A2540] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0F3557]"
            >
              Réinitialiser les filtres
            </button>
          </div>
        )}

        <div className="mt-8 flex flex-col items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-center sm:flex-row sm:text-left">
          <p className="text-sm text-slate-600">
            Un produit absent du catalogue ? Nous pouvons le commander pour
            vous.
          </p>
          <a
            href={whatsappLink(
              "Bonjour AgriFlow 👋, je recherche un produit spécifique qui n'est pas dans le catalogue. Pouvez-vous m'aider ?",
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[#1FA855] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#178f47]"
          >
            <WhatsApp className="h-4 w-4" />
            Demander un produit
          </a>
        </div>
      </div>

      {selected ? (
        <QuickView
          key={selected.slug}
          product={selected}
          onClose={() => setSelected(null)}
        />
      ) : null}
    </div>
  );
}
