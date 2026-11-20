import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check } from "@/components/icons";
import { DeleteProductButton } from "@/components/admin/delete-product-button";
import { saveProductAction } from "@/lib/actions/products";
import type { AdminProduct } from "@/lib/admin-data";

type ProductFormProps = {
  product?: AdminProduct;
  categories: { id: string; label: string }[];
  error?: string | null;
};

const inputClass =
  "min-h-11 w-full rounded-xl border border-soil-300 bg-white px-3.5 py-2.5 text-sm text-soil-900 placeholder:text-soil-500 focus:border-water-500";
const labelClass = "grid gap-1.5 text-xs font-semibold text-soil-600";

export function ProductForm({ product, categories, error }: ProductFormProps) {
  const isEdit = Boolean(product);
  const specs = (product?.specs ?? [])
    .map((spec) => `${spec.label}: ${spec.value}`)
    .join("\n");

  return (
    <form action={saveProductAction} className="grid gap-4 lg:grid-cols-[1.35fr_0.65fr]">
      {product ? <input type="hidden" name="id" value={product.id} /> : null}

      <div className="space-y-4">
        {error ? (
          <p
            role="alert"
            className="rounded-xl border border-danger-200 bg-danger-50 px-4 py-3 text-sm font-medium text-danger-700"
          >
            {error}
          </p>
        ) : null}

        <section className="rounded-2xl border border-soil-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-soil-900">Informations</h2>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className={`${labelClass} sm:col-span-2`}>
              Nom du produit
              <input
                name="name"
                required
                defaultValue={product?.name ?? ""}
                placeholder='Ex : Pompe immergée inox 4"'
                className={inputClass}
              />
            </label>

            <label className={labelClass}>
              Slug (URL)
              <input
                name="slug"
                defaultValue={product?.slug ?? ""}
                placeholder="pompe-immergee-inox"
                className={inputClass}
              />
              <span className="text-[10px] font-normal text-soil-500">
                Laissez vide pour le générer depuis le nom.
              </span>
            </label>

            <label className={labelClass}>
              Gamme
              <select
                name="category"
                required
                defaultValue={product?.category ?? categories[0]?.id ?? ""}
                className={inputClass}
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.label}
                  </option>
                ))}
              </select>
            </label>

            <label className={`${labelClass} sm:col-span-2`}>
              Description
              <textarea
                name="description"
                rows={3}
                defaultValue={product?.description ?? ""}
                placeholder="Usage, points forts, type d'installation…"
                className={`${inputClass} resize-none`}
              />
            </label>

            <label className={labelClass}>
              Badge (optionnel)
              <input
                name="badge"
                defaultValue={product?.badge ?? ""}
                placeholder="Best-seller, Inox…"
                className={inputClass}
              />
            </label>

            <label className={labelClass}>
              Stock
              <select
                name="stock"
                defaultValue={product?.stock ?? "Disponible"}
                className={inputClass}
              >
                <option value="Disponible">Disponible</option>
                <option value="Sur commande">Sur commande</option>
                <option value="Rupture">Rupture</option>
              </select>
            </label>

            <label className={`${labelClass} sm:col-span-2`}>
              Caractéristiques
              <textarea
                name="specs"
                rows={4}
                defaultValue={specs}
                placeholder={"Puissance: 0,75 – 7,5 kW\nDébit: 6 – 60 m³/h"}
                className={`${inputClass} resize-none font-mono text-xs`}
              />
              <span className="text-[10px] font-normal text-soil-500">
                Une caractéristique par ligne, au format « Libellé : valeur ».
              </span>
            </label>
          </div>
        </section>

        <section className="rounded-2xl border border-soil-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-soil-900">Image</h2>

          <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_96px]">
            <label className={labelClass}>
              URL de l’image
              <input
                name="image"
                required
                defaultValue={product?.image ?? ""}
                placeholder="/images/products/mon-produit/main.webp"
                className={inputClass}
              />
              <span className="text-[10px] font-normal text-soil-500">
                Chemin local (<code>/images/products/…</code>) ou URL complète.
              </span>
            </label>

            <div className="relative h-24 w-24 overflow-hidden rounded-xl border border-soil-200 bg-soil-50">
              {product?.image ? (
                <Image
                  src={product.image}
                  alt=""
                  fill
                  sizes="96px"
                  className="object-contain p-1.5"
                />
              ) : (
                <span className="flex h-full items-center justify-center text-[10px] text-soil-500">
                  Aperçu
                </span>
              )}
            </div>
          </div>

          <label className={`${labelClass} mt-3`}>
            Texte alternatif (SEO / accessibilité)
            <input
              name="image_alt"
              defaultValue={product?.imageAlt ?? ""}
              placeholder="Pompe immergée inoxydable 4 pouces"
              className={inputClass}
            />
          </label>
        </section>
      </div>

      <div className="space-y-4">
        <section className="rounded-2xl border border-soil-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-soil-900">Publication</h2>

          <div className="mt-4 space-y-3">
            <label className="flex items-start gap-2.5 text-sm text-soil-600">
              <input
                type="checkbox"
                name="published"
                defaultChecked={product ? product.published : true}
                className="mt-0.5 h-4 w-4 rounded border-soil-300 text-water-600"
              />
              <span>
                <span className="block font-medium text-soil-900">
                  Visible sur le site
                </span>
                <span className="text-[11px] text-soil-500">
                  Décochez pour préparer un produit sans le publier.
                </span>
              </span>
            </label>

            <label className="flex items-start gap-2.5 text-sm text-soil-600">
              <input
                type="checkbox"
                name="featured"
                defaultChecked={product?.featured ?? false}
                className="mt-0.5 h-4 w-4 rounded border-soil-300 text-water-600"
              />
              <span>
                <span className="block font-medium text-soil-900">
                  Mettre en avant
                </span>
                <span className="text-[11px] text-soil-500">
                  Apparaît dans « Sélection du moment » sur l’accueil.
                </span>
              </span>
            </label>

            <label className={labelClass}>
              Ordre d’affichage
              <input
                type="number"
                name="position"
                min={0}
                defaultValue={product?.position ?? 0}
                className={inputClass}
              />
              <span className="text-[10px] font-normal text-soil-500">
                Les plus petits nombres apparaissent en premier.
              </span>
            </label>
          </div>

          <button
            type="submit"
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-field-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-field-800"
          >
            <Check className="h-4 w-4" />
            {isEdit ? "Enregistrer les modifications" : "Créer le produit"}
          </button>

          <Link
            href="/admin/produits"
            className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl border border-soil-300 bg-white px-4 py-3 text-sm font-semibold text-soil-900 transition hover:border-water-300"
          >
            Annuler
            <ArrowRight className="h-4 w-4" />
          </Link>
        </section>

        {product ? (
          <section className="rounded-2xl border border-danger-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-danger-700">Zone sensible</h2>
            <p className="mt-1 text-xs leading-relaxed text-soil-500">
              La suppression est définitive. Pour masquer un produit
              temporairement, décochez plutôt « Visible sur le site ».
            </p>
            <DeleteProductButton id={product.id} name={product.name} />
          </section>
        ) : null}
      </div>
    </form>
  );
}
