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
          className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800"
        >
          <Check className="h-4 w-4" />
          {success}
        </p>
      ) : null}

      {error ? (
        <p
          role="alert"
          className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700"
        >
          {error}
        </p>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="hidden grid-cols-[1fr_140px_110px_90px_150px] gap-3 border-b border-slate-100 bg-slate-50/70 px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400 lg:grid">
          <span>Produit</span>
          <span>Gamme</span>
          <span>Stock</span>
          <span>État</span>
          <span className="text-right">Actions</span>
        </div>

        {products.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <p className="text-sm font-medium text-[#0A2540]">
              Aucun produit pour le moment.
            </p>
            <Link
              href="/admin/produits/nouveau"
              className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-[#0A2540] px-4 py-2.5 text-sm font-semibold text-white"
            >
              Créer le premier produit
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {products.map((product) => (
              <li
                key={product.id}
                className="grid gap-3 px-4 py-3.5 sm:px-5 lg:grid-cols-[1fr_140px_110px_90px_150px] lg:items-center"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                    <Image
                      src={product.image}
                      alt=""
                      fill
                      sizes="48px"
                      className="object-contain p-1"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[#0A2540]">
                      {product.name}
                    </p>
                    <p className="truncate text-[11px] text-slate-400">
                      /{product.slug}
                    </p>
                  </div>
                </div>

                <p className="text-xs text-slate-500 lg:text-sm">
                  <span className="lg:hidden">Gamme : </span>
                  {product.category}
                </p>

                <p className="text-xs text-slate-500 lg:text-sm">{product.stock}</p>

                <div className="flex flex-wrap items-center gap-1.5">
                  {product.published ? (
                    <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                      En ligne
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                      <X className="h-3 w-3" />
                      Masqué
                    </span>
                  )}
                  {product.featured ? (
                    <span className="rounded-md bg-cyan-50 px-2 py-0.5 text-[10px] font-semibold text-cyan-700">
                      Mis en avant
                    </span>
                  ) : null}
                </div>

                <div className="flex items-center gap-2 lg:justify-end">
                  <Link
                    href={`/admin/produits/${product.id}`}
                    className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-[#0A2540] transition hover:border-cyan-300 hover:bg-cyan-50/50"
                  >
                    Modifier
                  </Link>
                  <Link
                    href={`/produits/${product.slug}`}
                    target="_blank"
                    className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-slate-500 transition hover:text-cyan-700"
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
      <div className="h-9 w-48 animate-pulse rounded-lg bg-slate-200" />
      <div className="h-72 animate-pulse rounded-2xl bg-white" />
      <span className="sr-only">Chargement des produits…</span>
    </div>
  );
}
