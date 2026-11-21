import { WhatsApp } from "@/components/icons";
import { getDictionary } from "@/lib/i18n/server";
import { MobileQuoteButton } from "@/components/quote-list/mobile-quote-button";
import { WhatsAppServerLink } from "@/components/whatsapp-server-link";
import { generalMessage } from "@/lib/catalog";

/** Barre d'action mobile : WhatsApp direct et, si elle n'est pas vide, la liste de devis. */
export async function MobileCta() {
  const t = await getDictionary();
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-soil-200 bg-soil-50/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur md:hidden">
      <div className="flex gap-2">
        <MobileQuoteButton />
        <WhatsAppServerLink
          source="barre-mobile"
          message={generalMessage()}
          className="wa-pulse flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-whatsapp px-4 text-sm font-semibold text-white shadow-lg shadow-field-900/10 transition active:scale-[0.99]"
        >
          <WhatsApp className="h-4 w-4" />
          {t.mobileFreeQuote}
        </WhatsAppServerLink>
      </div>
    </div>
  );
}
