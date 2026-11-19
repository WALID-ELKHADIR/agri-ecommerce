"use client";

import { Trash } from "@/components/icons";
import { deleteProductAction } from "@/lib/actions/products";

export function DeleteProductButton({ id, name }: { id: string; name: string }) {
  return (
    <form
      action={deleteProductAction}
      onSubmit={(event) => {
        if (
          !window.confirm(
            `Supprimer définitivement « ${name} » ? Cette action est irréversible.`,
          )
        ) {
          event.preventDefault();
        }
      }}
      className="mt-3"
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
      >
        <Trash className="h-4 w-4" />
        Supprimer ce produit
      </button>
    </form>
  );
}
