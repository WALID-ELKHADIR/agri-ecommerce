import Link from "next/link";
import { Suspense } from "react";
import { AdminHeader } from "@/components/admin/dashboard";
import { ProductForm } from "@/components/admin/product-form";
import { ArrowLeft } from "@/components/icons";
import { FormSkeleton } from "@/components/admin/skeletons";
import { getAdminProduct, listAdminCategories } from "@/lib/admin-data";
import { requireAdmin } from "@/lib/auth";

type EditProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
};

export default function EditProduitPage({ params, searchParams }: EditProps) {
  return (
    <Suspense fallback={<FormSkeleton />}>
      {Promise.all([params, searchParams]).then(([{ id }, query]) => (
        <EditContenu id={id} error={query.error ?? null} />
      ))}
    </Suspense>
  );
}

async function EditContenu({ id, error }: { id: string; error: string | null }) {
  await requireAdmin();

  const [product, categories] = await Promise.all([
    getAdminProduct(id),
    listAdminCategories(),
  ]);

  if (!product) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
        <p className="text-sm font-semibold text-[#0A2540]">
          Produit introuvable.
        </p>
        <p className="mt-1 text-sm text-slate-500">
          Il a peut-être été supprimé entre-temps.
        </p>
        <Link
          href="/admin/produits"
          className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[#0A2540] px-4 py-2.5 text-sm font-semibold text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour à la liste
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <AdminHeader
        title={product.name}
        description={`Modifier la fiche · /${product.slug}`}
      />

      <Link
        href="/admin/produits"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-cyan-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour aux produits
      </Link>

      <ProductForm
        product={product}
        categories={categories.map((category) => ({
          id: category.id as string,
          label: category.label as string,
        }))}
        error={error}
      />
    </div>
  );
}
