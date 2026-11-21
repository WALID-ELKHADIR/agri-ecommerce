import Link from "next/link";
import { Suspense, type ReactNode } from "react";
import { AdminHeader, SetupNotice } from "@/components/admin/dashboard";
import { TableSkeleton } from "@/components/admin/skeletons";
import { Copy, Eye, EyeOff, ImageIcon, Layers, Search, Star } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { listAdminCategories, listAdminProducts } from "@/lib/admin-data";
import { filterProducts, type ProductSort, type ProductStatus } from "@/lib/admin/product-filters";
import { duplicateProductAction, toggleFeaturedAction, togglePublishedAction } from "@/lib/actions/products";
import { requireAdmin } from "@/lib/auth";
import { cn } from "@/lib/cn";

type Query = { q?: string; gamme?: string; statut?: string; tri?: string };

const SORTS: { value: ProductSort; label: string }[] = [
  { value: "position", label: "Ordre du catalogue" },
  { value: "name", label: "Nom (A → Z)" },
  { value: "recent", label: "Plus récents" },
  { value: "featured", label: "Mis en avant d'abord" },
];

const STATUSES: { value: ProductStatus; label: string }[] = [
  { value: "all", label: "Tous" },
  { value: "published", label: "Publiés" },
  { value: "draft", label: "Masqués" },
];

export default function AdminProduitsPage({ searchParams }: { searchParams: Promise<Query> }) {
  return (
    <Suspense fallback={<TableSkeleton />}>
      {searchParams.then((query) => (
        <ProduitsContent query={query} />
      ))}
    </Suspense>
  );
}

function asStatus(value: string | undefined): ProductStatus {
  return value === "published" || value === "draft" ? value : "all";
}

function asSort(value: string | undefined): ProductSort {
  return SORTS.some((sort) => sort.value === value) ? (value as ProductSort) : "position";
}

