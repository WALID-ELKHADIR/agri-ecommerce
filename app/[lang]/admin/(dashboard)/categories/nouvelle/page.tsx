import Link from "next/link";
import { Suspense } from "react";
import { CategoryForm } from "@/components/admin/category-form";
import { AdminHeader } from "@/components/admin/dashboard";
import { FormSkeleton } from "@/components/admin/skeletons";
import { ArrowLeft } from "@/components/icons";
import { requireAdmin } from "@/lib/auth";
import { getAdminDictionary } from "@/lib/i18n/server";

export default function NouvelleCategoriePage() {
  return (
    <Suspense fallback={<FormSkeleton />}>
      <NouvelleCategorie />
    </Suspense>
  );
}

async function NouvelleCategorie() {
  await requireAdmin();
  const c = (await getAdminDictionary()).categories;
  return (
    <div className="space-y-4">
      <AdminHeader title={c.newCategory} description={c.newDescription} />
      <Link
        href="/admin/categories"
        className="inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-soil-500 hover:text-water-700"
      >
        <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
        {c.back}
      </Link>
      <CategoryForm />
    </div>
  );
}
