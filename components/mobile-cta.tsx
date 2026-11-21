import { WhatsApp } from "@/components/icons";
import { MobileQuoteButton } from "@/components/quote-list/mobile-quote-button";
import { WhatsAppLink } from "@/components/whatsapp-link";
import { generalMessage } from "@/lib/catalog";

/** Barre d'action mobile : WhatsApp direct et, si elle n'est pas vide, la liste de devis. */
export function MobileCta() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-soil-200 bg-soil-50/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur md:hidden">
      <div className="flex gap-2">
        <MobileQuoteButton />
        <WhatsAppLink
          source="barre-mobile"
          message={generalMessage()}
          className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-whatsapp px-4 text-sm font-semibold text-white shadow-lg shadow-field-900/10 transition active:scale-[0.99]"
        >
          <WhatsApp className="h-4 w-4" />
          Devis gratuit sur WhatsApp
        </WhatsAppLink>
      </div>
    </div>
  );
}