async function ProduitsContent({ query }: { query: Query }) {
  await requireAdmin();
  const [{ products, error }, categories] = await Promise.all([listAdminProducts(), listAdminCategories()]);

  const status = asStatus(query.statut);
  const sort = asSort(query.tri);
  const q = (query.q ?? "").slice(0, 80);
  const category = categories.some((c) => c.id === query.gamme) ? query.gamme : undefined;
  const visible = filterProducts(products, { q, category, status, sort });
  const labels = new Map(categories.map((c) => [c.id, c.label]));
  const filtered = Boolean(q || category || status !== "all");

  // Adresse actuelle, pour revenir au même filtrage après une action rapide.
  const back = `/admin/produits?${new URLSearchParams(
    Object.entries({ q, gamme: category ?? "", statut: status === "all" ? "" : status, tri: sort === "position" ? "" : sort })
      .filter(([, value]) => value) as [string, string][],
  ).toString()}`;

  return (
    <div className="space-y-4">
      <SetupNotice error={error} />
      <AdminHeader
        title="Produits"
        description={`${products.length} référence${products.length > 1 ? "s" : ""} · ${products.filter((p) => p.published).length} publiée${products.filter((p) => p.published).length > 1 ? "s" : ""}`}
        action={{ href: "/admin/produits/nouveau", label: "Nouveau produit" }}
      />

      <form
        role="search"
        className="grid gap-3 rounded-card border border-soil-200 bg-white p-3 shadow-soft sm:grid-cols-[1fr_auto_auto_auto_auto] sm:items-end"
      >
        <label className="grid gap-1 text-xs font-semibold text-soil-700">
          Rechercher
          <span className="flex min-h-11 items-center gap-2 rounded-control border border-soil-300 px-3 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-water-600">
            <Search className="h-4 w-4 text-soil-500" />
            <input name="q" defaultValue={q} placeholder="Nom ou slug" className="w-full bg-transparent text-sm font-normal focus:outline-none" />
          </span>
        </label>
        <Select name="gamme" label="Catégorie" value={category ?? ""} options={[{ value: "", label: "Toutes" }, ...categories.map((c) => ({ value: c.id, label: c.label }))]} />
        <Select name="statut" label="Statut" value={status === "all" ? "" : status} options={STATUSES.map((s) => ({ value: s.value === "all" ? "" : s.value, label: s.label }))} />
        <Select name="tri" label="Trier par" value={sort === "position" ? "" : sort} options={SORTS.map((s) => ({ value: s.value === "position" ? "" : s.value, label: s.label }))} />
        <div className="flex gap-2">
          <button type="submit" className={buttonClasses({ size: "sm" })}>
            Filtrer
          </button>
          {filtered ? (
            <Link href="/admin/produits" className={buttonClasses({ variant: "ghost", size: "sm" })}>
              Effacer
            </Link>
          ) : null}
        </div>
      </form>

      {visible.length === 0 ? (
        <EmptyState
          icon={<Layers className="h-5 w-5" />}
          title={filtered ? "Aucun produit ne correspond" : "Aucun produit"}
          description={filtered ? "Modifiez la recherche ou retirez un filtre." : "Ajoutez votre premier produit au catalogue."}
          action={
            filtered ? (
              <Link href="/admin/produits" className={buttonClasses({ variant: "secondary" })}>
                Effacer les filtres
              </Link>
            ) : (
              <Link href="/admin/produits/nouveau" className={buttonClasses()}>
                Ajouter un produit
              </Link>
            )
          }
        />
      ) : (
        <ul className="grid gap-2" aria-label={`${visible.length} produit(s)`}>
          {visible.map((product) => (
            <li
              key={product.id}
              className="flex flex-wrap items-center gap-3 rounded-card border border-soil-200 bg-white p-3 shadow-soft sm:flex-nowrap"
            >
              <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-control bg-soil-50">
                {product.image ? (
                  // eslint-disable-next-line @next/next/no-img-element -- vignette admin (locale ou Storage)
                  <img src={product.image} alt="" loading="lazy" className="h-full w-full object-cover" />
                ) : (
                  <ImageIcon className="h-5 w-5 text-soil-400" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <Link href={`/admin/produits/${product.id}`} className="font-semibold text-soil-900 hover:text-water-700">
                  {product.name}
                </Link>
                <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-soil-500">
                  <span>{labels.get(product.category) ?? product.category}</span>
                  <span aria-hidden="true">·</span>
                  <span>{product.stock}</span>
                  {!product.published ? <Badge tone="neutral">Masqué</Badge> : null}
                  {product.featured ? <Badge tone="harvest">Mis en avant</Badge> : null}
                  {product.specs.length === 0 ? <Badge tone="danger">Caractéristiques à compléter</Badge> : null}
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-1">
                <QuickAction
                  action={togglePublishedAction}
                  id={product.id}
                  value={!product.published}
                  back={back}
                  label={product.published ? `Masquer « ${product.name} » du site` : `Publier « ${product.name} »`}
                >
                  {product.published ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </QuickAction>
                <QuickAction
                  action={toggleFeaturedAction}
                  id={product.id}
                  value={!product.featured}
                  back={back}
                  label={product.featured ? "Retirer de la mise en avant" : "Mettre en avant"}
                  active={product.featured}
                >
                  <Star className="h-4 w-4" />
                </QuickAction>
                <form action={duplicateProductAction}>
                  <input type="hidden" name="id" value={product.id} />
                  <button type="submit" aria-label={`Dupliquer « ${product.name} »`} title="Dupliquer" className={iconButton}>
                    <Copy className="h-4 w-4" />
                  </button>
                </form>
                <Link href={`/admin/produits/${product.id}`} className={buttonClasses({ variant: "secondary", size: "sm", className: "ml-1" })}>
                  Modifier
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const iconButton =
  "flex h-11 w-11 items-center justify-center rounded-control text-soil-600 transition-colors hover:bg-soil-100 hover:text-soil-900 sm:h-9 sm:w-9";

function QuickAction({
  action,
  id,
  value,
  back,
  label,
  active,
  children,
}: {
  action: (formData: FormData) => Promise<void>;
  id: string;
  value: boolean;
  back: string;
  label: string;
  active?: boolean;
  children: ReactNode;
}) {
  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="value" value={String(value)} />
      <input type="hidden" name="back" value={back} />
      <button type="submit" aria-label={label} title={label} className={cn(iconButton, active && "text-harvest-800")}>
        {children}
      </button>
    </form>
  );
}

function Select({
  name,
  label,
  value,
  options,
}: {
  name: string;
  label: string;
  value: string;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="grid gap-1 text-xs font-semibold text-soil-700">
      {label}
      <select
        name={name}
        defaultValue={value}
        className="min-h-11 rounded-control border border-soil-300 bg-white px-3 text-sm font-normal text-soil-900"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
