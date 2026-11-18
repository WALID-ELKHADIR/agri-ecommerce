"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, WhatsApp } from "@/components/icons";
import { productMessage, whatsappLink, type Product } from "@/lib/catalog";

type ProductCardProps = {
  product: Product;
  onDetails?: (product: Product) => void;
};

export function ProductCard({ product, onDetails }: ProductCardProps) {
  const media = (
    <>
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-cyan-50/60" />
      <Image
        src={product.image}
        alt={product.imageAlt}
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
        className="object-contain p-5 transition duration-500 group-hover:scale-[1.04]"
      />
      {product.badge ? (
        <span className="absolute left-3 top-3 rounded-md bg-[#0A2540] px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
          {product.badge}
        </span>
      ) : null}
      <span className="absolute right-3 top-3 rounded-md bg-white/90 px-2 py-1 text-[10px] font-medium text-slate-600 shadow-sm backdrop-blur">
        {product.stock}
      </span>
    </>
  );

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-cyan-200 hover:shadow-xl">
      {onDetails ? (
        <button
          type="button"
          onClick={() => onDetails(product)}
          className="relative h-44 w-full overflow-hidden sm:h-48"
          aria-label={`Voir les détails de ${product.name}`}
        >
          {media}
        </button>
      ) : (
        <Link
          href={`/produits/${product.slug}`}
          className="relative h-44 w-full overflow-hidden sm:h-48"
          aria-label={`Voir la fiche de ${product.name}`}
        >
          {media}
        </Link>
      )}

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-700">
          {product.categoryLabel}
        </p>
        <h3 className="mt-1 text-base font-semibold leading-snug text-[#0A2540]">
          {product.name}
        </h3>
        <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-slate-500">
          {product.description}
        </p>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {product.specs.slice(0, 2).map((spec) => (
            <span
              key={spec.label}
              className="rounded-md bg-slate-100 px-2 py-1 text-[11px] text-slate-600"
            >
              {spec.label} : <span className="font-medium text-slate-700">{spec.value}</span>
            </span>
          ))}
        </div>

        <div className="mt-auto flex items-center justify-between pt-3">
          <span className="text-sm font-semibold text-[#0A2540]">
            Prix sur demande
          </span>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            {product.stock}
          </span>
        </div>

        <div className="mt-4 flex items-center gap-2">
          {onDetails ? (
            <button
              type="button"
              onClick={() => onDetails(product)}
              className="flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-semibold text-[#0A2540] transition hover:border-cyan-300 hover:bg-cyan-50/50"
            >
              Détails
            </button>
          ) : (
            <Link
              href={`/produits/${product.slug}`}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-semibold text-[#0A2540] transition hover:border-cyan-300 hover:bg-cyan-50/50"
            >
              Voir la fiche
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          )}
          <a
            href={whatsappLink(productMessage(product))}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#1FA855] px-3.5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#178f47]"
            aria-label={`Demander un devis pour ${product.name}`}
          >
            <WhatsApp className="h-4 w-4" />
            Devis
          </a>
        </div>
      </div>
    </article>
  );
}
