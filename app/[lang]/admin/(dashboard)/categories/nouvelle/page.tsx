import Link from "next/link";
import { Suspense } from "react";
import { CategoryForm } from "@/components/admin/category-form";
import { AdminHeader } from "@/components/admin/dashboard";
import { FormSkeleton } from "@/components/admin/skeletons";
import { ArrowLeft } from "@/components/icons";
import { requireAdmin } from "@/lib/auth";

export default function NouvelleCategoriePage() {
  return (
    <Suspense fallback={<FormSkeleton />}>
      <NouvelleCategorie />
    </Suspense>
  );
}

async function NouvelleCategorie() {
  await requireAdmin();
  return (
    <div className="space-y-4">
      <AdminHeader title="Nouvelle catégorie" description="Une gamme du catalogue, avec son image." />
      <Link
        href="/admin/categories"
        className="inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-soil-500 hover:text-water-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour aux catégories
      </Link>
      <CategoryForm />
    </div>
  );
}
