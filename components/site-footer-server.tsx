import { SiteFooter } from "@/components/site-footer";
import { getSiteSettings } from "@/lib/site-settings";

/** Pied de page des pages serveur, avec les coordonnées des réglages de l'admin. */
export async function SiteFooterWithSettings() {
  return <SiteFooter brand={await getSiteSettings()} />;
}
