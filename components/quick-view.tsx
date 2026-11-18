"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Check,
  Clock,
  Minus,
  Plus,
  ShieldCheck,
  WhatsApp,
  X,
} from "@/components/icons";
import { productMessage, whatsappLink, type Product } from "@/lib/catalog";

type QuickViewProps = {
  product: Product;
  onClose: () => void;
};

export function QuickView({ product, onClose }: QuickViewProps) {
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="quick-view-title"
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 bg-[#0A2540]/60 backdrop-blur-sm"
        aria-label="Fermer la fenêtre"
      />

      <div className="animate-rise relative grid w-full max-w-3xl overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:grid-cols-2 sm:rounded-3xl">
        <div className="relative h-48 bg-gradient-to-br from-slate-50 via-white to-cyan-50/70 sm:h-full sm:min-h-[26rem]">
          <Image
            src={product.image}
            alt={product.imageAlt}
            fill
            sizes="(max-width: 640px) 100vw, 50vw"
            className="object-contain p-8"
          />
          {product.badge ? (
            <span className="absolute left-4 top-4 rounded-md bg-[#0A2540] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
              {product.badge}
            </span>
          ) : null}
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-[#0A2540] shadow-sm transition hover:bg-white sm:hidden"
            aria-label="Fermer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[62vh] overflow-y-auto p-5 sm:max-h-[80vh] sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-700">
                {product.categoryLabel}
              </p>
              <h2
                id="quick-view-title"
                className="mt-1 text-xl font-semibold leading-snug text-[#0A2540] sm:text-2xl"
              >
                {product.name}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[#0A2540] transition hover:bg-slate-200 sm:flex"
              aria-label="Fermer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <p className="mt-2 text-sm leading-relaxed text-slate-500">
            {product.description}
          </p>

          <dl className="mt-4 divide-y divide-slate-100 rounded-xl border border-slate-200">
            {product.specs.map((spec) => (
              <div
                key={spec.label}
                className="flex items-center justify-between gap-4 px-3.5 py-2.5 text-sm"
              >
                <dt className="text-slate-500">{spec.label}</dt>
                <dd className="text-right font-medium text-[#0A2540]">
                  {spec.value}
                </dd>
              </div>
            ))}
          </dl>

          <div className="mt-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-[#0A2540]">
                Prix sur demande
              </p>
              <p className="text-[11px] text-slate-400">
                Devis personnalisé selon vos quantités
              </p>
            </div>
            <div className="flex items-center gap-1 rounded-full border border-slate-200 bg-white p-1">
              <button
                type="button"
                onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                className="flex h-8 w-8 items-center justify-center rounded-full text-[#0A2540] transition hover:bg-slate-100"
                aria-label="Diminuer la quantité"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-7 text-center text-sm font-semibold text-[#0A2540]">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((value) => value + 1)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-[#0A2540] transition hover:bg-slate-100"
                aria-label="Augmenter la quantité"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          <a
            href={whatsappLink(productMessage(product, quantity))}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#1FA855] px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-[#178f47]"
          >
            <WhatsApp className="h-5 w-5" />
            Demander un devis sur WhatsApp
          </a>

          <Link
            href={`/produits/${product.slug}`}
            onClick={onClose}
            className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-[#0A2540] transition hover:border-cyan-300 hover:bg-cyan-50/40"
          >
            Voir la fiche complète
            <ArrowRight className="h-4 w-4" />
          </Link>

          <div className="mt-3 grid grid-cols-3 gap-2 text-center text-[10px] font-medium text-slate-500">
            <span className="inline-flex flex-col items-center gap-1 rounded-lg bg-slate-50 py-2">
              <Clock className="h-3.5 w-3.5 text-cyan-600" />
              Réponse 24h
            </span>
            <span className="inline-flex flex-col items-center gap-1 rounded-lg bg-slate-50 py-2">
              <ShieldCheck className="h-3.5 w-3.5 text-cyan-600" />
              Garantie
            </span>
            <span className="inline-flex flex-col items-center gap-1 rounded-lg bg-slate-50 py-2">
              <Check className="h-3.5 w-3.5 text-cyan-600" />
              Conseil inclus
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
