/**
 * Fusion des réglages modifiables dans l'admin (table `settings`) avec la
 * configuration issue des variables d'environnement. Module pur, testé.
 */
import { phoneDigits, type SiteConfig } from "./site-config.ts";

/** Coordonnées enregistrées dans l'admin (clé `contact`) ; champ vide = valeur d'env. */
export type ContactSettings = {
  whatsappNumber?: string;
  phone?: string;
  email?: string;
  address?: string;
  hours?: string;
};

/** Numéro WhatsApp par région (clé `whatsapp_regions`), préparé pour le routage. */
export type WhatsappRegion = { region: string; number: string };

export type SiteSettings = SiteConfig & { whatsappRegions: WhatsappRegion[] };

function text(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

export function mergeSiteSettings(
  config: SiteConfig,
  contact: ContactSettings,
  regions: WhatsappRegion[],
): SiteSettings {
  const whatsapp = phoneDigits(contact.whatsappNumber);
  const phone = text(contact.phone);
  const phoneNumber = phoneDigits(phone);

  return {
    ...config,
    whatsappNumber: whatsapp ?? config.whatsappNumber,
    phoneDisplay: phone && phoneNumber ? phone : config.phoneDisplay,
    phoneRaw: phoneNumber ? `+${phoneNumber}` : config.phoneRaw,
    email: text(contact.email) ?? config.email,
    address: text(contact.address) ?? config.address,
    hours: text(contact.hours) ?? config.hours,
    whatsappRegions: regions.flatMap(({ region, number }) => {
      const digits = phoneDigits(number);
      const name = text(region);
      return digits && name ? [{ region: name, number: digits }] : [];
    }),
  };
}

/** Saisie de l'admin : une ligne « Région : numéro » par région. */
export function parseRegions(input: string): WhatsappRegion[] {
  return input
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.includes(":"))
    .map((line) => {
      const [region, ...rest] = line.split(":");
      return { region: region.trim(), number: rest.join(":").trim() };
    })
    .filter((entry) => entry.region && entry.number);
}

export function regionsToText(regions: WhatsappRegion[]): string {
  return regions.map(({ region, number }) => `${region} : ${number}`).join("\n");
}
