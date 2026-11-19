import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { AdminHeader, SetupNotice } from "@/components/admin/dashboard";
import { ArrowUpRight, Check, X } from "@/components/icons";
import { listAdminProducts } from "@/lib/admin-data";
import { requireAdmin } from "@/lib/auth";

type ProduitsAdminProps = {
  searchParams: Promise<{ ok?: string; deleted?: string; error?: string }>;
};

export default function AdminProduitsPage({ searchParams }: ProduitsAdminProps) {
  return (
    <Suspense fallback={<TableSkeleton />}>
      {searchParams.then((params) => (
        <ProduitsContent
          success={
            params.ok
              ? "Produit enregistré."
              : params.deleted
                ? "Produit supprimé."
                : null
          }
          error={params.error ?? null}
        />
      ))}
    </Suspense>
  );
}

async function ProduitsContent({
  success,
  error,
}: {
  success: string | null;
  error: string | null;
}) {
  await requireAdmin();

  const { products, error: loadError } = await listAdminProducts();

  return (
    <div className="space-y-4">
      <SetupNotice error={loadError} />

      <AdminHeader
        title="Produits"
        description={`${products.length} référence${products.length > 1 ? "s" : ""} dans le catalogue.`}
        action={{ href: "/admin/produits/nouveau", label: "Nouveau produit" }}
      />

      {success ? (
        <p
          role="status"
          className="flex items-center gap-2 rounded-xl border border-field-200 bg-field-50 px-4 py-3 text-sm font-medium text-field-800"
        >
          <Check className="h-4 w-4" />
          {success}
        </p>
      ) : null}

      {error ? (
        <p
          role="alert"
          className="rounded-xl border border-danger-200 bg-danger-50 px-4 py-3 text-sm font-medium text-danger-700"
        >
          {error}
        </p>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-soil-200 bg-white">
        <div className="hidden grid-cols-[1fr_140px_110px_90px_150px] gap-3 border-b border-soil-100 bg-soil-50/70 px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-soil-500 lg:grid">
          <span>Produit</span>
          <span>Gamme</span>
          <span>Stock</span>
          <span>État</span>
          <span className="text-right">Actions</span>
        </div>

        {products.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <p className="text-sm font-medium text-soil-900">
              Aucun produit pour le moment.
            </p>
            <Link
              href="/admin/produits/nouveau"
              className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-field-900 px-4 py-2.5 text-sm font-semibold text-white"
            >
              Créer le premier produit
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-soil-100">
            {products.map((product) => (
              <li
                key={product.id}
                className="grid gap-3 px-4 py-3.5 sm:px-5 lg:grid-cols-[1fr_140px_110px_90px_150px] lg:items-center"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-soil-200 bg-soil-50">
                    <Image
                      src={product.image}
                      alt=""
                      fill
                      sizes="48px"
                      className="object-contain p-1"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-soil-900">
                      {product.name}
                    </p>
                    <p className="truncate text-[11px] text-soil-500">
                      /{product.slug}
                    </p>
                  </div>
                </div>

                <p className="text-xs text-soil-500 lg:text-sm">
                  <span className="lg:hidden">Gamme : </span>
                  {product.category}
                </p>

                <p className="text-xs text-soil-500 lg:text-sm">{product.stock}</p>

                <div className="flex flex-wrap items-center gap-1.5">
                  {product.published ? (
                    <span className="inline-flex items-center gap-1 rounded-md bg-field-50 px-2 py-0.5 text-[10px] font-semibold text-field-700">
                      En ligne
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-md bg-soil-100 px-2 py-0.5 text-[10px] font-semibold text-soil-500">
                      <X className="h-3 w-3" />
                      Masqué
                    </span>
                  )}
                  {product.featured ? (
                    <span className="rounded-md bg-water-50 px-2 py-0.5 text-[10px] font-semibold text-water-700">
                      Mis en avant
                    </span>
                  ) : null}
                </div>

                <div className="flex items-center gap-2 lg:justify-end">
                  <Link
                    href={`/admin/produits/${product.id}`}
                    className="rounded-lg border border-soil-300 px-3 py-1.5 text-xs font-semibold text-soil-900 transition hover:border-water-300 hover:bg-water-50/50"
                  >
                    Modifier
                  </Link>
                  <Link
                    href={`/produits/${product.slug}`}
                    target="_blank"
                    className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-soil-500 transition hover:text-water-700"
                  >
                    Voir
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function TableSkeleton() {
  return (
    <div aria-busy="true" className="space-y-4">
      <div className="h-9 w-48 animate-pulse rounded-lg bg-soil-200" />
      <div className="h-72 animate-pulse rounded-2xl bg-white" />
      <span className="sr-only">Chargement des produits…</span>
    </div>
  );
}
