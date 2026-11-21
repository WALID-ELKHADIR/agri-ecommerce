import { WhatsApp } from "@/components/icons";
import { AddToQuoteButton } from "@/components/quote-list/add-to-quote-button";
import { WhatsAppLink } from "@/components/whatsapp-link";
import { productMessage, type Product } from "@/lib/catalog";

/** Barre collante mobile de la fiche : ajouter au devis ou demander ce produit sur WhatsApp. */
export function StickyBar({ product }: { product: Product }) {
  const message = productMessage(product, 1);
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-soil-200 bg-soil-50/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur md:hidden">
      <div className="flex gap-2">
        <AddToQuoteButton product={{ slug: product.slug, name: product.name }} className="flex-1" />
        <WhatsAppLink
          source="barre-mobile"
          message={message}
          product={{ slug: product.slug, quantity: 1 }}
          aria-label={`Demander un devis WhatsApp pour ${product.name}`}
          className="flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-whatsapp px-5 text-sm font-semibold text-white"
        >
          <WhatsApp className="h-5 w-5" />
          WhatsApp
        </WhatsAppLink>
      </div>
    </div>
  );
}
