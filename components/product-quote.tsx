"use client";

import { useState } from "react";
import { Minus, Phone, Plus, WhatsApp } from "@/components/icons";
import { useLocale } from "@/components/i18n/locale-provider";
import { AddToQuoteButton } from "@/components/quote-list/add-to-quote-button";
import { WhatsAppLink } from "@/components/whatsapp-link";
import { useWhatsappContact } from "@/components/whatsapp-provider";
import { BRAND, type Product } from "@/lib/catalog";
import { productMessage } from "@/lib/whatsapp";

/** Reçoit seulement le nom et le slug : rien d'autre n'est envoyé au navigateur. */
export function ProductQuote({ product }: { product: Pick<Product, "slug" | "name"> }) {
  const { t } = useLocale();
  const contact = useWhatsappContact();
  const [quantity, setQuantity] = useState(1);
  // Ce produit seul : la liste de devis a son propre envoi.
  const message = productMessage(product, quantity, BRAND.siteUrl, t);

  return (
    <div className="rounded-2xl border border-soil-200 bg-white p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-lg font-semibold text-soil-900">{t.ui.priceOnRequest}</p>
          <p className="text-xs text-soil-500">{t.ui.customQuote}</p>
        </div>
        <div className="flex items-center gap-1 rounded-full border border-soil-200 bg-white p-1">
          <button
            type="button"
            onClick={() => setQuantity((value) => Math.max(1, value - 1))}
            className="flex h-8 w-8 items-center justify-center rounded-full text-soil-900 transition hover:bg-soil-100"
            aria-label={t.ui.decrease}
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-8 text-center text-sm font-semibold text-soil-900">{quantity}</span>
          <button
            type="button"
            onClick={() => setQuantity((value) => Math.min(99, value + 1))}
            className="flex h-8 w-8 items-center justify-center rounded-full text-soil-900 transition hover:bg-soil-100"
            aria-label={t.ui.increase}
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <AddToQuoteButton
          product={{ slug: product.slug, name: product.name }}
          quantity={quantity}
          className="w-full"
          labels={{ add: t.addToQuote, added: t.added, aria: t.ui.addToQuoteFor(product.name) }}
        />
        <WhatsAppLink
          source="fiche-produit"
          message={message}
          product={{ slug: product.slug, quantity }}
          className="flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-whatsapp px-4 text-sm font-semibold text-white transition hover:bg-whatsapp-hover"
        >
          <WhatsApp className="h-5 w-5" />
          {t.quoteWhatsapp}
        </WhatsAppLink>
      </div>

      <a
        href={`tel:${contact.phoneRaw}`}
        className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-soil-300 bg-white px-4 py-3 text-sm font-semibold text-soil-900 transition hover:border-water-300 hover:bg-water-50/40"
      >
        <Phone className="h-4 w-4 text-water-600" />
        <span>
          {t.ui.call("")}
          <bdi dir="ltr">{contact.phoneDisplay}</bdi>
        </span>
      </a>
    </div>
  );
}
