import Link from "next/link";
import { ImageManager } from "@/components/admin/image-manager";
import { Button, buttonClasses } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/field";
import type { AdminCategory } from "@/lib/admin-data";
import { saveCategoryAction } from "@/lib/actions/categories";

/** Formulaire de création ou de modification d'une catégorie. */
export function CategoryForm({ category }: { category?: AdminCategory }) {
  return (
    <form action={saveCategoryAction} className="grid gap-6 rounded-card border border-soil-200 bg-white p-5 shadow-soft sm:p-6">
      {category ? <input type="hidden" name="original_id" value={category.id} /> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Nom de la catégorie" name="label" required maxLength={80} defaultValue={category?.label} />
        <Input
          label="Nom court"
          name="short"
          maxLength={40}
          defaultValue={category?.short}
          hint="Affiché sur les filtres du catalogue (ex. « Pompes »)."
        />
        {category ? (
          <Input
            label="Identifiant"
            name="id_display"
            value={category.id}
            disabled
            hint="Fixe : il sert dans les adresses du site."
          />
        ) : (
          <Input
            label="Identifiant (facultatif)"
            name="id"
            maxLength={80}
            hint="Généré depuis le nom si vous le laissez vide, ex. « accessoires-pompage »."
          />
        )}
      </div>

      <Textarea
        label="Description"
        name="description"
        rows={3}
        maxLength={400}
        defaultValue={category?.description}
        hint="Une phrase : ce que l'on trouve dans cette catégorie."
      />

      <ImageManager
        name="images"
        folder="categories"
        max={1}
        label="Image de la catégorie"
        initial={category?.imageUrl ? [{ url: category.imageUrl, storagePath: null, alt: category.label }] : []}
      />

      <div className="flex flex-wrap justify-end gap-2 border-t border-soil-200 pt-4">
        <Link href="/admin/categories" className={buttonClasses({ variant: "ghost" })}>
          Annuler
        </Link>
        <Button type="submit">{category ? "Enregistrer les modifications" : "Créer la catégorie"}</Button>
      </div>
    </form>
  );
}
