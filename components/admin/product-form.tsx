import Link from "next/link";
import { ArrowRight, Check } from "@/components/icons";
import { DeleteProductButton } from "@/components/admin/delete-product-button";
import { ImageManager } from "@/components/admin/image-manager";
import { saveProductAction } from "@/lib/actions/products";
import type { AdminImage, AdminProduct } from "@/lib/admin-data";
import { flashText } from "@/lib/i18n/flash";
import { stockLabel } from "@/lib/i18n/labels";
import { getAdminDictionary, getDictionary } from "@/lib/i18n/server";

type ProductFormProps = {
  product?: AdminProduct;
  categories: { id: string; label: string }[];
  /** Galerie actuelle (image principale en premier). */
  images: AdminImage[];
  error?: string | null;
};

const inputClass =
  "min-h-11 w-full rounded-xl border border-soil-300 bg-white px-3.5 py-2.5 text-sm text-soil-900 placeholder:text-soil-500 focus:border-water-500";
const labelClass = "grid gap-1.5 text-xs font-semibold text-soil-600";

/** Valeurs de stock enregistrées en base (le libellé affiché suit la langue). */
const STOCKS = ["Disponible", "Sur commande", "Rupture"];

const specsText = (specs: { label: string; value: string }[]) =>
  specs.map((spec) => `${spec.label}: ${spec.value}`).join("\n");

export async function ProductForm({ product, categories, images, error }: ProductFormProps) {
  const t = await getAdminDictionary();
  const f = t.productForm;
  const site = await getDictionary();
  const isEdit = Boolean(product);

  return (
    <form action={saveProductAction} className="grid gap-4 lg:grid-cols-[1.35fr_0.65fr]">
      {product ? <input type="hidden" name="id" value={product.id} /> : null}

      <div className="space-y-4">
        {error ? (
          <p
            role="alert"
            className="rounded-xl border border-danger-200 bg-danger-50 px-4 py-3 text-sm font-medium text-danger-700"
          >
            {flashText(t.flash, error)}
          </p>
        ) : null}

        <section className="rounded-2xl border border-soil-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-soil-900">{f.information}</h2>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className={`${labelClass} sm:col-span-2`}>
              {f.name}
              <input
                name="name"
                required
                lang="fr"
                dir="ltr"
                defaultValue={product?.name ?? ""}
                placeholder={f.namePlaceholder}
                className={inputClass}
              />
            </label>

            <label className={labelClass}>
              {f.slug}
              <input
                name="slug"
                dir="ltr"
                defaultValue={product?.slug ?? ""}
                placeholder="pompe-immergee-inox"
                className={inputClass}
              />
              <span className="text-[10px] font-normal text-soil-500">{f.slugHint}</span>
            </label>

            <label className={labelClass}>
              {f.range}
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
              {t.common.description}
              <textarea
                name="description"
                rows={3}
                lang="fr"
                dir="ltr"
                defaultValue={product?.description ?? ""}
                placeholder={f.descriptionPlaceholder}
                className={`${inputClass} resize-none`}
              />
            </label>

            <label className={labelClass}>
              {f.badge}
              <input
                name="badge"
                defaultValue={product?.badge ?? ""}
                placeholder={f.badgePlaceholder}
                className={inputClass}
              />
            </label>

            <label className={labelClass}>
              {f.stock}
              <select name="stock" defaultValue={product?.stock ?? STOCKS[0]} className={inputClass}>
                {STOCKS.map((stock) => (
                  <option key={stock} value={stock}>
                    {stockLabel(stock, site)}
                  </option>
                ))}
              </select>
            </label>

            <label className={`${labelClass} sm:col-span-2`}>
              {f.specs}
              <textarea
                name="specs"
                rows={4}
                lang="fr"
                dir="ltr"
                defaultValue={specsText(product?.specs ?? [])}
                placeholder={"Puissance: 0,75 – 7,5 kW\nDébit: 6 – 60 m³/h"}
                className={`${inputClass} resize-none font-mono text-xs`}
              />
              <span className="text-[10px] font-normal text-soil-500">{f.specsHint}</span>
            </label>
          </div>
        </section>

        <section className="rounded-2xl border border-soil-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-soil-900">{f.arabic}</h2>
          <p className="mt-1 text-xs text-soil-500">{f.arabicHint}</p>

          <div className="mt-4 grid gap-3">
            <label className={labelClass}>
              {f.nameAr}
              <input
                name="name_ar"
                lang="ar"
                dir="rtl"
                maxLength={160}
                defaultValue={product?.nameAr ?? ""}
                className={inputClass}
              />
            </label>
            <label className={labelClass}>
              {f.descriptionAr}
              <textarea
                name="description_ar"
                rows={3}
                lang="ar"
                dir="rtl"
                maxLength={2000}
                defaultValue={product?.descriptionAr ?? ""}
                className={`${inputClass} resize-none`}
              />
            </label>
            <label className={labelClass}>
              {f.specsAr}
              <textarea
                name="specs_ar"
                rows={4}
                lang="ar"
                dir="rtl"
                defaultValue={specsText(product?.specsAr ?? [])}
                placeholder={"التدفق: 6 – 60 م³/س"}
                className={`${inputClass} resize-none text-xs`}
              />
              <span className="text-[10px] font-normal text-soil-500">{f.specsHint}</span>
            </label>
          </div>
        </section>

        <section className="rounded-2xl border border-soil-200 bg-white p-5">
          <ImageManager name="images" folder="produits" initial={images} label={f.photos} />
        </section>
      </div>

      <div className="space-y-4">
        <section className="rounded-2xl border border-soil-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-soil-900">{f.publication}</h2>

          <div className="mt-4 space-y-3">
            <label className="flex items-start gap-2.5 text-sm text-soil-600">
              <input
                type="checkbox"
                name="published"
                defaultChecked={product ? product.published : true}
                className="mt-0.5 h-4 w-4 rounded border-soil-300 text-water-600"
              />
              <span>
                <span className="block font-medium text-soil-900">{f.visible}</span>
                <span className="text-[11px] text-soil-500">{f.visibleHint}</span>
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
                <span className="block font-medium text-soil-900">{f.feature}</span>
                <span className="text-[11px] text-soil-500">{f.featureHint}</span>
              </span>
            </label>

            <label className={labelClass}>
              {f.position}
              <input
                type="number"
                name="position"
                min={0}
                defaultValue={product?.position ?? 0}
                className={inputClass}
              />
              <span className="text-[10px] font-normal text-soil-500">{f.positionHint}</span>
            </label>
          </div>

          <button
            type="submit"
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-field-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-field-800"
          >
            <Check className="h-4 w-4" />
            {isEdit ? t.common.saveChanges : f.create}
          </button>

          <Link
            href="/admin/produits"
            className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl border border-soil-300 bg-white px-4 py-3 text-sm font-semibold text-soil-900 transition hover:border-water-300"
          >
            {t.common.cancel}
            <ArrowRight className="h-4 w-4 rtl:rotate-180" />
          </Link>
        </section>

        {product ? (
          <section className="rounded-2xl border border-danger-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-danger-700">{f.danger}</h2>
            <p className="mt-1 text-xs leading-relaxed text-soil-500">{f.dangerText}</p>
            <DeleteProductButton name={product.name} />
          </section>
        ) : null}
      </div>
    </form>
  );
}
