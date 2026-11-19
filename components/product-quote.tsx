"use client";

import { useState } from "react";
import { Minus, Phone, Plus, WhatsApp } from "@/components/icons";
import { saveQuoteRequest } from "@/lib/actions/quotes";
import {
  BRAND,
  productMessage,
  whatsappLink,
  type Product,
} from "@/lib/catalog";

export function ProductQuote({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(1);

  return (
    <div className="rounded-2xl border border-soil-200 bg-white p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-lg font-semibold text-soil-900">Prix sur demande</p>
          <p className="text-xs text-soil-500">
            Devis personnalisé selon quantité et configuration
          </p>
        </div>
        <div className="flex items-center gap-1 rounded-full border border-soil-200 bg-white p-1">
          <button
            type="button"
            onClick={() => setQuantity((value) => Math.max(1, value - 1))}
            className="flex h-8 w-8 items-center justify-center rounded-full text-soil-900 transition hover:bg-soil-100"
            aria-label="Diminuer la quantité"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-8 text-center text-sm font-semibold text-soil-900">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => setQuantity((value) => value + 1)}
            className="flex h-8 w-8 items-center justify-center rounded-full text-soil-900 transition hover:bg-soil-100"
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
        onClick={() => {
          // Enregistre la demande côté serveur sans bloquer l'ouverture de WhatsApp.
          void saveQuoteRequest({
            name: "",
            productSlug: product.slug,
            quantity,
            message: product.name,
            source: "fiche-produit",
          });
        }}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-whatsapp px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-whatsapp-hover"
      >
        <WhatsApp className="h-5 w-5" />
        Demander un devis sur WhatsApp
      </a>

      <a
        href={`tel:${BRAND.phoneRaw}`}
        className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-soil-300 bg-white px-4 py-3 text-sm font-semibold text-soil-900 transition hover:border-water-300 hover:bg-water-50/40"
      >
        <Phone className="h-4 w-4 text-water-600" />
        Appeler {BRAND.phoneDisplay}
      </a>
    </div>
  );
}
