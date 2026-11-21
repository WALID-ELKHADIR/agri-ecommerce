import { WhatsApp } from "@/components/icons";
import { AddToQuoteButton } from "@/components/quote-list/add-to-quote-button";
import { WhatsAppServerLink } from "@/components/whatsapp-server-link";
import type { Product } from "@/lib/catalog";
import { getDictionary } from "@/lib/i18n/server";
import { siteConfig } from "@/lib/site-config";
import { productMessage } from "@/lib/whatsapp";

/** Barre collante mobile de la fiche : ajouter au devis ou demander ce produit sur WhatsApp. */
export async function StickyBar({ product }: { product: Product }) {
  const t = await getDictionary();
  const message = productMessage(product, 1, siteConfig.siteUrl, t);
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-soil-200 bg-soil-50/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur md:hidden">
      <div className="flex gap-2">
        <AddToQuoteButton
          product={{ slug: product.slug, name: product.name }}
          className="flex-1"
          labels={{ add: t.addToQuote, added: t.added, aria: t.ui.addToQuoteFor(product.name) }}
        />
        <WhatsAppServerLink
          source="barre-mobile"
          message={message}
          product={{ slug: product.slug, quantity: 1 }}
          aria-label={t.ui.whatsappFor(product.name)}
          className="flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-whatsapp px-5 text-sm font-semibold text-white"
        >
          <WhatsApp className="h-5 w-5" />
          {t.ui.whatsapp}
        </WhatsAppServerLink>
      </div>
    </div>
  );
}
