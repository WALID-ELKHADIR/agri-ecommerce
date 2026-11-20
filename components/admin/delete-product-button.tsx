"use client";

import { Trash } from "@/components/icons";
import { deleteProductAction } from "@/lib/actions/products";

/**
 * Bouton placé DANS le formulaire du produit : un <form> imbriqué est ignoré
 * par le navigateur (le clic enregistrait alors le produit au lieu de le
 * supprimer). `formAction` envoie le formulaire parent, dont le champ caché
 * `id`, à l'action de suppression.
 */
export function DeleteProductButton({ name }: { name: string }) {
  return (
    <button
      type="submit"
      formAction={deleteProductAction}
      formNoValidate
      onClick={(event) => {
        if (!window.confirm(`Supprimer définitivement « ${name} » ? Cette action est irréversible.`)) {
          event.preventDefault();
        }
      }}
      className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-danger-200 bg-danger-50 px-4 py-2.5 text-sm font-semibold text-danger-700 transition hover:bg-danger-100"
    >
      <Trash className="h-4 w-4" />
      Supprimer ce produit
    </button>
  );
}
