import { WhatsApp } from "@/components/icons";
import { generalMessage, whatsappLink } from "@/lib/catalog";

export function MobileCta() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-[#f5f8fb]/95 p-3 backdrop-blur md:hidden">
      <a
        href={whatsappLink(generalMessage())}
        target="_blank"
        rel="noopener noreferrer"
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1FA855] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-900/10 transition active:scale-[0.99]"
      >
        <WhatsApp className="h-4 w-4" />
        Devis gratuit sur WhatsApp
      </a>
    </div>
  );
}
