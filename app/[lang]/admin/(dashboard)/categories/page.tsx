import Link from "next/link";
import { Suspense } from "react";
import { ConfirmSubmit } from "@/components/admin/confirm-submit";
import { AdminHeader, SetupNotice } from "@/components/admin/dashboard";
import { TableSkeleton } from "@/components/admin/skeletons";
import { ArrowDown, ArrowUp, ImageIcon, Tag, Trash } from "@/components/icons";
import { buttonClasses } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { listAdminCategories } from "@/lib/admin-data";
import { deleteCategoryAction, moveCategoryAction } from "@/lib/actions/categories";
import { requireAdmin } from "@/lib/auth";
import { getAdminDictionary } from "@/lib/i18n/server";

export default function AdminCategoriesPage() {
  return (
    <Suspense fallback={<TableSkeleton />}>
      <CategoriesContent />
    </Suspense>
  );
}

async function CategoriesContent() {
  await requireAdmin();
  const categories = await listAdminCategories();
  const t = await getAdminDictionary();
  const c = t.categories;

  return (
    <div className="space-y-4">
      <SetupNotice />
      <AdminHeader
        title={c.title}
        description={c.description}
        action={{ href: "/admin/categories/nouvelle", label: c.newCategory }}
      />

      {categories.length === 0 ? (
        <EmptyState
          icon={<Tag className="h-5 w-5" />}
          title={c.empty}
          description={c.emptyText}
          action={
            <Link href="/admin/categories/nouvelle" className={buttonClasses()}>
              {c.create}
            </Link>
          }
        />
      ) : (
        <ol className="grid gap-2">
          {categories.map((category, index) => (
            <li
              key={category.id}
              className="flex flex-wrap items-center gap-3 rounded-card border border-soil-200 bg-white p-3 shadow-soft sm:flex-nowrap"
            >
              <div className="flex shrink-0 flex-col">
                <form action={moveCategoryAction}>
                  <input type="hidden" name="id" value={category.id} />
                  <input type="hidden" name="direction" value="up" />
                  <button
                    type="submit"
                    disabled={index === 0}
                    aria-label={c.moveUp(category.label)}
                    className="flex h-11 w-11 items-center justify-center rounded-control text-soil-600 hover:bg-soil-100 disabled:opacity-30 sm:h-8"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </button>
                </form>
                <form action={moveCategoryAction}>
                  <input type="hidden" name="id" value={category.id} />
                  <input type="hidden" name="direction" value="down" />
                  <button
                    type="submit"
                    disabled={index === categories.length - 1}
                    aria-label={c.moveDown(category.label)}
                    className="flex h-11 w-11 items-center justify-center rounded-control text-soil-600 hover:bg-soil-100 disabled:opacity-30 sm:h-8"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </button>
                </form>
              </div>

              <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-control bg-soil-100">
                {category.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element -- vignette admin
                  <img src={category.imageUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <ImageIcon className="h-5 w-5 text-soil-400" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="font-semibold text-soil-900">{category.label}</p>
                <p className="text-xs text-soil-500">
                  <bdi>{category.id}</bdi> · {c.productCount(category.productCount)}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <Link href={`/admin/categories/${category.id}`} className={buttonClasses({ variant: "secondary", size: "sm" })}>
                  {t.common.edit}
                </Link>
                {category.productCount === 0 ? (
                  <ConfirmSubmit
                    action={deleteCategoryAction}
                    id={category.id}
                    message={c.deleteConfirm(category.label)}
                    className={buttonClasses({ variant: "ghost", size: "sm", className: "text-danger-700 hover:bg-danger-50" })}
                  >
                    <Trash className="h-4 w-4" />
                    <span className="sr-only sm:not-sr-only">{t.common.delete}</span>
                  </ConfirmSubmit>
                ) : (
                  <span
                    className="inline-flex min-h-11 items-center px-2 text-xs text-soil-500 sm:min-h-9"
                    title={c.notDeletableHint}
                  >
                    {c.notDeletable}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
