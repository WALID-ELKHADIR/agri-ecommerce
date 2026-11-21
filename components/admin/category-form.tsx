import Link from "next/link";
import { ImageManager } from "@/components/admin/image-manager";
import { Button, buttonClasses } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/field";
import type { AdminCategory } from "@/lib/admin-data";
import { saveCategoryAction } from "@/lib/actions/categories";
import { getAdminDictionary } from "@/lib/i18n/server";

/** Formulaire de création ou de modification d'une catégorie. */
export async function CategoryForm({ category }: { category?: AdminCategory }) {
  const t = await getAdminDictionary();
  const f = t.categoryForm;

  return (
    <form action={saveCategoryAction} className="grid gap-6 rounded-card border border-soil-200 bg-white p-5 shadow-soft sm:p-6">
      {category ? <input type="hidden" name="original_id" value={category.id} /> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <Input label={f.name} name="label" required maxLength={80} lang="fr" dir="ltr" defaultValue={category?.label} />
        <Input
          label={f.short}
          name="short"
          maxLength={40}
          lang="fr"
          dir="ltr"
          defaultValue={category?.short}
          hint={f.shortHint}
        />
        {category ? (
          <Input label={f.id} name="id_display" value={category.id} disabled dir="ltr" hint={f.idFixedHint} />
        ) : (
          <Input label={f.idOptional} name="id" maxLength={80} dir="ltr" hint={f.idHint} />
        )}
      </div>

      <Textarea
        label={t.common.description}
        name="description"
        rows={3}
        maxLength={400}
        lang="fr"
        dir="ltr"
        defaultValue={category?.description}
        hint={f.descriptionHint}
      />

      <fieldset className="grid gap-4 rounded-card border border-soil-200 p-4">
        <legend className="px-1 text-sm font-semibold text-soil-900">{f.arabic}</legend>
        <p className="-mt-2 text-xs text-soil-500">{f.arabicHint}</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label={f.nameAr} name="label_ar" maxLength={80} lang="ar" dir="rtl" defaultValue={category?.labelAr} />
          <Input label={f.shortAr} name="short_ar" maxLength={40} lang="ar" dir="rtl" defaultValue={category?.shortAr} />
        </div>
        <Textarea
          label={f.descriptionAr}
          name="description_ar"
          rows={2}
          maxLength={400}
          lang="ar"
          dir="rtl"
          defaultValue={category?.descriptionAr}
        />
      </fieldset>

      <ImageManager
        name="images"
        folder="categories"
        max={1}
        label={f.image}
        initial={category?.imageUrl ? [{ url: category.imageUrl, storagePath: null, alt: category.label }] : []}
      />

      <div className="flex flex-wrap justify-end gap-2 border-t border-soil-200 pt-4">
        <Link href="/admin/categories" className={buttonClasses({ variant: "ghost" })}>
          {t.common.cancel}
        </Link>
        <Button type="submit">{category ? t.common.saveChanges : f.create}</Button>
      </div>
    </form>
  );
}
