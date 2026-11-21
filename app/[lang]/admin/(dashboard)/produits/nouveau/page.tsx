import { Suspense } from "react";
import { AdminHeader, SetupNotice } from "@/components/admin/dashboard";
import { ProductForm } from "@/components/admin/product-form";
import { FormSkeleton } from "@/components/admin/skeletons";
import { listAdminCategories } from "@/lib/admin-data";
import { requireAdmin } from "@/lib/auth";
import { getAdminDictionary } from "@/lib/i18n/server";

type NouveauProps = {
  searchParams: Promise<{ error?: string }>;
};

export default function NouveauProduitPage({ searchParams }: NouveauProps) {
  return (
    <Suspense fallback={<FormSkeleton />}>
      {searchParams.then((params) => (
        <NouveauContenu error={params.error ?? null} />
      ))}
    </Suspense>
  );
}

async function NouveauContenu({ error }: { error: string | null }) {
  await requireAdmin();
  const categories = await listAdminCategories();
  const t = await getAdminDictionary();

  return (
    <div className="space-y-4">
      <SetupNotice error={categories.length === 0 ? t.setup.noCategory : null} />

      <AdminHeader
        title={t.products.newProduct}
        description={t.products.newDescription}
      />

      <ProductForm
        categories={categories.map((category) => ({
          id: category.id as string,
          label: category.label as string,
        }))}
        images={[]}
        error={error}
      />
    </div>
  );
}
