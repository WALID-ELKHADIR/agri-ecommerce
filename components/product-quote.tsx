"use client";

import { useState } from "react";
import { Minus, Phone, Plus, WhatsApp } from "@/components/icons";
import { AddToQuoteButton } from "@/components/quote-list/add-to-quote-button";
import { WhatsAppLink } from "@/components/whatsapp-link";
import {
  BRAND,
  productMessage,
  type Product,
} from "@/lib/catalog";

/** Reçoit seulement le nom et le slug : rien d'autre n'est envoyé au navigateur. */
export function ProductQuote({ product }: { product: Pick<Product, "slug" | "name"> }) {
  const [quantity, setQuantity] = useState(1);
  // Ce produit seul : la liste de devis a son propre envoi.
  const message = productMessage(product, quantity);

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
            onClick={() => setQuantity((value) => Math.min(99, value + 1))}
            className="flex h-8 w-8 items-center justify-center rounded-full text-soil-900 transition hover:bg-soil-100"
            aria-label="Augmenter la quantité"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <AddToQuoteButton product={{ slug: product.slug, name: product.name }} quantity={quantity} className="w-full" />
        <WhatsAppLink
          source="fiche-produit"
          message={message}
          product={{ slug: product.slug, quantity }}
          className="flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-whatsapp px-4 text-sm font-semibold text-white transition hover:bg-whatsapp-hover"
        >
          <WhatsApp className="h-5 w-5" />
          Devis WhatsApp
        </WhatsAppLink>
      </div>

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
