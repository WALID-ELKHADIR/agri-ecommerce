import { WhatsAppAnchor, type WhatsAppAnchorProps } from "@/components/whatsapp-anchor";
import { getSiteSettings } from "@/lib/site-settings";

/**
 * Lien WhatsApp des composants serveur : numéro des réglages de l'admin
 * (lecture en cache), aucun JavaScript propre à hydrater.
 */
export async function WhatsAppServerLink(props: Omit<WhatsAppAnchorProps, "number">) {
  const settings = await getSiteSettings();
  return <WhatsAppAnchor number={settings.whatsappNumber} {...props} />;
}
