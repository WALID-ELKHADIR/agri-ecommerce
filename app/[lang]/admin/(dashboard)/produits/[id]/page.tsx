import Link from "next/link";
import { Suspense } from "react";
import { AdminHeader } from "@/components/admin/dashboard";
import { ProductForm } from "@/components/admin/product-form";
import { ArrowLeft } from "@/components/icons";
import { FormSkeleton } from "@/components/admin/skeletons";
import { getAdminProduct, getProductImages, listAdminCategories } from "@/lib/admin-data";
import { requireAdmin } from "@/lib/auth";
import { getAdminDictionary } from "@/lib/i18n/server";

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
  const t = (await getAdminDictionary()).products;

  const [product, categories] = await Promise.all([
    getAdminProduct(id),
    listAdminCategories(),
  ]);

  if (!product) {
    return (
      <div className="rounded-2xl border border-soil-200 bg-white p-8 text-center">
        <p className="text-sm font-semibold text-soil-900">
          {t.notFound}
        </p>
        <p className="mt-1 text-sm text-soil-500">
          {t.notFoundText}
        </p>
        <Link
          href="/admin/produits"
          className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-field-900 px-4 py-2.5 text-sm font-semibold text-white"
        >
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
          {t.backToList}
        </Link>
      </div>
    );
  }

  const images = await getProductImages(product);

  return (
    <div className="space-y-4">
      <AdminHeader
        title={product.name}
        description={t.editDescription(product.slug)}
      />

      <Link
        href="/admin/produits"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-soil-500 transition hover:text-water-700"
      >
        <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
        {t.backToProducts}
      </Link>

      <ProductForm
        product={product}
        categories={categories.map((category) => ({
          id: category.id as string,
          label: category.label as string,
        }))}
        images={images}
        error={error}
      />
    </div>
  );
}
