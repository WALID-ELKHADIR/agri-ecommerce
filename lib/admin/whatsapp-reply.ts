/** Lien « Répondre sur WhatsApp » vers le client d'une demande de devis (module pur). */
import { phoneDigits } from "../site-config.ts";

export function whatsappReplyUrl(quote: { phone: string | null; name: string | null; product: string | null }): string | null {
  const number = phoneDigits(quote.phone ?? undefined);
  if (!number) return null;
  const greeting = quote.name ? `Bonjour ${quote.name},` : "Bonjour,";
  const subject = quote.product ? ` concernant « ${quote.product} »` : "";
  const message = `${greeting} merci pour votre demande de devis${subject}. `;
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
