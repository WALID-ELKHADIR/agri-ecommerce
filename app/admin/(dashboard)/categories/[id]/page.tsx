import Link from "next/link";
import { Suspense } from "react";
import { CategoryForm } from "@/components/admin/category-form";
import { AdminHeader } from "@/components/admin/dashboard";
import { FormSkeleton } from "@/components/admin/skeletons";
import { ArrowLeft, Tag } from "@/components/icons";
import { buttonClasses } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { getAdminCategory } from "@/lib/admin-data";
import { requireAdmin } from "@/lib/auth";

export default function ModifierCategoriePage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<FormSkeleton />}>
      {params.then(({ id }) => (
        <ModifierCategorie id={decodeURIComponent(id)} />
      ))}
    </Suspense>
  );
}

async function ModifierCategorie({ id }: { id: string }) {
  await requireAdmin();
  const category = await getAdminCategory(id);

  if (!category) {
    return (
      <EmptyState
        icon={<Tag className="h-5 w-5" />}
        title="Catégorie introuvable"
        description="Elle a peut-être été supprimée entre-temps."
        action={
          <Link href="/admin/categories" className={buttonClasses()}>
            Retour aux catégories
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      <AdminHeader
        title={category.label}
        description={`${category.productCount} produit${category.productCount > 1 ? "s" : ""} dans cette catégorie.`}
      />
      <Link
        href="/admin/categories"
        className="inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-soil-500 hover:text-water-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour aux catégories
      </Link>
      <CategoryForm category={category} />
    </div>
  );
}
